import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type UIEvent } from 'react'

type Mode = 'orbit' | 'layered' | 'archive'
type OrbitOffset = { x: number; y: number }

const sourceArt = ['flower', 'mineral', 'portrait', 'wave', 'chart', 'collage']
const titles = [
  'FOLDED MATTER', 'SOFT MINERAL', 'HUMAN SIGNAL', 'WAVE THEORY',
  'MEASURED LIGHT', 'TORN HORIZON', 'NIGHT INDEX', 'QUIET BLOOM',
  'STATIC FIELD', 'LIMINAL FORM', 'SILENT CURRENT', 'CHROMA STUDY',
  'SECOND NATURE', 'TIDAL MEMORY', 'MOTION TRACE', 'OPEN CIRCUIT',
  'DUST / SIGNAL', 'SOLAR FOLD', 'FIELD NOTES', 'AFTER IMAGE',
  'GENTLE SYSTEM', 'COMMON GROUND', 'VOLUME ZERO', 'ORBITAL TYPE',
]
const colors = ['#e55d4f', '#76b99c', '#ed5994', '#173961', '#62b9ca', '#e7c791']

const works = titles.map((title, index) => ({
  id: index + 1,
  title,
  year: 2026 - index * 2,
  image: `/art/${sourceArt[index % sourceArt.length]}.jpg`,
  color: colors[index % colors.length],
}))

function Icon({ type }: { type: Mode }) {
  if (type === 'orbit') return (
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M3.8 9.7c3.8-.3 6.3 1.4 7.3 5.2m-4.8 4c1.2-3 3.2-4.6 6-4.6 2.2 0 4 1.1 5.4 3.1M13.5 3.7c-1 2.3-.9 4.3.4 5.8 1.3 1.4 3.1 1.9 5.5 1.4"/></svg>
  )
  if (type === 'layered') return (
    <svg viewBox="0 0 24 24"><path d="m12 4-8 4.4 8 4.3 8-4.3L12 4Z"/><path d="m5 12.4 7 3.8 7-3.8M5 16.4l7 3.7 7-3.7"/></svg>
  )
  return (
    <svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx=".6"/><rect x="14" y="4" width="6" height="6" rx=".6"/><rect x="4" y="14" width="6" height="6" rx=".6"/><rect x="14" y="14" width="6" height="6" rx=".6"/></svg>
  )
}

function ArchiveCard({ work, style, onHoverStart, onHoverEnd }: {
  work: (typeof works)[number]
  style?: CSSProperties
  onHoverStart?: () => void
  onHoverEnd?: () => void
}) {
  return (
    <article
      className="archive-card"
      style={{ ...style, '--accent': work.color } as CSSProperties}
      onPointerEnter={onHoverStart}
      onPointerLeave={onHoverEnd}
    >
      <div className="card-top"><span>PARALLAX / ARCHIVE</span><span>FILE {String(work.id).padStart(2, '0')}</span></div>
      <h2>PARALLAX<br />ARCHIVE</h2>
      <div className="art-frame"><img src={work.image} alt="" draggable="false" /></div>
      <div className="card-meta"><strong>{work.title}</strong><em>{work.year}</em></div>
    </article>
  )
}

function Sidebar({ mode, setMode }: { mode: Mode; setMode: (mode: Mode) => void }) {
  const modes: { id: Mode; label: string }[] = [
    { id: 'layered', label: 'LAYERED VIEW' },
    { id: 'orbit', label: 'ORBIT VIEW' },
    { id: 'archive', label: 'ARCHIVE VIEW' },
  ]
  return (
    <aside className="sidebar">
      <header>
        <h1>PARALLAX<br />ARCHIVE</h1>
        <p>A living collection of independent visual studies.<br />Explore twenty-four original works through layered,<br />orbital, and archival perspectives.</p>
      </header>
      <div className="controls">
        <div className="rule" />
        <span className="eyebrow">SELECT PERSPECTIVE</span>
        {modes.map((item) => (
          <button key={item.id} className={mode === item.id ? 'active' : ''} onClick={() => setMode(item.id)}>
            <Icon type={item.id} /><span>{item.label}</span>
          </button>
        ))}
      </div>
      <small>© 2026 · PARALLAX ARCHIVE</small>
    </aside>
  )
}

