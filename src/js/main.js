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
