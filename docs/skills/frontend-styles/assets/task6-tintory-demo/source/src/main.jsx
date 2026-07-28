import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const navItems = ['graphic', 'fashion', 'culture', 'journal', 'contact']

function Header({ page, onNavigate }) {
  const [open, setOpen] = useState(false)
  return <header className="site-header">
    <button className="brand" onClick={() => onNavigate('home')}>TINTORY</button>
    <button className="menu" onClick={() => setOpen(!open)} aria-label="menu">{open ? 'CLOSE' : 'MENU'}</button>
    <nav className={open ? 'open' : ''}>
      {navItems.map(item => <button key={item} className={page === item ? 'active' : ''} onClick={() => { onNavigate(item); setOpen(false) }}>{item}</button>)}
    </nav>
  </header>
}

const Kicker = ({children}) => <div className="kicker">{children}</div>
const Arrow = () => <span className="arrow">↗</span>

function NotePile({ onNavigate }) {
  const notes = [
    ['FILE 01 / CULTURE', 'Silver as\nAncestral Light', '苗族银饰如何成为家族、迁徙与祝福的视觉语言。', 'culture'],
    ['FILE 02 / FASHION', 'Lightness as\nResistance', 'Chanel SS26 Finds Air Within Tweed.', 'fashion'],
    ['FILE 03 / FASHION', 'Proportion Speaks\nBefore Color', '廓形先于色彩，而不是装饰。', 'fashion'],
    ['FILE 04 / GRAPHIC', 'Visual\nGrammar', 'Typography. Grid and Rhythm.', 'graphic'],
    ['FILE 05 / JOURNAL', 'Fragments\nof Time', 'Images as traces of memory.', 'journal'],
  ]
  return <div className="note-pile">
    {notes.map((n, i) => <button key={n[0]} className={`note note-${i+1}`} onClick={() => onNavigate(n[3])}>
      <small>{n[0]}</small><strong>{n[1].split('\n').map((s,j)=><React.Fragment key={s}>{s}{j===0&&<br/>}</React.Fragment>)}</strong><span>{n[2]}</span><em>FIND: {n[3]} PAGE</em>
    </button>)}
  </div>
}

function Home({ onNavigate }) {
  return <main className="page home-page">
    <section className="home-hero">
      <div className="home-title"><h1>Tintory<br/>Studio</h1></div>
      <NotePile onNavigate={onNavigate}/>
      <p className="home-copy">一个以视觉考古为方法的研究型工作室，在平面设计、时尚观察与文化探索之间，寻找被时间、身体与地域共同塑造的美学秩序。</p>
      <div className="home-meta">Visual Archaeology<br/>Established 2026</div>
      <div className="home-index">GRAPHIC<br/>FASHION<br/>CULTURE</div>
    </section>
    <section className="home-manifesto section-grid">
      <Kicker>01 / MANIFESTO</Kicker>
      <div><span className="eyebrow">A VISUAL RESEARCH STUDIO</span><h2>我们不制造风格。<br/>我们发掘结构。</h2><p>Tintory 将图像视为一种历史材料，穿梭在字体、服装、地方与记忆之间。我们关心的不是表面，而是形式如何被生活慢慢塑成。</p></div>
    </section>
  </main>
}

function Graphic() {
  return <main className="page inner-page">
    <section className="intro section-grid">
      <Kicker>GRAPHIC</Kicker>
      <div><h1>Shape before<br/><span>decoration.</span></h1><p>文字、比例与留白不是装饰，而是信息被看见的方式。我们把每一次设计都当作一次结构研究。</p></div>
      <aside className="side-list"><b>IDENTITY</b><b>EDITORIAL</b><b>TYPE SYSTEM</b><b>ART DIRECTION</b></aside>
    </section>
    <section className="graphic-cards">
      <article className="poster poster-one"><Kicker>01 / IDENTITY</Kicker><div className="plus">+</div><h3>Visual systems<br/>made to move.</h3><p>让标识、文字与网格拥有可持续生长的秩序。</p></article>
      <article className="poster poster-two"><Kicker>02 / EDITORIAL</Kicker><div className="type-sample">Aa</div><h3>The Architecture<br/>of Typography</h3><p>字体的尺度，就是内容的语气。</p></article>
      <article className="poster poster-three"><Kicker>03 / POSTER</Kicker><div className="orbit"><i></i><i></i><i></i></div><h3>Posters as<br/>Memory</h3><p>图像如何保存事件发生过的痕迹。</p></article>
    </section>
  </main>
}

