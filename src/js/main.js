import AOS from 'aos'
import 'aos/dist/aos.css'

AOS.init({ duration: 600, easing: 'ease-out', once: true, offset: 50 })

const $ = (sel) => document.querySelector(sel)
const $$ = (sel) => document.querySelectorAll(sel)

// ── Scroll progress + sticky header ──────────────────────
const progress = $('#progress')
const header   = $('#header')

const onScroll = () => {
  const y = window.scrollY
  const max = document.documentElement.scrollHeight - window.innerHeight
  if (progress) progress.style.width = `${(y / max) * 100}%`
  if (header)   header.classList.toggle('scrolled', y > 50)
  updateScale()
}

window.addEventListener('scroll', onScroll, { passive: true })

// ── Mobile menu ───────────────────────────────────────────
const menuBtn   = $('#menu-btn')
const mobileNav = $('#mobile-nav')
const icoMenu   = $('#ico-menu')
const icoClose  = $('#ico-close')

menuBtn?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open')
  icoMenu?.classList.toggle('hidden', open)
  icoClose?.classList.toggle('hidden', !open)
  menuBtn.setAttribute('aria-expanded', open)
})

mobileNav?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileNav.classList.remove('open')
    icoMenu?.classList.remove('hidden')
    icoClose?.classList.add('hidden')
    menuBtn?.setAttribute('aria-expanded', 'false')
  })
})

// ── FAQ accordion ─────────────────────────────────────────
$$('.faq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item')
    const isOpen = item.classList.contains('open')
    $$('.faq-item').forEach(el => el.classList.remove('open'))
    if (!isOpen) item.classList.add('open')
  })
})

// ── Animated counters ─────────────────────────────────────
const counters = $$('[data-counter]')
if (counters.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return
      const end    = parseInt(target.dataset.counter, 10)
      const suffix = target.dataset.suffix || ''
      const step   = end / (1600 / 16)
      let cur = 0
      const tick = () => {
        cur = Math.min(cur + step, end)
        target.textContent = Math.floor(cur) + suffix
        if (cur < end) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      io.unobserve(target)
    })
  }, { threshold: 0.5 })
  counters.forEach(el => io.observe(el))
}

// ── Smooth anchor scroll ──────────────────────────────────
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'))
    if (!target) return
    e.preventDefault()
    window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' })
  })
})

// ── Vertical carousel scale animation ────────────────────
// Each section's .js-scale inner wrapper scales 0.85 → 1.0
// based on how centered the section is in the viewport.
const scaleEls = $$('.js-scale')

const updateScale = () => {
  if (!scaleEls.length) return
  const vh  = window.innerHeight
  const mid = vh * 0.5

  scaleEls.forEach(el => {
    const section = el.closest('section') ?? el.parentElement
    const rect    = section.getBoundingClientRect()
    const secMid  = rect.top + rect.height * 0.5
    const dist    = Math.abs(secMid - mid)
    // Full scale (1.0) when section center is within vh*0.25 of viewport center.
    // Minimum scale (0.85) when section center is vh*0.7 away.
    const full  = vh * 0.20
    const fade  = vh * 0.70
    let t = 1
    if (dist > full) {
      t = Math.max(0, 1 - (dist - full) / (fade - full))
    }
    const scale = 0.85 + 0.15 * t
    el.style.transform = `scale(${scale.toFixed(4)})`
  })
}

// Initialize scale on load and resize
window.addEventListener('resize', updateScale)
updateScale()

// ── Banner carousel ───────────────────────────────────────
;(function () {
  const carousel = $('#banner-carousel')
  if (!carousel) return

  const track     = carousel.querySelector('.banner-track')
  const slides    = carousel.querySelectorAll('.banner-slide')
  const prevBtn   = $('#banner-prev')
  const nextBtn   = $('#banner-next')
  const dotsWrap  = $('#banner-dots')

  let current = 0
  let timer   = null
  const total = slides.length

  // Build dots
  slides.forEach((_, i) => {
    const d = document.createElement('button')
    d.className = 'banner-dot' + (i === 0 ? ' active' : '')
    d.setAttribute('aria-label', `Slide ${i + 1}`)
    d.addEventListener('click', () => go(i))
    dotsWrap?.appendChild(d)
  })

  const dots = () => dotsWrap?.querySelectorAll('.banner-dot')

  const go = (idx) => {
    current = (idx + total) % total
    track.style.transform = `translateX(-${current * 100}%)`
    dots()?.forEach((d, i) => d.classList.toggle('active', i === current))
  }

  const next = () => go(current + 1)
  const prev = () => go(current - 1)

  const start = () => { timer = setInterval(next, 10000) }
  const stop  = () => clearInterval(timer)

  prevBtn?.addEventListener('click', () => { stop(); prev(); start() })
  nextBtn?.addEventListener('click', () => { stop(); next(); start() })

  carousel.addEventListener('mouseenter', stop)
  carousel.addEventListener('mouseleave', start)

  // Touch swipe
  let touchX = 0
  carousel.addEventListener('touchstart', e => { touchX = e.touches[0].clientX }, { passive: true })
  carousel.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX
    if (Math.abs(dx) > 40) { stop(); dx < 0 ? next() : prev(); start() }
  }, { passive: true })

  start()
})()

// ── Testimonials carousel ─────────────────────────────────
;(function () {
  const wrap   = document.querySelector('#testi-carousel')
  if (!wrap) return

  const track    = wrap.querySelector('.testi-track')
  const cards    = wrap.querySelectorAll('.testi-card')
  const prevBtn  = $('#testi-prev')
  const nextBtn  = $('#testi-next')
  const dotsWrap = $('#testi-dots')

  const total = cards.length
  let current = 0

  const visibleCount = () => window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1

  const cardW = () => 100 / visibleCount()

  const applyWidths = () => {
    cards.forEach(c => { c.style.flex = `0 0 ${cardW()}%`; c.style.maxWidth = `${cardW()}%` })
  }

  // Build dots
  const buildDots = () => {
    if (!dotsWrap) return
    dotsWrap.innerHTML = ''
    const count = total - visibleCount() + 1
    for (let i = 0; i < count; i++) {
      const d = document.createElement('button')
      d.className = 'testi-dot' + (i === 0 ? ' active' : '')
      d.setAttribute('aria-label', `Depoimento ${i + 1}`)
      d.addEventListener('click', () => go(i))
      dotsWrap.appendChild(d)
    }
  }

  const dots = () => dotsWrap?.querySelectorAll('.testi-dot')

  const maxIdx = () => Math.max(0, total - visibleCount())

  const go = (idx) => {
    current = Math.min(Math.max(idx, 0), maxIdx())
    track.style.transform = `translateX(-${current * cardW()}%)`
    dots()?.forEach((d, i) => d.classList.toggle('active', i === current))
  }

  prevBtn?.addEventListener('click', () => go(current - 1))
  nextBtn?.addEventListener('click', () => go(current + 1))

  // Touch swipe
  let touchX = 0
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX }, { passive: true })
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX
    if (Math.abs(dx) > 40) dx < 0 ? go(current + 1) : go(current - 1)
  }, { passive: true })

  const init = () => {
    applyWidths()
    buildDots()
    go(0)
  }

  window.addEventListener('resize', init)
  init()
})()
