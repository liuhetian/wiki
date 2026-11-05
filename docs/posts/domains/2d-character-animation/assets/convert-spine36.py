"""Convert Spine 3.6 binary data to the matching JSON format for local preview.
Format reference: EsotericSoftware/spine-runtimes, 3.6, SkeletonBinary.cs.
"""
import json, struct, sys
from pathlib import Path

class Reader:
    def __init__(self, data): self.data, self.p = data, 0
    def take(self,n):
        out=self.data[self.p:self.p+n]
        if len(out)!=n: raise EOFError(self.p)
        self.p+=n
        return out
    def b(self): return self.take(1)[0]
    def boolean(self): return bool(self.b())
    def f(self): return struct.unpack('>f',self.take(4))[0]
    def color(self): return self.take(4).hex()
    def v(self,positive=True):
        x=0
        for shift in range(0,35,7):
            b=self.b(); x|=(b&127)<<shift
            if not b&128: break
        if positive: return x-(1<<32) if x&(1<<31) else x
        return (x>>1)^-(x&1)
    def s(self):
        n=self.v()
        return None if n==0 else self.take(n-1).decode('utf-8')
    def floats(self,n): return [self.f() for _ in range(n)]
    def shorts(self): return [struct.unpack('>H',self.take(2))[0] for _ in range(self.v())]
    def values(self,keys): return {k:self.f() for k in keys.split()}
    def vertices(self,n):
        if not self.boolean(): return self.floats(n*2)
        out=[]
        for _ in range(n):
            count=self.v();out.append(count)
            for _ in range(count): out.extend([self.v(),*self.floats(3)])
        return out
    def curve(self,frame):
        t=self.b()
        if t==1: frame['curve']='stepped'
        elif t==2: frame['curve']=self.floats(4)
        elif t!=0: raise ValueError(('curve', t,self.p))
    def frames(self,count,keys,extra=None,curves=True):
        out=[]
        for i in range(count):
            frame=self.values('time'+(' '+keys if keys else ''))
            if extra: frame.update(extra())
            if curves and i<count-1: self.curve(frame)
            out.append(frame)
        return out

