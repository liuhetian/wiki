import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const files = [
  { id: 'echo', no: '01', title: '回声', subtitle: 'ECHOES', year: '2021' },
  { id: 'peach', no: '02', title: '误入桃源', subtitle: 'THE PEACH SPRING', year: '2022' },
  { id: 'sleep', no: '03', title: '眠史', subtitle: 'THE HISTORY OF SLEEP', year: '2022' },
  { id: 'reverse', no: '04', title: '逆溯备忘录', subtitle: 'REVERSE MEMORANDUM', year: '2023' },
  { id: 'specimen', no: '05', title: '夜航样本', subtitle: 'NIGHT SPECIMEN', year: '2024' },
  { id: 'tide', no: '06', title: '潮汐信札', subtitle: 'TIDAL LETTERS', year: '2024' },
  { id: 'garden', no: '07', title: '无声花园', subtitle: 'THE SILENT GARDEN', year: '2025' },
  { id: 'latitude', no: '08', title: '失落纬度', subtitle: 'LOST LATITUDES', year: '2026' },
]

const TRACK_START = 7
const TRACK_STEP = 16.5
const TRACK_END = 80

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reduced
}

function Mark({ index, opening = false, reducedMotion = false }) {
  const styles = [
    { wash: '#c7d8d4', ink: '#536f73' },
    { wash: '#cbded5', ink: '#2b5a60' },
    { wash: '#b9d1de', ink: '#31566d' },
    { wash: '#d5d0d9', ink: '#6d5b6b' },
    { wash: '#b7ced2', ink: '#284d5b' },
  ][index % 5]
  return (
    <svg className="mark" viewBox="0 0 220 230" aria-hidden="true">
      <defs>
        <filter id={`wash-${index}`} x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency=".018 .085" numOctaves="2" seed={index + 4} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" />
          <feGaussianBlur stdDeviation="2.1" />
        </filter>
      </defs>
      <g opacity=".64" filter={`url(#wash-${index})`}>
        <ellipse cx="110" cy="164" rx="72" ry="18" fill={styles.wash} transform={`rotate(${index % 2 ? -8 : 6} 110 164)`} />
        <ellipse cx="92" cy="179" rx="48" ry="13" fill={styles.wash} opacity=".58" />
        <path d="M46 172C78 148 137 148 177 177C144 168 109 197 46 172Z" fill={styles.ink} opacity=".38" />
      </g>
      {/*
        绳结始终只有原来的两股绳，不额外生成“放射线”。opening 时两条路径按
        松环 → 滑离上铆钉 → 短距离垂落 三段插值；.68s 必须与纸张出现延迟同步。
      */}
      <g className={`mark-strands ${opening ? 'is-untying' : ''}`} fill="none" stroke={styles.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path className="cord cord--left" d="M110 49C108 61 91 66 93 81C95 96 125 99 127 113C129 125 116 134 110 139">
          {opening && !reducedMotion && <animate attributeName="d" dur=".68s" fill="freeze" calcMode="spline"
            keyTimes="0;.34;.68;1" keySplines=".22 .72 .2 1;.18 .7 .2 1;.25 .8 .25 1"
            values="M110 49C108 61 91 66 93 81C95 96 125 99 127 113C129 125 116 134 110 139;M108 51C102 62 91 68 93 82C96 97 124 100 129 113C133 124 127 134 117 141;M102 55C94 63 90 72 94 85C100 100 125 101 133 114C138 123 137 133 131 142;M96 60C90 69 91 81 100 91C110 102 126 105 134 120C138 128 139 136 138 144" />}
        </path>
        <path className="cord cord--right" d="M110 49C112 61 129 66 127 81C125 96 95 99 93 113C91 125 104 134 110 139">
          {opening && !reducedMotion && <animate attributeName="d" dur=".68s" fill="freeze" calcMode="spline"
            keyTimes="0;.34;.68;1" keySplines=".22 .72 .2 1;.18 .7 .2 1;.25 .8 .25 1"
            values="M110 49C112 61 129 66 127 81C125 96 95 99 93 113C91 125 104 134 110 139;M112 51C118 62 129 68 127 82C124 97 96 100 91 113C87 124 93 134 103 141;M118 55C126 63 130 72 126 85C120 100 95 101 87 114C82 123 83 133 89 142;M124 60C130 69 129 81 120 91C110 102 94 105 86 120C82 128 81 136 82 144" />}
        </path>
      </g>
      <circle cx="110" cy="42" r="12" fill="#f2ecda" stroke="#88918b" strokeWidth="1" opacity=".92" />
      <circle cx="110" cy="42" r="7" fill="#a04442" />
      <circle cx="110" cy="42" r="2.2" fill="#ead9b8" />
      <circle cx="110" cy="145" r="12" fill="#f2ecda" stroke="#88918b" strokeWidth="1" opacity=".92" />
      <circle cx="110" cy="145" r="7" fill="#a04442" />
      <circle cx="110" cy="145" r="2.2" fill="#ead9b8" />
      {index === 1 && <g fill="#bd6862" opacity=".7"><circle cx="75" cy="109" r="2"/><circle cx="142" cy="98" r="2.3"/><circle cx="85" cy="129" r="1.8"/><circle cx="149" cy="124" r="1.7"/></g>}
    </svg>
  )
}

function FileCard({ file, index, total, onOpen, hovered, onHover, opening, reducedMotion }) {
  const hasHover = hovered !== null
  // 只允许 React 的 is-active 控制转正；不要再添加 CSS :hover 放大，否则会同时弹出两张档案。
  const isActive = opening || hovered === index
  // 固定 16.5% 间距让封面标签可读；超出视口的档案通过拖动/滚轮带入画面。
  const baseX = TRACK_START + index * TRACK_STEP
  // 档案越多默认越侧放：5 张约 18°，当前 8 张约 45°。背景卡片不跟随当前卡片改变朝向。
  const densityYaw = Math.max(0, total - 5) * 9
  const yaw = isActive ? 0 : -18 - densityYaw + index * .6
  const roll = isActive ? 0 : -1.8 + index * (3.4 / Math.max(total - 1, 1))
  const depth = isActive ? 210 : -42 - index * 7
  const scale = isActive ? 1.48 : total > 5 ? .9 : .96
  return (
    <button
      className={`file-card ${isActive ? 'is-active' : ''} ${hasHover && !isActive ? 'is-receding' : ''} ${opening ? 'is-opening' : ''}`}
      style={{
        '--i': index,
        '--card-x': `${baseX}%`,
        '--yaw': `${yaw}deg`,
        '--roll': `${roll}deg`,
        '--depth': `${depth}px`,
        '--card-scale': scale,
      }}
      data-file-index={index}
      onPointerEnter={() => onHover(index)}
      onMouseEnter={() => onHover(index)}
      onFocus={() => onHover(index)}
      onBlur={() => !opening && onHover(null)}
      onClick={(event) => onOpen(file, index, event.currentTarget)}
      aria-label={`打开档案：${file.title}`}
    >
      <span className="folder-tab" />
      <Mark index={index} opening={opening} reducedMotion={reducedMotion} />
      <span className="file-label">
        <b>{file.title}</b>
        <small>{file.subtitle}</small>
      </span>
      <span className="file-meta">ARCHIVE {file.no} · {file.year}</span>
    </button>
  )
}

function Header({ activeNo, count }) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="回到首页">WORLD FILES<span>世界档案 · 世界观察局</span></a>
      <div className="index-counter"><span>个人作品集 / 档案索引</span><b>{activeNo ? `WF–${activeNo}` : `${String(count).padStart(2, '0')} FILES`}</b></div>
    </header>
  )
}

