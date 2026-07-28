import { useEffect, useMemo, useRef } from 'react'

const HERO_IMAGE_URL = '/assets/hero-clean-surface-v4.png'
const REVEAL_IMAGES = [
  { src: '/assets/hero-storm-decay-v3.png', label: 'STORM DECAY', cell: 22, radius: 212, life: 1100 },
  { src: '/assets/hero-frost-dormancy-v3.png', label: 'FROST DORMANCY', cell: 28, radius: 260, life: 1320 },
  { src: '/assets/hero-rain-rebirth-v3.png', label: 'RAIN REBIRTH', cell: 18, radius: 198, life: 1040 },
]

function PixelTrail({ revealImageRefs }) {
  const canvasRef = useRef(null)
  const modeLabelRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const images = revealImageRefs.map((ref) => ref.current)
    if (!canvas || images.some((image) => !image)) return undefined

    const ctx = canvas.getContext('2d', { alpha: true })
    const sources = images.map((image) => {
      const sampler = document.createElement('canvas')
      return {
        image,
        sampler,
        context: sampler.getContext('2d', { willReadFrequently: true }),
        ready: image.complete && image.naturalWidth > 0,
      }
    })

    let width = 0
    let height = 0
    let dpr = 1
    let viewportScale = 1
    let raf = 0
    let lastPoint = null
    let points = []
    let activeMode = 0
    let pressStart = null

    const updateModeLabel = () => {
      if (!modeLabelRef.current) return
      modeLabelRef.current.textContent = `${String(activeMode + 1).padStart(2, '0')} / 03 · ${REVEAL_IMAGES[activeMode].label}`
      modeLabelRef.current.dataset.flash = 'true'
      window.setTimeout(() => {
        if (modeLabelRef.current) modeLabelRef.current.dataset.flash = 'false'
      }, 420)
    }

    const switchMode = () => {
      activeMode = (activeMode + 1) % REVEAL_IMAGES.length
      // A new gesture starts cleanly in one mode; never mix two artworks in
      // the same smear after switching.
      points = []
      lastPoint = null
      updateModeLabel()
    }

    const rebuildSource = (source) => {
      if (!source.ready || width === 0 || height === 0) return
      source.sampler.width = width
      source.sampler.height = height
      source.context.clearRect(0, 0, width, height)

      const scale = Math.max(width / source.image.naturalWidth, height / source.image.naturalHeight)
      const drawWidth = source.image.naturalWidth * scale
      const drawHeight = source.image.naturalHeight * scale
      source.context.drawImage(
        source.image,
        (width - drawWidth) / 2,
        (height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      )
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      // Match object-fit: cover exactly. Landscape screens are usually
      // width-driven; portrait screens are height-driven. Using max here is
      // essential—min would behave like contain and leave the brush tiny over
      // a heavily zoomed portrait crop.
      viewportScale = Math.max(0.7, Math.min(4.5, Math.max(width / 1280, height / 720)))
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sources.forEach(rebuildSource)
    }

    const makePoint = (x, y, born) => ({
      x,
      y,
      born,
      mode: activeMode,
      seed: Math.random() * 1000,
    })

    const addPoint = (x, y, time) => {
      if (lastPoint) {
        const distance = Math.hypot(x - lastPoint.x, y - lastPoint.y)
        const steps = Math.max(1, Math.ceil(distance / (22 * viewportScale)))
        for (let i = 1; i <= steps; i += 1) {
          const t = i / steps
          points.push(makePoint(
            lastPoint.x + (x - lastPoint.x) * t,
            lastPoint.y + (y - lastPoint.y) * t,
            time - (1 - t) * 18,
          ))
        }
      } else {
        points.push(makePoint(x, y, time))
      }
      lastPoint = { x, y }
      if (points.length > 64) points = points.slice(-64)
    }

    const onPointerMove = (event) => addPoint(event.clientX, event.clientY, performance.now())
    const onPointerLeave = () => { lastPoint = null }
    const onPointerDown = (event) => {
      pressStart = { x: event.clientX, y: event.clientY }
    }
    const onPointerUp = (event) => {
      if (pressStart && Math.hypot(event.clientX - pressStart.x, event.clientY - pressStart.y) < 6) {
        switchMode()
      }
      pressStart = null
    }
    const onPointerCancel = () => { pressStart = null }

    const draw = (now) => {
      ctx.clearRect(0, 0, width, height)
      points = points.filter((point) => (
        now - point.born < REVEAL_IMAGES[point.mode].life * Math.max(1, viewportScale)
      ))

      if (points.length) {
        const activeConfig = REVEAL_IMAGES[activeMode]
        const cell = Math.max(11, Math.round(activeConfig.cell * viewportScale))
        const maxRadius = Math.max(...REVEAL_IMAGES.map((mode) => mode.radius * viewportScale))
        let minX = width
        let minY = height
        let maxX = 0
        let maxY = 0

        for (const point of points) {
          minX = Math.min(minX, point.x - maxRadius)
          minY = Math.min(minY, point.y - maxRadius)
          maxX = Math.max(maxX, point.x + maxRadius)
          maxY = Math.max(maxY, point.y + maxRadius)
        }

        const startX = Math.max(0, Math.floor(minX / cell) * cell)
        const startY = Math.max(0, Math.floor(minY / cell) * cell)
        const endX = Math.min(width, Math.ceil(maxX / cell) * cell)
        const endY = Math.min(height, Math.ceil(maxY / cell) * cell)

        for (let y = startY; y < endY; y += cell) {
          for (let x = startX; x < endX; x += cell) {
            let influence = 0
            let winningPoint = null

            for (let i = points.length - 1; i >= 0; i -= 1) {
              const point = points[i]
              const config = REVEAL_IMAGES[point.mode]
              const scaledLife = config.life * Math.max(1, viewportScale)
              const life = Math.max(0, 1 - (now - point.born) / scaledLife)
              const distance = Math.hypot(x + cell / 2 - point.x, y + cell / 2 - point.y)
              const radial = Math.max(0, 1 - distance / (config.radius * viewportScale))
              const value = radial * radial * (0.28 + life * 0.72)
              if (value > influence) {
                influence = value
                winningPoint = point
              }
            }

            if (!winningPoint || influence < 0.055) continue
            const noise = Math.sin(x * 0.117 + y * 0.071 + winningPoint.seed) * 0.5 + 0.5
            if (influence < 0.18 && noise > influence * 4.2) continue

            const source = sources[winningPoint.mode]
            if (!source.ready) continue

            // Each square copies the exact same spatial region from the
            // alternate artwork. Keeping source and destination coordinates
            // identical preserves top/bottom layer alignment while retaining
            // real intra-tile image texture.
            const sampleX = x + cell / 2
            const sampleY = y + cell / 2
            const sourceSize = cell
            const alpha = Math.min(1, 0.46 + influence * 1.16)

            ctx.globalAlpha = alpha
            ctx.drawImage(
              source.sampler,
              sampleX - sourceSize / 2,
              sampleY - sourceSize / 2,
              sourceSize,
              sourceSize,
              x + 0.7,
              y + 0.7,
              cell - 1.4,
              cell - 1.4,
            )
            ctx.globalAlpha = 1
            ctx.strokeStyle = `rgba(242, 248, 255, ${alpha * 0.38})`
            ctx.lineWidth = 0.7
            ctx.strokeRect(x + 0.9, y + 0.9, cell - 1.8, cell - 1.8)
          }
        }
      }

      raf = requestAnimationFrame(draw)
    }

    const loadHandlers = sources.map((source) => {
      const handler = () => {
        source.ready = true
        rebuildSource(source)
      }
      source.image.addEventListener('load', handler)
      return handler
    })

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('pointercancel', onPointerCancel)
    document.documentElement.addEventListener('mouseleave', onPointerLeave)
    resize()
    updateModeLabel()
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      sources.forEach((source, index) => source.image.removeEventListener('load', loadHandlers[index]))
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerCancel)
      document.documentElement.removeEventListener('mouseleave', onPointerLeave)
    }
  }, [revealImageRefs])

  return (
    <>
      <canvas ref={canvasRef} className="pixel-trail" aria-hidden="true" />
      <p ref={modeLabelRef} className="mode-label" aria-live="polite" />
    </>
  )
}

export default function App() {
  const xrayRef = useRef(null)
  const jadeRef = useRef(null)
  const neonRef = useRef(null)
  const revealImageRefs = useMemo(() => [xrayRef, jadeRef, neonRef], [])

  return (
    <main className="experience">
      <img className="hero-image" src={HERO_IMAGE_URL} alt="Original floral portrait" />
      {REVEAL_IMAGES.map((image, index) => (
        <img
          key={image.src}
          ref={revealImageRefs[index]}
          className="reveal-source"
          src={image.src}
          alt=""
          aria-hidden="true"
        />
      ))}
      <PixelTrail revealImageRefs={revealImageRefs} />
      <header className="topbar" aria-label="Project navigation">
        <span><b>＋</b> ( DEPLOY )</span>
        <span>( PREVIEW )</span>
        <span>( SHIP )</span>
      </header>
      <footer className="credits">
        <span>EXPERIMENT 05<br />PIXEL BLOOM</span>
        <span>BUILT WITH<br />REACT + CANVAS</span>
        <span>© 2026 STUDIO</span>
      </footer>
      <div className="intro-shade" aria-hidden="true" />
      <p className="hint">MOVE · CLICK TO SWITCH</p>
    </main>
  )
}
