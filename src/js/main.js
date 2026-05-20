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

// ── Lojas — mapa interativo (Leaflet) ─────────────────────
;(function () {
  const el = document.getElementById('lojas-map')
  if (!el || typeof L === 'undefined') return

  // ⚠️ Substituir por dados reais quando disponíveis
  const lojas = [
    { nome: 'Centro · Matriz',  cidade: 'Goiânia', uf: 'GO', lat: -16.6869, lng: -49.2648, end: 'Endereço completo, nº — Bairro', tel: '(62) 0000-0000' },
    { nome: 'Aparecida',        cidade: 'Aparecida de Goiânia', uf: 'GO', lat: -16.8233, lng: -49.2444, end: 'Endereço completo, nº — Bairro', tel: '(62) 0000-0000' },
    { nome: 'Anápolis',         cidade: 'Anápolis', uf: 'GO', lat: -16.3281, lng: -48.9535, end: 'Endereço completo, nº — Bairro', tel: '(62) 0000-0000' },
    { nome: 'Trindade',         cidade: 'Trindade', uf: 'GO', lat: -16.6502, lng: -49.4871, end: 'Endereço completo, nº — Bairro', tel: '(62) 0000-0000' },
    { nome: 'Senador Canedo',   cidade: 'Senador Canedo', uf: 'GO', lat: -16.7053, lng: -49.0958, end: 'Endereço completo, nº — Bairro', tel: '(62) 0000-0000' },
    { nome: 'Goianira',         cidade: 'Goianira', uf: 'GO', lat: -16.4981, lng: -49.4274, end: 'Endereço completo, nº — Bairro', tel: '(62) 0000-0000' },
    { nome: 'Loja MG · Norte',  cidade: 'Uberlândia', uf: 'MG', lat: -18.9186, lng: -48.2772, end: 'Endereço completo, nº — Bairro', tel: '(34) 0000-0000' },
    { nome: 'Loja MG · Sul',    cidade: 'Patos de Minas', uf: 'MG', lat: -18.5780, lng: -46.5181, end: 'Endereço completo, nº — Bairro', tel: '(34) 0000-0000' },
  ]

  const isMobile = window.innerWidth < 768

  const map = L.map('lojas-map', {
    zoomControl: false,
    scrollWheelZoom: false,
    dragging: true,
    tap: true,
  })
  L.control.zoom({ position: 'bottomright' }).addTo(map)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: 'abcd',
  }).addTo(map)

  // Custom pin SVG with wine + gold
  const pinIcon = L.divIcon({
    className: 'ftg-pin',
    html: `
      <div class="ftg-pin-inner">
        <svg width="38" height="48" viewBox="0 0 38 48" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 0C8.507 0 0 8.507 0 19c0 13 19 29 19 29s19-16 19-29C38 8.507 29.493 0 19 0z" fill="#8B1A24"/>
          <circle cx="19" cy="19" r="9" fill="#F8F4ED"/>
          <text x="19" y="24" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="14" fill="#8B1A24">+</text>
        </svg>
        <div class="ftg-pin-pulse"></div>
      </div>
    `,
    iconSize: [38, 48],
    iconAnchor: [19, 48],
    popupAnchor: [0, -44],
  })

  const waBase = 'https://api.whatsapp.com/send/?phone=558000640800&text='
  const buildWaUrl = (loja) =>
    waBase + encodeURIComponent(`Olá! Vim pelo site da Farmácia FTG. Gostaria de falar com a loja de *${loja.cidade} — ${loja.uf}*. 💊`)

  const markers = []
  lojas.forEach((loja) => {
    const m = L.marker([loja.lat, loja.lng], { icon: pinIcon }).addTo(map)
    const html = `
      <div class="ftg-popup">
        <span class="ftg-popup-tag">${loja.cidade} · ${loja.uf}</span>
        <h3 class="ftg-popup-title">${loja.nome}</h3>
        <p class="ftg-popup-row">
          <svg class="ftg-popup-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
          ${loja.end}
        </p>
        <p class="ftg-popup-row">
          <svg class="ftg-popup-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
          <a href="tel:${loja.tel.replace(/\D/g, '')}">${loja.tel}</a>
        </p>
        <div class="ftg-popup-actions">
          <a href="${buildWaUrl(loja)}" target="_blank" rel="noopener noreferrer" class="ftg-popup-cta">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Falar no WhatsApp
          </a>
        </div>
      </div>`
    m.bindPopup(html, { maxWidth: isMobile ? 240 : 280, className: 'ftg-popup-wrap', closeButton: true, autoPan: true, autoPanPadding: [20, 20] })
    markers.push(m)
  })

  // Fit bounds to all markers
  const group = L.featureGroup(markers)
  map.fitBounds(group.getBounds().pad(0.18))

  // Auto-open first popup only on desktop (mobile: cleaner intro)
  if (!isMobile) setTimeout(() => markers[0]?.openPopup(), 700)
})()