function ArchiveDetail({ file, onClose }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  return (
    <div className="letter-content">
      <nav className="letter-nav">
        <button ref={closeButtonRef} onClick={onClose}><span>←</span> 返回档案架</button>
        <span>OPEN LETTER　·　WF–{file.no}</span>
        <a href="#concept">PORTFOLIO COPY</a>
      </nav>
      <article className="letter-body">
        <div className="eyebrow">文学实验　·　视觉叙事　·　概念设计</div>
        <div className="title-row">
          <h2 id="archive-title">{file.title}</h2>
          <div className="archive-stamp">WORLD<br/>FILES<span>ARCHIVE</span></div>
        </div>
        <div className="rule" />
        <p className="lead">《{file.title}》是一份关于记忆、空间与叙述偏差的世界观档案。它把一个看似完整的地方拆成可以被观察、记录与反复质疑的规则。</p>
        <div className="tags"><span>LITERARY ADAPTATION</span><span>NARRATIVE PUZZLE</span><span>WORLD BUILDING</span></div>
        <section id="concept">
          <h3>01 · 核心概念</h3>
          <h4>被记录的世界</h4>
          <p>档案中的世界并不是等待探索的固定地图，而是一组会因观察者而改变的证词。人物对同一段经历拥有不同版本，地点也会随着记录方式改变边界。读者需要从互相矛盾的材料里判断：哪些是真实发生的事件，哪些只是为了让世界继续运转而被共同相信的故事。</p>
          <p>这种不稳定性并非谜底揭晓前的障眼法，而是世界本身的基本规则。每一次翻阅、批注和重新归档都会留下痕迹，让“阅读档案”成为叙事的一部分。</p>
        </section>
        <section id="rules">
          <h3>02 · 世界规则</h3>
          <h4>不可复返</h4>
          <p>漂泊中的旅者误入一处从未被正式记录的聚落。每次回望，来路都会减少一个细节；每次试图留下，记忆里便多出一道无法解释的裂隙。离开并不意味着走出边界，而是逐渐失去证明自己曾经抵达的能力。</p>
          <blockquote>“有些地方不是找不到，而是只允许被找到一次。”</blockquote>
          <p>规则通过缺页、重复编号、相互覆盖的地图和逐渐变化的称谓呈现。它们不会由旁白一次解释清楚，而是在多份材料之间保持一致，让读者能够自行验证。</p>
        </section>
        <section id="structure">
          <h3>03 · 叙事结构</h3>
          <h4>记录与遗忘</h4>
          <p>纸张上的批注、被水浸开的地图、口述片段与失效的时间表共同组成叙事。每一份材料只承担一个局部视角，重要信息则通过不同材料间的重合和冲突浮现。</p>
          <p>读者不是旁观者，而是负责整理证据的最后一位档案员。章节顺序可以被打乱，但关键线索会形成足够稳定的路径，使自由阅读不会破坏故事的理解。</p>
        </section>
        <section id="visual">
          <h3>04 · 视觉系统</h3>
          <h4>纸张、校勘与水痕</h4>
          <p>低饱和纸色建立长期保存的物质感，红色校勘标记负责提示人为干预，水墨状图形则对应无法被精确归类的内容。标签、编号和页边索引保持克制，让视觉信息像真实工作文件一样可以快速扫描。</p>
          <p>档案袋的厚边、袋口阴影和底部投影共同制造轻量的 2.5D 体积；所有文字与图形跟随同一张卡片旋转，Hover 时才完整转向阅读者。</p>
        </section>
        <section id="review">
          <h3>05 · 项目复盘</h3>
          <h4>从观看转向参与</h4>
          <p>这一套展示方式的核心并不是模拟真实档案管理，而是把作品集的选择动作变成一次带有仪式感的开启。卡片侧放时强调数量与层次，转正时强调当前选择，解结和展开则把短暂的等待转化成进入故事的过渡。</p>
          <p>后续内容可以继续复用同一结构，只替换标题、摘要与关键段落。这样既保留统一的交互语言，也避免为了演示前端效果维护八套完全独立的页面系统。</p>
        </section>
      </article>
      <aside className="chapter-index" aria-label="章节索引">
        <a href="#concept">01 · 核心概念</a><a href="#rules">02 · 世界规则</a><a href="#structure">03 · 叙事结构</a><a href="#visual">04 · 视觉系统</a><a href="#review">05 · 项目复盘</a>
      </aside>
    </div>
  )
}

