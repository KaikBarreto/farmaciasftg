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

// ── Banner carousels (generic) ────────────────────────────
const initBannerCarousel = ({ carouselId, trackSel, prevId, nextId, dotsId, interval = 10000 }) => {
  const carousel = document.getElementById(carouselId)
  if (!carousel) return

  const track    = carousel.querySelector(trackSel)
  const slides   = carousel.querySelectorAll('.banner-slide')
  const prevBtn  = document.getElementById(prevId)
  const nextBtn  = document.getElementById(nextId)
  const dotsWrap = document.getElementById(dotsId)

  let current = 0
  let timer   = null
  const total = slides.length

  slides.forEach((_, i) => {
    const d = document.createElement('button')
    d.className = 'banner-dot' + (i === 0 ? ' active' : '')
    d.setAttribute('aria-label', `Slide ${i + 1}`)
    d.addEventListener('click', () => { stop(); go(i); start() })
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
  const start = () => { timer = setInterval(next, interval) }
  const stop  = () => clearInterval(timer)

  prevBtn?.addEventListener('click', () => { stop(); prev(); start() })
  nextBtn?.addEventListener('click', () => { stop(); next(); start() })

  carousel.addEventListener('mouseenter', stop)
  carousel.addEventListener('mouseleave', start)

  let touchX = 0
  carousel.addEventListener('touchstart', e => { touchX = e.touches[0].clientX }, { passive: true })
  carousel.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX
    if (Math.abs(dx) > 40) { stop(); dx < 0 ? next() : prev(); start() }
  }, { passive: true })

  start()
}

initBannerCarousel({
  carouselId: 'ecom-carousel',
  trackSel:   '.banner-track',
  prevId:     'ecom-prev',
  nextId:     'ecom-next',
  dotsId:     'ecom-dots',
  interval:   3500,
})

initBannerCarousel({
  carouselId: 'banner-carousel',
  trackSel:   '.banner-track',
  prevId:     'banner-prev',
  nextId:     'banner-next',
  dotsId:     'banner-dots',
  interval:   10000,
})

// ── Testimonials carousel (infinite clone-based) ──────────
;(function () {
  const wrap   = document.querySelector('#testi-carousel')
  if (!wrap) return

  const track    = wrap.querySelector('.testi-track')
  const prevBtn  = $('#testi-prev')
  const nextBtn  = $('#testi-next')
  const dotsWrap = $('#testi-dots')

  const origCards = Array.from(track.querySelectorAll('.testi-card'))
  const total     = origCards.length
  let current     = 0  // index into full cloned list; set to vc after setup
  let timer       = null

  const vc      = () => window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1
  const cardW   = () => 100 / vc()
  const allCards = () => Array.from(track.querySelectorAll('.testi-card'))

  const setupClones = () => {
    track.querySelectorAll('.testi-clone').forEach(c => c.remove())
    const v = vc()
    // prepend clones of last v originals
    for (let i = total - v; i < total; i++) {
      const cl = origCards[i].cloneNode(true)
      cl.classList.add('testi-clone')
      track.insertBefore(cl, track.firstChild)
    }
    // append clones of first v originals
    for (let i = 0; i < v; i++) {
      const cl = origCards[i].cloneNode(true)
      cl.classList.add('testi-clone')
      track.appendChild(cl)
    }
    allCards().forEach(c => {
      c.style.flex = `0 0 ${cardW()}%`
      c.style.maxWidth = `${cardW()}%`
    })
    current = v
    track.style.transition = 'none'
    track.style.transform  = `translateX(-${current * cardW()}%)`
  }

  const buildDots = () => {
    if (!dotsWrap) return
    dotsWrap.innerHTML = ''
    for (let i = 0; i < total; i++) {
      const d = document.createElement('button')
      d.className = 'testi-dot'
      d.setAttribute('aria-label', `Depoimento ${i + 1}`)
      d.addEventListener('click', () => { stop(); goToReal(i); start() })
      dotsWrap.appendChild(d)
    }
  }

  const updateDots = () => {
    const v       = vc()
    const realIdx = ((current - v) % total + total) % total
    dotsWrap?.querySelectorAll('.testi-dot').forEach((d, i) =>
      d.classList.toggle('active', i === realIdx))
  }

  const go = (idx) => {
    current = idx
    track.style.transition = 'transform 0.5s cubic-bezier(.4,0,.2,1)'
    track.style.transform  = `translateX(-${current * cardW()}%)`
    updateDots()
  }

  const goToReal = (realIdx) => go(vc() + realIdx)

  track.addEventListener('transitionend', () => {
    const v = vc()
    if (current < v) {
      track.style.transition = 'none'
      current += total
      track.style.transform  = `translateX(-${current * cardW()}%)`
    } else if (current >= v + total) {
      track.style.transition = 'none'
      current -= total
      track.style.transform  = `translateX(-${current * cardW()}%)`
    }
  })

  const next  = () => go(current + 1)
  const prev  = () => go(current - 1)
  const start = () => { timer = setInterval(next, 4500) }
  const stop  = () => clearInterval(timer)

  prevBtn?.addEventListener('click', () => { stop(); prev(); start() })
  nextBtn?.addEventListener('click', () => { stop(); next(); start() })

  wrap.addEventListener('mouseenter', stop)
  wrap.addEventListener('mouseleave', start)

  let touchX = 0
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX }, { passive: true })
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX
    if (Math.abs(dx) > 40) { stop(); dx < 0 ? next() : prev(); start() }
  }, { passive: true })

  const init = () => {
    setupClones()
    buildDots()
    updateDots()
  }

  let resizeTimer
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => { stop(); init(); start() }, 150)
  })

  init()
  start()
})()