export default function App() {
  const [mode, setMode] = useState<Mode>('layered')
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [hoveredOrbit, setHoveredOrbit] = useState<number | null>(null)
  const [draggingOrbit, setDraggingOrbit] = useState<number | null>(null)
  const [orbitOffsets, setOrbitOffsets] = useState<Record<number, OrbitOffset>>({})
  const [scrollThumb, setScrollThumb] = useState({ height: 90, top: 14, travel: 0, maxScroll: 0 })
  const archiveScroller = useRef<HTMLDivElement>(null)
  const scrollTrack = useRef<HTMLDivElement>(null)
  const thumbDrag = useRef({ active: false, pointerY: 0, thumbTop: 0 })
  const orbitDrag = useRef({
    active: false, index: -1, pointerId: -1,
    startX: 0, startY: 0, offsetX: 0, offsetY: 0,
    minDx: 0, maxDx: 0, minDy: 0, maxDy: 0,
  })

  useEffect(() => {
    const scroller = archiveScroller.current
    if (mode !== 'archive' || !scroller) return
    scroller.scrollTop = 0
    updateScrollThumb(scroller)

    const observer = new ResizeObserver(() => updateScrollThumb(scroller))
    observer.observe(scroller)
    if (scroller.firstElementChild) observer.observe(scroller.firstElementChild)
    return () => observer.disconnect()
  }, [mode])

  useEffect(() => {
    if (mode !== 'orbit') setHoveredOrbit(null)
  }, [mode])

  function updateScrollThumb(scroller: HTMLDivElement) {
    const trackHeight = Math.max(0, (scrollTrack.current?.clientHeight ?? scroller.clientHeight) - 28)
    const height = Math.min(trackHeight, Math.max(64, trackHeight * (scroller.clientHeight / scroller.scrollHeight)))
    const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight)
    const travel = Math.max(0, trackHeight - height)
    const top = 14 + (maxScroll ? (scroller.scrollTop / maxScroll) * travel : 0)
    setScrollThumb({ height, top, travel, maxScroll })
  }

  function handleArchiveScroll(event: UIEvent<HTMLDivElement>) {
    updateScrollThumb(event.currentTarget)
  }

  function scrollFromThumbTop(top: number) {
    const scroller = archiveScroller.current
    if (!scroller || !scrollThumb.travel) return
    const boundedTop = Math.max(0, Math.min(scrollThumb.travel, top))
    scroller.scrollTop = (boundedTop / scrollThumb.travel) * scrollThumb.maxScroll
  }

  function handleThumbPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    thumbDrag.current = { active: true, pointerY: event.clientY, thumbTop: scrollThumb.top - 14 }
  }

  function handleThumbPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!thumbDrag.current.active) return
    scrollFromThumbTop(thumbDrag.current.thumbTop + event.clientY - thumbDrag.current.pointerY)
  }

  function handleThumbPointerUp(event: PointerEvent<HTMLDivElement>) {
    thumbDrag.current.active = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  function handleTrackPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return
    const bounds = event.currentTarget.getBoundingClientRect()
    scrollFromThumbTop(event.clientY - bounds.top - 14 - scrollThumb.height / 2)
  }

  function handleScrollbarKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const scroller = archiveScroller.current
    if (!scroller) return
    const amount = event.key === 'PageDown' ? scroller.clientHeight * .82
      : event.key === 'PageUp' ? -scroller.clientHeight * .82
      : event.key === 'ArrowDown' ? 72
      : event.key === 'ArrowUp' ? -72
      : 0
    if (amount) {
      event.preventDefault()
      scroller.scrollBy({ top: amount, behavior: 'smooth' })
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      scroller.scrollTo({ top: event.key === 'Home' ? 0 : scroller.scrollHeight, behavior: 'smooth' })
    }
  }

  function moveOrbit(event: PointerEvent<HTMLElement>) {
    if (mode !== 'orbit' || hoveredOrbit !== null || draggingOrbit !== null) return
    const box = event.currentTarget.getBoundingClientRect()
    setPointer({
      x: (event.clientX - box.left - box.width / 2) / box.width,
      y: (event.clientY - box.top - box.height / 2) / box.height,
    })
  }

  function orbitStyle(index: number): CSSProperties {
    const angle = (index / works.length) * Math.PI * 2 - Math.PI / 2
    const ring = 172 + (index % 4) * 31
    const x = Math.cos(angle) * ring + pointer.x * (index % 2 ? 104 : -88)
    const y = Math.sin(angle) * ring * .74 + pointer.y * (index % 3 ? 66 : -56)
    const isHovered = hoveredOrbit === index
    const offset = orbitOffsets[index] ?? { x: 0, y: 0 }
    const rotation = Math.sin(angle) * 13
    return {
      zIndex: isHovered || draggingOrbit === index ? 100 : index === 0 ? 40 : works.length - index,
      transform: `translate3d(calc(-50% + ${x + offset.x}px), calc(-50% + ${y + offset.y}px), 0) rotate(${rotation}deg)`,
      '--orbit-counter-rotation': `${-rotation}deg`,
    } as CSSProperties
  }

  function handleOrbitPointerDown(event: PointerEvent<HTMLDivElement>, index: number) {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()

    const slot = event.currentTarget
    const slotBounds = slot.getBoundingClientRect()
    const stageBounds = slot.closest('.stage')?.getBoundingClientRect()
    const offset = orbitOffsets[index] ?? { x: 0, y: 0 }
    const visibleEdge = 56

    slot.setPointerCapture(event.pointerId)
    orbitDrag.current = {
      active: true,
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
      minDx: stageBounds ? stageBounds.left + visibleEdge - slotBounds.right : -Infinity,
      maxDx: stageBounds ? stageBounds.right - visibleEdge - slotBounds.left : Infinity,
      minDy: stageBounds ? stageBounds.top + visibleEdge - slotBounds.bottom : -Infinity,
      maxDy: stageBounds ? stageBounds.bottom - visibleEdge - slotBounds.top : Infinity,
    }
    setHoveredOrbit(index)
    setDraggingOrbit(index)
  }

  function handleOrbitPointerMove(event: PointerEvent<HTMLDivElement>, index: number) {
    const drag = orbitDrag.current
    if (!drag.active || drag.pointerId !== event.pointerId || drag.index !== index) return
    event.preventDefault()
    event.stopPropagation()

    const dx = Math.max(drag.minDx, Math.min(drag.maxDx, event.clientX - drag.startX))
    const dy = Math.max(drag.minDy, Math.min(drag.maxDy, event.clientY - drag.startY))
    setOrbitOffsets((current) => ({
      ...current,
      [index]: { x: drag.offsetX + dx, y: drag.offsetY + dy },
    }))
  }

  function handleOrbitPointerEnd(event: PointerEvent<HTMLDivElement>, index: number) {
    const drag = orbitDrag.current
    if (!drag.active || drag.pointerId !== event.pointerId || drag.index !== index) return
    const slot = event.currentTarget
    const remainsHovered = slot.matches(':hover')
    drag.active = false
    setDraggingOrbit(null)
    setHoveredOrbit((current) => remainsHovered ? index : current === index ? null : current)
    if (slot.hasPointerCapture(event.pointerId)) slot.releasePointerCapture(event.pointerId)
  }

  function handleOrbitPointerLeave(index: number) {
    if (orbitDrag.current.active && orbitDrag.current.index === index) return
    setHoveredOrbit((current) => current === index ? null : current)
  }

  function layeredStyle(index: number): CSSProperties {
    return {
      '--i': index,
      zIndex: 30 - index,
    } as CSSProperties
  }

  return (
    <div className={`app mode-${mode}`}>
      <Sidebar mode={mode} setMode={setMode} />
      <main className="stage" onPointerMove={moveOrbit}>
        {mode === 'archive' ? (
          <>
            <div id="archive-collection" className="archive-scroller" ref={archiveScroller} onScroll={handleArchiveScroll}>
              <div className="archive-grid">
                {works.map((work) => <ArchiveCard key={work.id} work={work} />)}
              </div>
            </div>
            <div
              className="scroll-track"
              ref={scrollTrack}
              role="scrollbar"
              aria-label="Archive collection scroll position"
              aria-controls="archive-collection"
              aria-valuemin={0}
              aria-valuemax={Math.round(scrollThumb.maxScroll)}
              aria-valuenow={Math.round(archiveScroller.current?.scrollTop ?? 0)}
              tabIndex={0}
              onPointerDown={handleTrackPointerDown}
              onKeyDown={handleScrollbarKeyDown}
            >
              <div className="scroll-rail" />
              <div
                className="scroll-thumb"
                style={{ height: scrollThumb.height, transform: `translateY(${scrollThumb.top}px)` }}
                onPointerDown={handleThumbPointerDown}
                onPointerMove={handleThumbPointerMove}
                onPointerUp={handleThumbPointerUp}
                onPointerCancel={handleThumbPointerUp}
              >
                <span />
              </div>
            </div>
          </>
        ) : (
          <div className="card-space">
            {mode === 'layered'
              ? works.map((work, index) => (
                  <div key={work.id} className="layer-slot" style={layeredStyle(index)}>
                    <ArchiveCard work={work} />
                  </div>
                ))
              : works.map((work, index) => (
                  <div
                    key={work.id}
                    className={`orbit-slot${hoveredOrbit === index || draggingOrbit === index ? ' is-hovered' : ''}${draggingOrbit === index ? ' is-dragging' : ''}`}
                    style={orbitStyle(index)}
                    tabIndex={0}
                    aria-label={`${work.title}, ${work.year}`}
                    onPointerEnter={() => setHoveredOrbit(index)}
                    onPointerLeave={() => handleOrbitPointerLeave(index)}
                    onPointerDown={(event) => handleOrbitPointerDown(event, index)}
                    onPointerMove={(event) => handleOrbitPointerMove(event, index)}
                    onPointerUp={(event) => handleOrbitPointerEnd(event, index)}
                    onPointerCancel={(event) => handleOrbitPointerEnd(event, index)}
                    onFocus={() => setHoveredOrbit(index)}
                    onBlur={() => setHoveredOrbit((current) => current === index ? null : current)}
                  >
                    <ArchiveCard work={work} />
                  </div>
                ))}
            {mode === 'orbit' && <div className="orbit-hint">MOVE TO EXPLORE · DRAG ANY CARD TO REARRANGE</div>}
          </div>
        )}
      </main>
    </div>
  )
}