function OpeningLetter({ active, sourceRect, onClose, reducedMotion }) {
  const [expanded, setExpanded] = useState(reducedMotion)
  const [revealed, setRevealed] = useState(reducedMotion)

  useEffect(() => {
    if (reducedMotion) {
      setExpanded(true)
      setRevealed(true)
      return undefined
    }
    // 开档顺序：下一帧启动 FLIP → .68s 解结完成 → 约 1.33s 纸张铺开 → 1.34s 显示正文。
    const frame = requestAnimationFrame(() => setExpanded(true))
    const revealTimer = setTimeout(() => setRevealed(true), 1340)
    return () => { cancelAnimationFrame(frame); clearTimeout(revealTimer) }
  }, [reducedMotion])

  const style = sourceRect ? {
    '--from-x': `${sourceRect.left}px`, '--from-y': `${sourceRect.top}px`,
    '--from-w': `${sourceRect.width}px`, '--from-h': `${sourceRect.height}px`,
  } : undefined

  return (
    <div
      className={`opening-layer ${expanded ? 'is-expanded' : ''} ${revealed ? 'is-revealed' : ''}`}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-label={`档案详情：${active.title}`}
    >
      <div className="letter-sheet">
        <div className="paper-blank"><span>WORLD FILES / {active.no}</span></div>
        {revealed && <ArchiveDetail file={active} onClose={onClose} />}
      </div>
    </div>
  )
}