function Fashion() {
  const items = [
    ['01', 'Lightness as Resistance', '轻盈不是纤弱，而是一种关于身体自由的设计立场。'],
    ['02', 'Body as Architecture', '廓形组织身体，也组织人在空间中的存在方式。'],
    ['03', 'The Silence of a Black Coat', '黑色、沉默与步伐建立一场关于身体边界的论证。'],
    ['04', 'Figures Made of Light and Skin', '皮影戏借助幕布、雕刻与光线，获得流动的新身体。'],
  ]
  return <main className="page inner-page">
    <section className="intro fashion-intro section-grid">
      <Kicker>FASHION</Kicker>
      <div><h1>Body as<br/>Architecture</h1><p>我们观察服装如何塑造身体，秀场如何组织空间，品牌如何书写时代，而风格如何成为一个人的视觉传记。</p></div>
      <aside className="side-list"><b>RUNWAY<small>秀场报道</small></b><b>BRAND ARCHIVE<small>品牌故事</small></b><b>STYLING<small>风格分析</small></b><b>PROFILES<small>人物传记</small></b></aside>
    </section>
    <section className="article-list">
      <div className="list-heading"><Kicker>III / ARCHIVE</Kicker><h2>Notes, essays and visual<br/>readings.</h2></div>
      {items.map(item => <article key={item[0]}><span>{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p><Arrow/></article>)}
    </section>
  </main>
}

const cultureCards = [
  ['/assets/miao.jpg','SOUTHWEST CHINA / MIAO','Silver as Ancestral Light','银饰不仅被佩戴在身体之上，也记录家族、迁徙与祝福。'],
  ['/assets/tibetan.jpg','TIBETAN PLATEAU / TIBETAN','Colour at the Edge of the Sky','红、白、蓝、黄与天空、土地和建筑共同构成生活的视觉秩序。'],
  ['/assets/dong.jpg','GUIZHOU / DONG','Architecture Without a Nail','榫卯将木材连接成鼓楼、风雨桥与居所。'],
]

function Culture() {
  return <main className="page inner-page">
    <section className="culture-intro section-grid">
      <Kicker>I / ETHNIC AESTHETICS</Kicker>
      <div><span className="eyebrow">REGIONAL VISUAL LANGUAGE</span><h1>Patterns carry<br/>memory before<br/>words do.</h1></div>
      <p>按地域与民族进入视觉传统：服饰、建筑、纹样、材料与色彩并非装饰性的表面，而是一个群体理解自然、身份与时间的方式。</p>
    </section>
    <section className="culture-cards">
      {cultureCards.map((card, i) => <article key={card[1]}><div className="image-wrap"><img src={card[0]} alt=""/></div><Kicker>{card[1]}</Kicker><h2 className={i===1?'gold':''}>{card[2]}</h2><p>{card[3]}</p></article>)}
    </section>
    <section className="culture-story section-grid"><Kicker>III / CULTURAL STORIES</Kicker><div><span className="eyebrow">LONG-FORM NARRATIVES</span><h2>A tradition<br/>survives each<br/>time it is retold.</h2></div><p>通过长篇叙事进入神话、民俗与工艺传承。这里关心的不只是“过去发生了什么”，更是故事如何在口述、手艺与仪式中继续改变今天。</p></section>
  </main>
}

function Bookshelf() {
  return <div className="bookshelf">
    <div className="book yellow">ON<br/>PHOTOGRAPHY</div>
    <div className="book main-book"><strong>WAYS<br/>OF<br/>SEEING</strong><b>METHOD</b><p>How vision is shaped by culture.</p><em>READ →</em></div>
    <div className="book white"></div><div className="book cream"></div><div className="book black">CAMERA<br/>LUCIDA</div><div className="book red">The Image</div>
  </div>
}

function Journal() {
  return <main className="page inner-page">
    <section className="journal-hero section-grid"><Kicker>03 /<br/>READING & REFERENCE</Kicker><Bookshelf/></section>
    <section className="journal-list"><Kicker>III / ARCHIVE</Kicker><div><span className="eyebrow">ARCHIVE LIST</span><h1>Notes, essays and visual<br/>readings.</h1><div className="filters"><b>ALL</b><span>RUNWAY</span><span>BRAND ARCHIVE</span><span>STYLING</span><span>PROFILES</span></div>{['The Silence of a Black Coat','Miu Miu and the Grammar of Youth','Why Minimalism Feels Powerful'].map((x,i)=><article key={x}><Kicker>2026 / {i?'BRAND ARCHIVE':'RUNWAY'}</Kicker><h2>{x}</h2><p>一则关于视觉、身体与时代语法的观察笔记。</p><Arrow/></article>)}</div></section>
  </main>
}

function Contact() {
  return <main className="page inner-page contact-page">
    <section className="contact-intro section-grid"><Kicker>01 /<br/>INTRO</Kicker><div><span className="eyebrow">STUDIO COLLABORATION</span><h1>Let's create<br/>something<br/>meaningful.</h1><div className="contact-copy"><p>Hi, I'm Mia.</p><p>I am a photographer and designer exploring the relationship between images, culture and visual narratives.</p><p>Through photography and visual design, I create emotional experiences grounded in research.</p></div></div></section>
    <section className="contact-details"><Kicker>02 / CONTACT</Kicker><a href="mailto:hello@tintory.studio">HELLO@TINTORY.STUDIO <Arrow/></a><div><span>SHANGHAI / CHINA</span><span>INSTAGRAM</span><span>BEHANCE</span></div></section>
  </main>
}

const pages = { home: Home, graphic: Graphic, fashion: Fashion, culture: Culture, journal: Journal, contact: Contact }

function App() {
  const getPage = () => window.location.hash.replace('#/','') || 'home'
  const [page, setPage] = useState(getPage)
  useEffect(() => { const sync = () => setPage(getPage()); addEventListener('hashchange', sync); return () => removeEventListener('hashchange', sync) }, [])
  const navigate = next => { window.location.hash = next === 'home' ? '/' : `/${next}`; setPage(next); window.scrollTo({top:0,behavior:'smooth'}) }
  const Page = pages[page] || Home
  return <><Header page={page} onNavigate={navigate}/><div key={page} className="page-enter"><Page onNavigate={navigate}/></div><button className="to-top" onClick={() => scrollTo({top:0,behavior:'smooth'})}>↑</button></>
}

createRoot(document.getElementById('root')).render(<App/>)
