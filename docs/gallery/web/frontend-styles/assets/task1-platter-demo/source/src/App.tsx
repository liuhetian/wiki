import { CSSProperties, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Album, Track, albums } from './data'

type View = 'library' | 'detail'
type DragState = { startX: number; currentX: number; pointerId: number } | null

const Icon = ({ name }: { name: 'brand' | 'search' | 'back' | 'reset' | 'play' | 'pause' | 'queue' | 'close' }) => {
  const paths = {
    brand: <><path d="M7 5v14M12 3v18M17 6v12M22 4v16" /><path d="M3 8v8" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 5 5" /></>,
    back: <path d="m15 5-7 7 7 7" />,
    reset: <><path d="M20 7v5h-5" /><path d="M19 12a8 8 0 1 1-2.3-5.7L20 9" /></>,
    play: <path className="fill" d="m9 6 10 6-10 6z" />,
    pause: <><path className="fill" d="M7 5h4v14H7zM14 5h4v14h-4z" /></>,
    queue: <><path d="M4 7h12M4 12h12M4 17h8" /><path d="m17 15 4 2-4 2z" className="fill" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}

function CoverArt({ album, compact = false }: { album: Album; compact?: boolean }) {
  return (
    <div
      className={`cover-art motif-${album.motif}${compact ? ' compact' : ''}`}
      style={{ '--primary': album.primary, '--secondary': album.secondary, '--ink': album.ink } as CSSProperties}
    >
      <div className="cover-no">PL—{album.id.replace('album-', '').padStart(2, '0')}</div>
      <div className="cover-shape shape-a" />
      <div className="cover-shape shape-b" />
      <div className="cover-title">{album.title}</div>
      <div className="cover-artist">{album.artist}</div>
    </div>
  )
}

function Library({
  activeIndex, setActiveIndex, openAlbum, openingIndex, openSearch,
}: {
  activeIndex: number
  setActiveIndex: (index: number) => void
  openAlbum: (index: number) => void
  openingIndex: number | null
  openSearch: () => void
}) {
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const dragOffsetRef = useRef(0)
  const railDrag = useRef<{ startX: number; lastX: number; lastTime: number; pointerId: number; velocity: number; startIndex: number | null } | null>(null)
  const pointerOpened = useRef(false)
  const moved = useRef(false)

  const railStep = () => {
    if (window.innerWidth <= 600) return window.innerWidth * 0.64
    if (window.innerWidth <= 900) return Math.min(125, Math.max(90, window.innerWidth * 0.12))
    return Math.min(220, Math.max(135, window.innerWidth * 0.108))
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setHoveredIndex(null)
    moved.current = false
    pointerOpened.current = false
    const visibleCards = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('.album-card'))
      .map((card) => ({ card, rect: card.getBoundingClientRect() }))
      .filter(({ rect }) => rect.right > 0 && rect.left < window.innerWidth)
    const targetCard = visibleCards.reduce<{ card: HTMLButtonElement; distance: number } | null>((nearest, item) => {
      const centerX = item.rect.left + item.rect.width / 2
      const distance = Math.abs(centerX - event.clientX)
      return nearest === null || distance < nearest.distance ? { card: item.card, distance } : nearest
    }, null)?.card ?? null
    railDrag.current = {
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: performance.now(),
      pointerId: event.pointerId,
      velocity: 0,
      startIndex: targetCard ? Number(targetCard.dataset.albumIndex) : null,
    }
    dragOffsetRef.current = 0
    setDragOffset(0)
    setDragging(true)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const current = railDrag.current
    if (!current || current.pointerId !== event.pointerId) return
    const now = performance.now()
    const elapsed = Math.max(1, now - current.lastTime)
    current.velocity = (event.clientX - current.lastX) / elapsed
    current.lastX = event.clientX
    current.lastTime = now
    let nextOffset = event.clientX - current.startX
    if ((activeIndex === 0 && nextOffset > 0) || (activeIndex === albums.length - 1 && nextOffset < 0)) nextOffset *= 0.28
    if (Math.abs(nextOffset) > 6) moved.current = true
    dragOffsetRef.current = nextOffset
    setDragOffset(nextOffset)
  }

  const finishDrag = () => {
    const current = railDrag.current
    if (!current) return
    const isTap = Math.abs(current.lastX - current.startX) <= 10 && current.startIndex !== null
    const step = railStep()
    const velocityProjection = Math.max(-step * 0.9, Math.min(step * 0.9, current.velocity * 120))
    const projectedOffset = dragOffsetRef.current + velocityProjection
    const requestedShift = Math.max(-3, Math.min(3, Math.round(-projectedOffset / step)))
    const targetIndex = Math.max(0, Math.min(albums.length - 1, activeIndex + requestedShift))
    const appliedShift = targetIndex - activeIndex
    const continuousOffset = dragOffsetRef.current + appliedShift * step

    railDrag.current = null
    dragOffsetRef.current = continuousOffset
    setActiveIndex(targetIndex)
    setDragOffset(continuousOffset)
    setDragging(false)

    if (isTap) {
      pointerOpened.current = true
      openAlbum(current.startIndex!)
      window.setTimeout(() => { pointerOpened.current = false }, 0)
      return
    }

    requestAnimationFrame(() => {
      dragOffsetRef.current = 0
      setDragOffset(0)
    })
  }

  const cancelDrag = () => {
    railDrag.current = null
    dragOffsetRef.current = 0
    setDragOffset(0)
    setDragging(false)
    moved.current = false
  }

  const progress = dragOffset / railStep()

  return (
    <main
      className={`view library-view${openingIndex !== null ? ' is-opening' : ''}`}
      style={{ '--opening-bg': openingIndex !== null ? albums[openingIndex].primary : '#efede7' } as CSSProperties}
      aria-label="Album library"
    >
      <header className="topbar">
        <button className="icon-button" aria-label="Reset library" onClick={() => setActiveIndex(0)}><Icon name="brand" /></button>
        <button className="icon-button" aria-label="Search" onClick={openSearch}><Icon name="search" /></button>
      </header>

      <section
        className={`album-rail${dragging ? ' dragging' : ''}${hoveredIndex !== null ? ' has-hover' : ''}`}
        onPointerDown={(event) => openingIndex === null && onPointerDown(event)}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={cancelDrag}
        onWheel={(event) => {
          if (Math.abs(event.deltaY) < 4 && Math.abs(event.deltaX) < 4) return
          const direction = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
          setActiveIndex(Math.max(0, Math.min(albums.length - 1, activeIndex + (direction > 0 ? 1 : -1))))
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') setActiveIndex(Math.min(albums.length - 1, activeIndex + 1))
          if (event.key === 'ArrowLeft') setActiveIndex(Math.max(0, activeIndex - 1))
          if (event.key === 'Enter' && event.target === event.currentTarget) openAlbum(activeIndex)
        }}
        tabIndex={0}
      >
        {albums.map((album, index) => {
          const offset = index - activeIndex + progress
          const style = {
            '--offset': offset,
            '--abs': Math.abs(offset),
            '--z': albums.length - Math.round(Math.abs(offset) * 10),
            '--primary': album.primary,
            '--secondary': album.secondary,
            '--ink': album.ink,
          } as CSSProperties
          return (
            <button
              className={`album-card${index === activeIndex ? ' active' : ''}${index === openingIndex ? ' opening' : ''}${index === hoveredIndex ? ' hovered' : ''}`}
              style={style}
              key={album.id}
              data-album-index={index}
              data-hover-label={`Preview ${String(index + 1).padStart(2, '0')}`}
              aria-label={`${album.title} by ${album.artist}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onMouseEnter={() => {
                if (!dragging && openingIndex === null) setHoveredIndex(index)
              }}
              onMouseLeave={() => setHoveredIndex((current) => current === index ? null : current)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return
                event.preventDefault()
                event.stopPropagation()
                if (openingIndex === null) openAlbum(index)
              }}
              onClick={(event) => {
                event.stopPropagation()
                if (moved.current || pointerOpened.current || openingIndex !== null) return
                openAlbum(index)
              }}
            >
              <span className="flat-album-cover" style={{ viewTransitionName: index === openingIndex ? 'album-cover' : 'none' } as CSSProperties}>
                <CoverArt album={album} />
                <span className="archive-index-strip">
                  <b>{album.title}</b>
                  <i>{String(index + 1).padStart(2, '0')} · {album.year}</i>
                </span>
              </span>
            </button>
          )
        })}
      </section>

      <div className="library-caption" aria-live="polite">
        <span>{hoveredIndex !== null && hoveredIndex !== activeIndex ? 'Preview' : 'Selected'} · {String((hoveredIndex ?? activeIndex) + 1).padStart(2, '0')}</span>
        <strong>{albums[hoveredIndex ?? activeIndex].title}</strong>
        <span>{albums[hoveredIndex ?? activeIndex].artist}</span>
      </div>
    </main>
  )
}

function TrackList({ album, onTrack, currentTrack }: { album: Album; onTrack: (track: Track) => void; currentTrack: Track | null }) {
  return (
    <ol className="track-list">
      {album.tracks.map((track, index) => (
        <li key={track.id}>
          <button onClick={() => onTrack(track)} aria-current={currentTrack?.id === track.id ? 'true' : undefined}>
            <span className="track-number">{String(index + 1).padStart(2, '0')}</span>
            <strong>{track.title}</strong>
            <span>{track.duration}</span>
          </button>
        </li>
      ))}
    </ol>
  )
}

function LongTrackScroller({ album, onTrack, currentTrack }: { album: Album; onTrack: (track: Track) => void; currentTrack: Track | null }) {
  const viewport = useRef<HTMLDivElement>(null)
  const scrollbar = useRef<HTMLDivElement>(null)
  const thumbCleanup = useRef<(() => void) | null>(null)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (viewport.current) viewport.current.scrollTop = 0
    setProgress(0)
  }, [album.id])

  useEffect(() => () => thumbCleanup.current?.(), [])

  const updateProgress = () => {
    const element = viewport.current
    if (!element) return
    setProgress(element.scrollTop / Math.max(1, element.scrollHeight - element.clientHeight))
  }

  const beginThumbDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const content = viewport.current
    const rail = scrollbar.current
    if (!content || !rail) return
    const startY = event.clientY
    const startScroll = content.scrollTop
    const pointerId = event.pointerId
    const thumbHeight = event.currentTarget.clientHeight
    thumbCleanup.current?.()
    setDragging(true)

    const move = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return
      const travel = Math.max(1, rail.clientHeight - thumbHeight)
      const maxScroll = Math.max(0, content.scrollHeight - content.clientHeight)
      content.scrollTop = startScroll + (moveEvent.clientY - startY) / travel * maxScroll
    }
    const removeListeners = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
      thumbCleanup.current = null
    }
    const finish = (finishEvent: PointerEvent) => {
      if (finishEvent.pointerId !== pointerId) return
      removeListeners()
      setDragging(false)
    }
    thumbCleanup.current = removeListeners
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
  }

  return (
    <section className={`track-scroller${dragging ? ' dragging' : ''}`} aria-label={`${album.title} tracks`} onPointerDown={(event) => event.stopPropagation()}>
      <div className="track-scroll-head"><span>Track list</span><b>{album.tracks.length} songs</b></div>
      <div className="track-scroll-viewport" ref={viewport} onScroll={updateProgress}>
        <TrackList album={album} onTrack={onTrack} currentTrack={currentTrack} />
        <p className="track-summary">{album.tracks.length} SONGS · {album.year}</p>
      </div>
      <div className="track-scrollbar" ref={scrollbar} aria-hidden="true">
        <div
          className="track-scroll-thumb"
          style={{ top: `${progress * 100}%`, transform: `translateY(-${progress * 100}%)` }}
          onPointerDown={beginThumbDrag}
        />
      </div>
    </section>
  )
}

function AlbumDetailSlide({ album, active, onTrack, currentTrack, playAlbum }: {
  album: Album; active: boolean; onTrack: (track: Track) => void; currentTrack: Track | null; playAlbum: (album: Album) => void
}) {
  return (
    <section
      className={`album-detail-slide${active ? ' is-active' : ''}`}
      style={{ '--slide-bg': album.primary, '--slide-ink': album.ink } as CSSProperties}
      aria-hidden={!active}
      inert={!active}
    >
      <section className="album-summary">
        <div className="detail-cover" style={{ viewTransitionName: active ? 'album-cover' : 'none' } as CSSProperties}><CoverArt album={album} /></div>
        <div className="album-copy">
          <h1>{album.title}</h1><h2>{album.artist}</h2><p>{album.genre} · {album.year}</p>
        </div>
        <div className="detail-actions">
          <button onClick={() => playAlbum(album)}>Play</button>
          <button onClick={() => onTrack(album.tracks[Math.floor(Math.random() * album.tracks.length)])}>Shuffle</button>
        </div>
      </section>
      <LongTrackScroller album={album} onTrack={onTrack} currentTrack={currentTrack} />
    </section>
  )
}

function Detail({ activeIndex, setActiveIndex, back, onTrack, currentTrack, playAlbum, fromLibrary, manualTransition }: {
  activeIndex: number; setActiveIndex: (index: number) => void; back: () => void; onTrack: (track: Track) => void; currentTrack: Track | null; playAlbum: (album: Album) => void; fromLibrary: boolean; manualTransition: boolean
}) {
  const album = albums[activeIndex]
  const [drag, setDrag] = useState<DragState>(null)
  const carouselDrag = useRef<Exclude<DragState, null>>(null)
  const dragX = drag ? drag.currentX - drag.startX : 0

  const finishCarousel = () => {
    const current = carouselDrag.current
    if (!current) return
    const delta = current.currentX - current.startX
    if (Math.abs(delta) > Math.max(55, window.innerWidth * 0.08)) setActiveIndex(Math.max(0, Math.min(albums.length - 1, activeIndex + (delta < 0 ? 1 : -1))))
    carouselDrag.current = null
    setDrag(null)
  }

  return (
    <main
      className={`view detail-view detail-carousel-view${fromLibrary ? ' from-library' : ''}${manualTransition ? ' manual-transition' : ''}${drag ? ' dragging' : ''}`}
      style={{ '--album-bg': album.primary, '--album-ink': album.ink } as CSSProperties}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest('button, .track-scroller')) return
        event.currentTarget.setPointerCapture(event.pointerId)
        const nextDrag = { startX: event.clientX, currentX: event.clientX, pointerId: event.pointerId }
        carouselDrag.current = nextDrag
        setDrag(nextDrag)
      }}
      onPointerMove={(event) => {
        const current = carouselDrag.current
        if (!current || current.pointerId !== event.pointerId) return
        const nextDrag = { ...current, currentX: event.clientX }
        carouselDrag.current = nextDrag
        setDrag(nextDrag)
      }}
      onPointerUp={finishCarousel}
      onPointerCancel={() => { carouselDrag.current = null; setDrag(null) }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') setActiveIndex(Math.min(albums.length - 1, activeIndex + 1))
        if (event.key === 'ArrowLeft') setActiveIndex(Math.max(0, activeIndex - 1))
      }}
      tabIndex={0}
    >
      <header className="topbar detail-topbar">
        <button className="icon-button" onClick={back} aria-label="Back to albums"><Icon name="back" /></button>
        <span className="detail-index"><b>{String(activeIndex + 1).padStart(2, '0')}</b> | {String(albums.length).padStart(2, '0')}</span>
        <button className="icon-button" onClick={() => setActiveIndex(0)} aria-label="First album"><Icon name="reset" /></button>
      </header>
      <div className="detail-carousel" style={{ transform: `translateX(calc(${-activeIndex * 100}vw + ${dragX}px))` }}>
        {albums.map((item, index) => <AlbumDetailSlide key={item.id} album={item} active={index === activeIndex} onTrack={onTrack} currentTrack={currentTrack} playAlbum={playAlbum} />)}
      </div>
    </main>
  )
}

function Player({ album, track, setTrack, playing, setPlaying, queueOpen, setQueueOpen }: {
  album: Album; track: Track | null; setTrack: (track: Track) => void; playing: boolean; setPlaying: (playing: boolean) => void; queueOpen: boolean; setQueueOpen: (open: boolean) => void
}) {
  const audio = useRef<HTMLAudioElement>(null)
  const [progress, setProgress] = useState(0)
  const active = track ?? album.tracks[0]

  useEffect(() => {
    if (!audio.current) return
    audio.current.currentTime = 0
    if (playing) audio.current.play().catch(() => setPlaying(false))
  }, [active.id])

  useEffect(() => {
    const element = audio.current
    if (!element) return
    if (playing) element.play().catch(() => setPlaying(false))
    else element.pause()
  }, [playing])

  return (
    <>
      <audio ref={audio} src="/audio/platter-demo.m4a" loop onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime / event.currentTarget.duration || 0)} />
      <aside className="mini-player" aria-label="Music player">
        <div className="player-progress" style={{ transform: `scaleX(${progress})` }} />
        <button className="player-main" aria-label={playing ? 'Pause' : 'Play'} onClick={() => setPlaying(!playing)}><Icon name={playing ? 'pause' : 'play'} /></button>
        <div className="player-thumb"><CoverArt album={album} compact /></div>
        <div className="player-copy"><strong>{active.title}</strong><span>{album.artist} · {album.title}</span></div>
        <button className="player-next" aria-label="Next track" onClick={() => {
          const index = album.tracks.findIndex((item) => item.id === active.id)
          setTrack(album.tracks[(index + 1) % album.tracks.length])
          setPlaying(true)
        }}><Icon name="play" /></button>
        <button className="player-queue" aria-label="Open queue" aria-expanded={queueOpen} onClick={() => setQueueOpen(!queueOpen)}><Icon name="queue" /></button>
      </aside>
    </>
  )
}

function App() {
  const [view, setView] = useState<View>('library')
  const [selectedIndex, setSelectedIndex] = useState(3)
  const [track, setTrack] = useState<Track | null>(null)
  const [playing, setPlaying] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [queueOpen, setQueueOpen] = useState(false)
  const [openingIndex, setOpeningIndex] = useState<number | null>(null)
  const [detailFromLibrary, setDetailFromLibrary] = useState(false)
  const [manualDetailTransition, setManualDetailTransition] = useState(false)
  const openingTimer = useRef<number | null>(null)
  const [query, setQuery] = useState('')
  const selectedAlbum = albums[selectedIndex]

  const resultAlbums = useMemo(() => albums.filter((album) => `${album.title} ${album.artist}`.toLowerCase().includes(query.toLowerCase())), [query])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (searchOpen) setSearchOpen(false)
        else if (queueOpen) setQueueOpen(false)
        else if (view === 'detail') setView('library')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen, queueOpen, view])

  useEffect(() => {
    setTrack(null)
  }, [selectedAlbum.id])

  useEffect(() => () => {
    if (openingTimer.current !== null) window.clearTimeout(openingTimer.current)
  }, [])

  const playTrack = (nextTrack: Track) => {
    setTrack(nextTrack)
    setPlaying(true)
  }
  const playAlbum = (album: Album) => playTrack(album.tracks[0])
  const beginAlbumOpen = (index: number) => {
    if (openingIndex !== null) return
    setSelectedIndex(index)
    setOpeningIndex(index)
    openingTimer.current = window.setTimeout(() => {
      const transitionDocument = document as Document & {
        startViewTransition?: (callback: () => void) => { finished: Promise<void> }
      }
      const hasNativeTransition = Boolean(transitionDocument.startViewTransition)
      const commitDetail = () => flushSync(() => {
        setDetailFromLibrary(true)
        setManualDetailTransition(!hasNativeTransition)
        setView('detail')
        setOpeningIndex(null)
      })
      if (transitionDocument.startViewTransition) transitionDocument.startViewTransition(commitDetail)
      else commitDetail()
      openingTimer.current = null
    }, 260)
  }
  const backToLibrary = () => {
    setDetailFromLibrary(false)
    setManualDetailTransition(false)
    setView('library')
  }

  return (
    <div className={`app-shell view-${view}`}>
      {view === 'library' && (
        <Library
          activeIndex={selectedIndex}
          setActiveIndex={setSelectedIndex}
          openAlbum={beginAlbumOpen}
          openingIndex={openingIndex}
          openSearch={() => setSearchOpen(true)}
        />
      )}
      {view === 'detail' && (
        <Detail
          activeIndex={selectedIndex}
          setActiveIndex={setSelectedIndex}
          back={backToLibrary}
          onTrack={playTrack}
          currentTrack={track}
          playAlbum={playAlbum}
          fromLibrary={detailFromLibrary}
          manualTransition={manualDetailTransition}
        />
      )}

      <Player album={selectedAlbum} track={track} setTrack={setTrack} playing={playing} setPlaying={setPlaying} queueOpen={queueOpen} setQueueOpen={setQueueOpen} />

      {searchOpen && (
        <div className="overlay search-overlay" role="dialog" aria-modal="true" aria-label="Search music">
          <div className="overlay-head">
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search albums or artists" />
            <button className="icon-button" onClick={() => setSearchOpen(false)} aria-label="Close search"><Icon name="close" /></button>
          </div>
          <div className="search-results">
            {resultAlbums.map((album) => (
              <button key={album.id} onClick={() => {
                setSelectedIndex(albums.indexOf(album)); setDetailFromLibrary(false); setManualDetailTransition(false); setSearchOpen(false); setView('detail')
              }}>
                <span><CoverArt album={album} compact /></span>
                <strong>{album.title}</strong>
                <small>{album.artist}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {queueOpen && (
        <aside className="queue-panel" aria-label="Playback queue">
          <div className="queue-head"><span>Up next</span><button className="icon-button" onClick={() => setQueueOpen(false)} aria-label="Close queue"><Icon name="close" /></button></div>
          <TrackList album={selectedAlbum} onTrack={playTrack} currentTrack={track} />
        </aside>
      )}
    </div>
  )
}

export default App