function App() {
  const [active, setActive] = useState(null)
  const [sourceRect, setSourceRect] = useState(null)
  const [hovered, setHovered] = useState(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [wheeling, setWheeling] = useState(false)
  // Pointer Capture 会把原生 click 交给父容器，因此这里保存按下的原卡片，并在 pointerup 主动区分点击和拖动。
  const dragState = useRef({ pointerId: null, startX: 0, startOffset: 0, moved: false, cardIndex: null, cardNode: null })
  // pointerup 主动打开后，吞掉浏览器可能补发的一次 click，避免开档动画启动两遍。
  const suppressClick = useRef(false)
  const wheelTimer = useRef(null)
  const stackRef = useRef(null)
  const triggerRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const minDragOffset = Math.min(0, TRACK_END - (TRACK_START + (files.length - 1) * TRACK_STEP))

  const openFile = (file, index, node) => {
    if (!node) return
    const rect = node.getBoundingClientRect()
    triggerRef.current = node
    setHovered(index)
    setSourceRect({ left: rect.left, top: rect.top, width: rect.width, height: rect.height })
    setActive({ ...file, index })
  }

  const clickFile = (file, index, node) => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    openFile(file, index, node)
  }

  const closeFile = () => {
    setActive(null)
    setSourceRect(null)
    setHovered(null)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const trackPointer = (event) => {
    if (event.pointerType === 'touch' || active || dragState.current.pointerId !== null) return
    const stack = stackRef.current
    if (!stack) return
    const rect = stack.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      setHovered(null)
      return
    }
    const pointerX = ((event.clientX - rect.left) / rect.width) * 100
    if (pointerX < 2 || pointerX > 88) {
      setHovered(null)
      return
    }
    // 命中轨道必须扣除当前拖动偏移；否则拖动后视觉卡片与 Hover 索引会错位。
    const index = Math.max(0, Math.min(files.length - 1, Math.round((pointerX - TRACK_START - dragOffset) / TRACK_STEP)))
    setHovered((current) => current === index ? current : index)
  }

  const startDrag = (event) => {
    if (active || event.button !== 0) return
    const cardNode = event.target.closest?.('.file-card')
    const cardIndex = cardNode ? Number(cardNode.dataset.fileIndex) : null
    dragState.current = { pointerId: event.pointerId, startX: event.clientX, startOffset: dragOffset, moved: false, cardIndex, cardNode }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  const movePointer = (event) => {
    if (dragState.current.pointerId === event.pointerId) {
      const rect = event.currentTarget.getBoundingClientRect()
      const delta = ((event.clientX - dragState.current.startX) / rect.width) * 100
      // 5px 是点击/拖动阈值：以内仍打开档案，超过才移动轨道并取消 Hover。
      if (Math.abs(event.clientX - dragState.current.startX) > 5) {
        dragState.current.moved = true
        setHovered(null)
      }
      setDragOffset(Math.max(minDragOffset, Math.min(0, dragState.current.startOffset + delta)))
      return
    }
    trackPointer(event)
  }

  const finishDrag = (event) => {
    if (dragState.current.pointerId !== event.pointerId) return
    const { moved, cardIndex, cardNode } = dragState.current
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    dragState.current.pointerId = null
    setDragging(false)
    if (moved) {
      setHovered(null)
      return
    }
    // Pointer Capture 下不能依赖 button 的原生 click；轻点由这里明确打开最初按下的卡片。
    if (Number.isInteger(cardIndex) && cardNode) {
      suppressClick.current = true
      openFile(files[cardIndex], cardIndex, cardNode)
      window.setTimeout(() => { suppressClick.current = false }, 0)
    }
  }

  const cancelDrag = (event) => {
    if (dragState.current.pointerId !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    dragState.current = { pointerId: null, startX: 0, startOffset: dragOffset, moved: false, cardIndex: null, cardNode: null }
    setDragging(false)
    setHovered(null)
  }

  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && active && closeFile()
    window.addEventListener('keydown', onKeyDown)
    document.body.classList.toggle('locked', Boolean(active))
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('locked')
    }
  }, [active])

  useEffect(() => () => window.clearTimeout(wheelTimer.current), [])

  useEffect(() => {
    const wheelFiles = (event) => {
      const stack = stackRef.current
      if (!stack || active) return
      const rect = stack.getBoundingClientRect()
      const rawDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (!rawDelta) return
      event.preventDefault()
      // 首页任意位置都接管滚轮；同时兼容普通鼠标纵向滚动和触控板横滑。
      const delta = event.deltaMode === 1 ? rawDelta * 16 : event.deltaMode === 2 ? rawDelta * rect.width : rawDelta
      setDragOffset((current) => Math.max(minDragOffset, Math.min(0, current - (delta / rect.width) * 100)))
      setHovered(null)
      setWheeling(true)
      window.clearTimeout(wheelTimer.current)
      wheelTimer.current = window.setTimeout(() => setWheeling(false), 140)
    }
    window.addEventListener('wheel', wheelFiles, { passive: false })
    return () => window.removeEventListener('wheel', wheelFiles)
  }, [active, minDragOffset])

  return (
    <main
      id="top"
      className="archive-page"
      onPointerMove={trackPointer}
      onPointerLeave={() => !active && !dragging && setHovered(null)}
    >
      <div className="page-shell" inert={Boolean(active)} aria-hidden={active ? 'true' : undefined}>
        <Header activeNo={active?.no} count={files.length} />
        <section className="hero">
          <div className="intro">
            <div className="section-code">—　ARCHIVE INDEX · 01–{String(files.length).padStart(2, '0')}</div>
            <h1>世界档案</h1>
            <h2>世界观 · 人物与故事结构</h2>
            <p>记录那些半梦半醒的世界、人物关系、叙事结构与设计碎片。选择一份档案，查看其内容。</p>
            <span className="browse-cue"><i>↔</i> HOVER / DRAG / SCROLL</span>
          </div>
          <div
            ref={stackRef}
            className={`file-stack ${dragging ? 'is-dragging' : ''} ${wheeling ? 'is-wheeling' : ''}`}
            style={{ '--stack-offset': `${dragOffset}%` }}
            aria-label="世界档案列表"
            onPointerDown={startDrag}
            onPointerMove={movePointer}
            onPointerUp={finishDrag}
            onPointerCancel={cancelDrag}
            onPointerLeave={() => !active && !dragging && setHovered(null)}
          >
            {files.map((file, index) => <FileCard key={file.id} file={file} index={index} total={files.length} onOpen={clickFile} hovered={hovered} onHover={setHovered} opening={active?.index === index} reducedMotion={reducedMotion} />)}
          </div>
        </section>
        <footer><span>WORLD FILES © 2026</span><span>DESIGN / ARCHIVE / SYSTEM</span></footer>
      </div>
      {active && <OpeningLetter active={active} sourceRect={sourceRect} onClose={closeFile} reducedMotion={reducedMotion} />}
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
