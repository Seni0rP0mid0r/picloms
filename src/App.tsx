import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { archiveMedia, brandMedia, heroFrames } from './data/media'
import { buildLayout, columnsForWidth } from './lib/layout'
import { resolveHeroReadiness, type HeroFrameState } from './lib/heroState'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const symbols = ['8', '$', '^^', '%', '/'] as const
const transition = { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)
  const buyRef = useRef<HTMLAnchorElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLElement>(null)
  const symbolRef = useRef<HTMLSpanElement>(null)
  const frameRefs = useRef<(HTMLImageElement | null)[]>([])
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const activeSide = useRef(0)
  const mouseX = useRef<number | null>(null)
  const wakeRafRef = useRef<() => void>(() => undefined)
  const heroReadyRef = useRef(false)
  const loadedFrames = useRef(new Set<number>())
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth)
  const [frameStates, setFrameStates] = useState<HeroFrameState[]>(() => heroFrames.map(() => 'pending'))
  const cols = columnsForWidth(viewportWidth)
  const layout = useMemo(() => buildLayout(archiveMedia.length, cols), [cols])
  const prefersReducedMotion = useReducedMotion() ?? false
  const heroStatus = resolveHeroReadiness(frameStates)
  const introProps = (delay: number) => prefersReducedMotion
    ? { initial: false as const }
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { ...transition, delay } }

  useGSAP(() => {
    if (!panelRef.current || prefersReducedMotion) return
    gsap.fromTo(panelRef.current, { y: window.innerHeight }, {
      y: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: rootRef.current,
        start: 'top top',
        end: () => `+=${window.innerHeight}`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    })
  }, { scope: rootRef, dependencies: [prefersReducedMotion] })

  useEffect(() => {
    const finePointer = window.matchMedia('(min-width: 1024px) and (pointer: fine)')
    const move = (event: MouseEvent) => {
      mouseX.current = event.clientX
      if (cursorRef.current) {
        cursorRef.current.style.left = `${event.clientX}px`
        cursorRef.current.style.top = `${event.clientY}px`
      }
      wakeRafRef.current()
    }
    if (finePointer.matches) window.addEventListener('mousemove', move, { passive: true })
    return () => window.removeEventListener('mousemove', move)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion || !heroStatus.ready || window.matchMedia('(pointer: fine)').matches) return
    let index = heroStatus.activeIndex ?? 0
    const timer = window.setInterval(() => {
      const candidate = index === 0 ? 1 : 0
      index = loadedFrames.current.has(candidate) ? candidate : index
      activeSide.current = index
      frameRefs.current.forEach((frame, frameIndex) => {
        if (frame) frame.style.opacity = frameIndex === index ? '1' : '0'
      })
    }, 4800)
    return () => window.clearInterval(timer)
  }, [heroStatus.activeIndex, heroStatus.ready, prefersReducedMotion])

  useEffect(() => {
    heroReadyRef.current = heroStatus.ready
    if (heroStatus.ready && heroStatus.activeIndex !== null) activeSide.current = heroStatus.activeIndex
  }, [heroStatus.activeIndex, heroStatus.ready])

  useEffect(() => {
    if (prefersReducedMotion) return
    let raf = 0
    let refreshRaf = 0
    let maxScroll = 0
    let lastSymbolAt = 0
    let lastY = -1
    let needsMeasure = true

    const tick = (time: number) => {
      raf = 0
      const vh = window.innerHeight
      const width = window.innerWidth
      const y = window.scrollY
      const nextMaxScroll = needsMeasure ? Math.max(0, (wrapperRef.current?.scrollHeight ?? vh) - vh) : maxScroll
      const spacerHeight = needsMeasure ? `${vh + nextMaxScroll + 2 * vh}px` : null
      maxScroll = nextMaxScroll
      needsMeasure = false
      const phaseTwo = Math.max(0, y - vh)
      const galleryTravel = Math.min(phaseTwo, maxScroll)
      const panelTop = panelRef.current?.getBoundingClientRect().top ?? Math.max(0, vh - y)
      const cardScales = cardRefs.current.flatMap((card) => {
        if (!card) return []
        const top = panelTop + card.offsetTop - galleryTravel
        const bottom = top + card.offsetHeight
        const scale = bottom <= 0 || top >= vh
          ? 0
          : Math.max(0, Math.min(1, (vh - top) / (vh * 0.6), bottom / (vh * 0.4)))
        return [{ card, scale }]
      })
      const outro = clamp((y - vh - maxScroll) / Math.max(1, vh - 100))
      const offset = width < 1024 ? 132 : 166
      const revealed = outro > 0.02
      const x = mouseX.current
      let photoProgress = 0
      if (x !== null && window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches) {
        const center = width / 2
        const deadZone = Math.max(30, width * 0.05)
        if (x < center - deadZone) {
          if (loadedFrames.current.has(1)) activeSide.current = 1
          photoProgress = clamp((center - deadZone - x) / (center - deadZone))
        } else if (x > center + deadZone) {
          if (loadedFrames.current.has(0)) activeSide.current = 0
          photoProgress = clamp((x - center - deadZone) / (center - deadZone))
        }
      }

      if (spacerHeight && rootRef.current) rootRef.current.style.height = spacerHeight
      if (wrapperRef.current) wrapperRef.current.style.transform = `translate3d(0, ${-galleryTravel}px, 0)`
      if (canvasRef.current) canvasRef.current.style.visibility = y > vh ? 'hidden' : 'visible'
      cardScales.forEach(({ card, scale }) => { card.style.transform = `scale(${scale})` })
      if (overlayRef.current) overlayRef.current.style.opacity = `${outro}`
      if (infoRef.current) infoRef.current.style.transform = `translate3d(0, ${-outro * offset}px, 0)`
      if (buyRef.current) buyRef.current.style.transform = `scale(${outro})`
      if (buyRef.current) {
        buyRef.current.tabIndex = revealed ? 0 : -1
        buyRef.current.setAttribute('aria-hidden', revealed ? 'false' : 'true')
        buyRef.current.style.pointerEvents = revealed ? 'auto' : 'none'
      }
      if (footerRef.current) footerRef.current.style.opacity = `${outro}`
      if (x !== null) {
        frameRefs.current.forEach((frame, index) => {
          if (!frame) return
          const active = heroReadyRef.current && index === activeSide.current
          frame.style.opacity = active ? '1' : '0'
          frame.style.transform = active ? `scale(${1 + photoProgress * 0.12})` : 'scale(1)'
          frame.style.objectPosition = active
            ? `${50 + (index === 0 ? -1 : 1) * photoProgress * 7}% ${index === 0 ? 48 : 38}%`
            : heroFrames[index].position ?? '50% 50%'
        })
      }

      if (y !== lastY && time - lastSymbolAt > 80 && symbolRef.current) {
        symbolRef.current.textContent = symbols[Math.floor(Math.random() * symbols.length)]
        lastSymbolAt = time
        lastY = y
      }
    }

    const scheduleFrame = () => {
      if (!raf) raf = window.requestAnimationFrame(tick)
    }
    wakeRafRef.current = scheduleFrame
    const onScroll = () => scheduleFrame()
    const onResize = () => {
      needsMeasure = true
      setViewportWidth(window.innerWidth)
      scheduleFrame()
      window.cancelAnimationFrame(refreshRaf)
      refreshRaf = window.requestAnimationFrame(() => {
        ScrollTrigger.refresh()
        scheduleFrame()
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    scheduleFrame()
    return () => {
      wakeRafRef.current = () => undefined
      window.cancelAnimationFrame(raf)
      window.cancelAnimationFrame(refreshRaf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [layout, prefersReducedMotion])

  const settleFrame = (index: number, state: Exclude<HeroFrameState, 'pending'>) => {
    if (state === 'loaded') loadedFrames.current.add(index)
    else loadedFrames.current.delete(index)
    setFrameStates((current) => current.map((value, frameIndex) => frameIndex === index ? state : value))
  }

  const focusArchive = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (prefersReducedMotion) {
      document.getElementById('archive')?.scrollIntoView({ block: 'start' })
      return
    }
    window.scrollTo({ top: window.innerHeight, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <main id="scroll-spacer" ref={rootRef}>
      <div className="custom-cursor" ref={cursorRef} aria-hidden="true">
        <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22.75" /><path d="M15 24h18M24 15v18M18 18l12 12M30 18 18 30" /></svg>
      </div>

      <motion.div className="brand-lockup blend-ui" {...introProps(0)}>
        <img src={brandMedia.mark} alt="picloms" />
      </motion.div>

      <motion.p className="caption blend-ui" {...introProps(0.3)}>
        Архив изображений picloms. Двигайтесь по кадру, чтобы менять ракурс, затем прокрутите страницу к материалам.
      </motion.p>

      <motion.nav className="top-nav blend-ui" aria-label="Основная навигация" {...introProps(0.15)}>
        <span className="desktop-label" aria-hidden="true">АРХИВ</span>
        <a className="nav-cluster" href="#archive" onClick={focusArchive}><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M0 14H40M0 26H40" /></svg><span>ИЗДЕЛИЯ</span></a>
      </motion.nav>

      <motion.div id="outro-info" ref={infoRef} className="outro-info blend-ui" data-outro-offset="166" {...introProps(0.45)}>
        <div className="archive-label"><span className="symbol-ring"><span id="circle-symbol" ref={symbolRef}>8</span></span><span>ARCHIVE /<br />PICLOMS</span></div>
        <strong>10 КАДРОВ</strong>
      </motion.div>

      <a id="outro-buy" ref={buyRef} className="outro-buy" href="#archive" onClick={focusArchive} tabIndex={-1} aria-hidden="true">view</a>

      <div id="main-canvas" ref={canvasRef} className={heroStatus.ready ? 'ready' : ''} aria-label="Имиджевая сцена picloms">
        {heroFrames.map((frame, index) => (
          <picture key={frame.id}>
            <source srcSet={frame.srcSet} sizes={frame.sizes} />
            <img src={frame.src} ref={(element) => { frameRefs.current[index] = element }} alt={frame.alt} style={{ opacity: heroStatus.ready && heroStatus.activeIndex === index ? 1 : 0, objectPosition: frame.position }} onLoad={() => settleFrame(index, 'loaded')} onError={() => settleFrame(index, 'error')} fetchPriority="high" />
          </picture>
        ))}
        {heroStatus.allFailed && <p className="hero-fallback" role="status">Имиджевая сцена не загрузилась. Архив изображений доступен ниже.</p>}
      </div>

      <section ref={panelRef} className="black-panel" aria-label="Архив изображений">
        <div id="archive" ref={wrapperRef} className="gallery-wrapper" style={{ '--cols': cols } as React.CSSProperties}>
          {layout.flatMap((row, rowIndex) => row.map((mediaIndex, columnIndex) => mediaIndex === -1 ? (
            <div className="empty-cell" key={`${rowIndex}-${columnIndex}`} aria-hidden="true" />
          ) : (
            <div className="bp-card" key={archiveMedia[mediaIndex].id} ref={(element) => { cardRefs.current[mediaIndex] = element }} style={{ transformOrigin: columnIndex < cols / 2 ? 'right bottom' : 'left bottom' }}>
              <img src={archiveMedia[mediaIndex].src} srcSet={archiveMedia[mediaIndex].srcSet} sizes={archiveMedia[mediaIndex].sizes} alt={archiveMedia[mediaIndex].alt} loading="lazy" onError={(event) => { event.currentTarget.closest('.bp-card')?.classList.add('media-error') }} />
              <span className="fallback">Изображение недоступно</span>
            </div>
          ))) }
        </div>
      </section>

      <div id="outro-overlay" ref={overlayRef} />
      <footer id="outro-footer" ref={footerRef} className="blend-ui"><span>PICLOMS © 2026</span><span>АРХИВ ИЗОБРАЖЕНИЙ</span></footer>
    </main>
  )
}