def convert(data):
    r=Reader(data)
    info={'hash':r.s(),'spine':r.s(),**r.values('width height')}
    if not info['spine'].startswith('3.6.'): raise ValueError(info)
    nonessential=r.boolean()
    if nonessential: info.update(fps=r.f(),images=r.s() or '')
    result={'skeleton':info,'bones':[],'slots':[],'ik':[],'transform':[],'path':[],'skins':{},'events':{},'animations':{}}
    bones,slots=result['bones'],result['slots']
    for i in range(r.v()):
        b={'name':r.s()}
        if i: b['parent']=bones[r.v()]['name']
        b.update(r.values('rotation x y scaleX scaleY shearX shearY length'))
        b['transform']=['normal','onlyTranslation','noRotationOrReflection','noScale','noScaleOrReflection'][r.v()]
        if nonessential: b['color']=r.color()
        bones.append(b)
    for _ in range(r.v()):
        s={'name':r.s(),'bone':bones[r.v()]['name'],'color':r.color()}
        dark=r.color()
        if dark!='ffffffff': s['dark']=dark[2:]
        attachment=r.s()
        if attachment is not None: s['attachment']=attachment
        s['blend']=['normal','additive','multiply','screen'][r.v()]
        slots.append(s)
    for _ in range(r.v()):
        c={'name':r.s(),'order':r.v(),'bones':[bones[r.v()]['name'] for _ in range(r.v())],'target':bones[r.v()]['name'],'mix':r.f(),'bendPositive':r.b()==1}
        result['ik'].append(c)
    for _ in range(r.v()):
        c={'name':r.s(),'order':r.v(),'bones':[bones[r.v()]['name'] for _ in range(r.v())],'target':bones[r.v()]['name'],'local':r.boolean(),'relative':r.boolean()}
        c.update(r.values('rotation x y scaleX scaleY shearY rotateMix translateMix scaleMix shearMix'))
        result['transform'].append(c)
    for _ in range(r.v()):
        c={'name':r.s(),'order':r.v(),'bones':[bones[r.v()]['name'] for _ in range(r.v())],'target':slots[r.v()]['name']}
        for key,options in [('positionMode',['fixed','percent']),('spacingMode',['length','fixed','percent']),('rotateMode',['tangent','chain','chainScale'])]: c[key]=options[r.v()]
        c.update(r.values('rotation position spacing rotateMix translateMix'));result['path'].append(c)
    def skin():
        out={}
        for _ in range(r.v()):
            slot=slots[r.v()]['name']; out[slot]={}
            for _ in range(r.v()):
                key=r.s();name=r.s() or key;t=r.b();a={'name':name,'type':['region','boundingbox','mesh','linkedmesh','path','point','clipping'][t]}
                if t==0:
                    a['path']=r.s() or name;a.update(r.values('rotation x y scaleX scaleY width height'));a['color']=r.color()
                elif t==1:
                    n=r.v();a.update(vertexCount=n,vertices=r.vertices(n))
                    if nonessential: a['color']=r.color()
                elif t==2:
                    a.update(path=r.s() or name,color=r.color());n=r.v();a['uvs']=r.floats(n*2);a['triangles']=r.shorts();a['vertices']=r.vertices(n);a['hull']=r.v()
                    if nonessential: a['edges']=r.shorts();a.update(r.values('width height'))
                elif t==3:
                    a.update(path=r.s() or name,color=r.color());sk=r.s()
                    if sk is not None: a['skin']=sk
                    a.update(parent=r.s(),deform=r.boolean())
                    if nonessential: a.update(r.values('width height'))
                elif t==4:
                    a.update(closed=r.boolean(),constantSpeed=r.boolean());n=r.v();a.update(vertexCount=n,vertices=r.vertices(n),lengths=r.floats(n//3))
                    if nonessential: a['color']=r.color()
                elif t==5:
                    a.update(r.values('rotation x y'))
                    if nonessential: a['color']=r.color()
                elif t==6:
                    a['end']=slots[r.v()]['name'];n=r.v();a.update(vertexCount=n,vertices=r.vertices(n))
                    if nonessential: a['color']=r.color()
                out[slot][key]=a
        return out
    default=skin()
    if default: result['skins']['default']=default
    for _ in range(r.v()):
        name=r.s();result['skins'][name]=skin()
    for _ in range(r.v()):
        name=r.s();result['events'][name]={'int':r.v(False),'float':r.f(),'string':r.s() or ''}
    def animation():
        a={'slots':{},'bones':{},'ik':{},'transform':{},'paths':{},'deform':{},'drawOrder':[],'events':[]}
        for _ in range(r.v()):
            name=slots[r.v()]['name'];ts=a['slots'][name]={}
            for _ in range(r.v()):
                t=r.b();count=r.v()
                if t==0: ts['attachment']=r.frames(count,'',lambda:{'name':r.s()},False)
                elif t==1: ts['color']=r.frames(count,'',lambda:{'color':r.color()})
                elif t==2: ts['twoColor']=r.frames(count,'',lambda:{'light':r.color(),'dark':r.color()[2:]})
                else: raise ValueError(('slot timeline',t,r.p))
        for _ in range(r.v()):
            name=bones[r.v()]['name'];ts=a['bones'][name]={}
            for _ in range(r.v()):
                t=r.b();count=r.v();ts[['rotate','translate','scale','shear'][t]]=r.frames(count,'angle' if t==0 else 'x y')
        for _ in range(r.v()):
            name=result['ik'][r.v()]['name'];count=r.v();a['ik'][name]=r.frames(count,'mix',lambda:{'bendPositive':r.b()==1})
        for _ in range(r.v()):
            name=result['transform'][r.v()]['name'];count=r.v();a['transform'][name]=r.frames(count,'rotateMix translateMix scaleMix shearMix')
        for _ in range(r.v()):
            name=result['path'][r.v()]['name'];ts=a['paths'][name]={}
            for _ in range(r.v()):
                t=r.b();count=r.v();ts[['position','spacing','mix'][t]]=r.frames(count,['position','spacing','rotateMix translateMix'][t])
        for _ in range(r.v()):
            name=list(result['skins'])[r.v()];ss=a['deform'][name]={}
            for _ in range(r.v()):
                slot=slots[r.v()]['name'];ts=ss[slot]={}
                for _ in range(r.v()):
                    attachment=r.s();count=r.v()
                    def deform():
                        n=r.v()
                        return {'offset':r.v(),'vertices':r.floats(n)} if n else {}
                    ts[attachment]=r.frames(count,'',deform)
        for _ in range(r.v()):
            f={'time':r.f(),'offsets':[]}
            for _ in range(r.v()): f['offsets'].append({'slot':slots[r.v()]['name'],'offset':r.v()})
            a['drawOrder'].append(f)
        for _ in range(r.v()):
            f={'time':r.f(),'name':list(result['events'])[r.v()],'int':r.v(False),'float':r.f()}
            f['string']=r.s() if r.boolean() else result['events'][f['name']]['string'];a['events'].append(f)
        return {k:v for k,v in a.items() if v}
    count=r.v()
    for i in range(count):
        if r.p == len(data):
            print(f'Note: header declares {count} animations; {i} complete animations are present.')
            break
        name=r.s();result['animations'][name]=animation()
    if r.p!=len(data): raise ValueError(f'Unconsumed bytes: {len(data)-r.p}')
    return result

if __name__=='__main__':
    output=convert(Path(sys.argv[1]).read_bytes())
    Path(sys.argv[2]).write_text(json.dumps(output,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    print('Converted:',output['skeleton']['spine'], 'bones:',len(output['bones']), 'animations:',list(output['animations']))
