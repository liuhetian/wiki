// The seven sections of the poster video. Copy is our own; the structure (section number, two-line
// headline, one subline, progress rule) follows the reference. Camera: target, azimuth (0 = looking
// from +z toward -z; negative swings the camera toward -x), elevation, and how many world units must
// fit in the content area.
export const SECTIONS = [
  {
    id: '01', name: '小小港口', head: ['一块方方正正的海', '装下了一整座港口'], sub: '从一句「想要一座海边小镇」开始。',
    cam: { target: [0, -2.6, 0.5], az: -0.8, el: 0.58, fit: 54 }, fade: 0, dur: 9,
  },
  {
    id: '02', name: '港口作业', head: ['两台岸桥吊机', '轮流把箱子搬上岸'], sub: '货轮靠泊 · 小拖轮待命 · 吊臂随时起落',
    cam: { target: [8.6, 3.2, -9.5], az: -0.72, el: 0.5, fit: 23 }, fade: 1, dur: 9, drift: 0.012,
  },
  {
    id: '03', name: '樱花街区', head: ['樱花开到', '鱼市场门口'], sub: '鸟居、鲜鱼摊、长屋檐，街上有人在逛。',
    cam: { target: [13.6, 1.8, 6.2], az: -1.02, el: 0.6, fit: 15.5 }, fade: 1, dur: 9, drift: -0.01,
  },
  {
    id: '04', name: '海边散步', head: ['沿着木栈道', '走到灯塔下面'], sub: '渔台边泊着小船，海鸥绕着码头飞。',
    cam: { target: [1.5, 0.6, 11.5], az: -0.62, el: 0.42, fit: 20 }, fade: 1, dur: 9, drift: 0.012,
  },
  {
    id: '05', name: '水下世界', head: ['往水面下看', '鱼群在海草间穿梭'], sub: '水母 · 海星 · 旧锚链 · 沉船骨架',
    cam: { target: [-14.2, -3.6, -2.5], az: -1.25, el: 0.95, fit: 16 }, fade: 1, dur: 10, surface: 0.35, drift: 0.01,
  },
  {
    id: '06', name: '真实交互', head: ['点一下水面', '它会轻轻晃起来'], sub: '点水面起涟漪；长按水面再拖，推开一圈圈浪。',
    cam: { target: [-0.5, -2.8, 0.5], az: -0.78, el: 0.6, fit: 52 }, fade: 0, dur: 11, demo: true,
  },
  {
    id: '07', name: '轮到你了', head: ['剩下的', '交给你来玩'], sub: '拖动转视角、滚轮缩放；双击水面，掀起一道大浪。',
    cam: { target: [0, -2.6, 0.5], az: -0.88, el: 0.6, fit: 55 }, fade: 0, dur: 10, drift: 0.02,
  },
];
