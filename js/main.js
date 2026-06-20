/* ============================================
   NFL — main.js
   Shared functionality across all pages:
   - Mobile navigation
   - Sticky header
   - Scroll-to-top
   - Scroll animations
   - Active nav highlighting
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Sticky Header with Scroll Shadow ──
  const navbar = document.getElementById('navbar');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Add scrolled class for shadow/background
    if (currentScrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Show/hide scroll-to-top button
    if (scrollTopBtn) {
      if (currentScrollY > 500) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }

  }, { passive: true });

  // ── Scroll to Top ──
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Mobile Menu Toggle ──
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileMenu() {
    hamburger.classList.add('active');
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      if (mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }

  // Close mobile menu when clicking a link
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close mobile menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // ── Active Nav Link Highlighting ──
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ── Intersection Observer for Scroll Animations ──
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  if (animatedElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target); // Animate only once
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  }

  // ── Smooth Scroll for Anchor Links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ── Counter Animation (for stats sections) ──
  const counters = document.querySelectorAll('[data-count]');

  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'));
          const suffix = el.getAttribute('data-suffix') || '';
          const prefix = el.getAttribute('data-prefix') || '';
          let current = 0;
          const increment = target / 60; // ~60 frames
          const duration = 2000;
          const stepTime = duration / 60;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            el.textContent = prefix + Math.floor(current) + suffix;
          }, stepTime);

          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
  }

  // ── Testimonial Carousel (simple auto-advance) ──
  const carousel = document.getElementById('testimonialCarousel');
  if (carousel) {
    const slides = carousel.querySelectorAll('.testimonial-slide');
    const dots = carousel.querySelectorAll('.carousel-dot');
    let currentSlide = 0;

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.style.display = i === index ? 'block' : 'none';
        slide.style.opacity = i === index ? '1' : '0';
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    // Auto-advance every 5 seconds
    setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, 5000);

    // Dot click navigation
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        currentSlide = i;
        showSlide(currentSlide);
      });
    });

    showSlide(0);
  }

  // ── Featured Products Carousel ──
  const featuredCarousel = document.getElementById('featuredCarousel');
  if (featuredCarousel) {
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const track = featuredCarousel.querySelector('.carousel-track');

    if (prevBtn && nextBtn && track) {
      const scrollAmount = 320;

      prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });

      nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    }
  }

  // ── Hero Section Image Slider ──
  const heroSlider = document.getElementById('heroSlider');
  if (heroSlider) {
    const slides = heroSlider.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
      if (index >= slides.length) index = 0;
      if (index < 0) index = slides.length - 1;

      // Visibility + content reveal are handled entirely by the `.active`
      // class via CSS — this keeps the crossfade clean and flicker-free.
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });

      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });

      currentSlide = index;
    }

    function startAutoPlay() {
      stopAutoPlay();
      slideInterval = setInterval(() => {
        showSlide(currentSlide + 1);
      }, 6000);
    }

    function stopAutoPlay() {
      if (slideInterval) {
        clearInterval(slideInterval);
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
        startAutoPlay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
        startAutoPlay();
      });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        showSlide(i);
        startAutoPlay();
      });
    });

    // Pause autoplay while the user is interacting with the hero
    heroSlider.addEventListener('mouseenter', stopAutoPlay);
    heroSlider.addEventListener('mouseleave', startAutoPlay);

    showSlide(0);
    startAutoPlay();
  }

  // ── Multi-language switcher (Google Translate) ──
  nflInitLanguageSwitcher();

});


// ── Utility: Show Toast Notification ──
function showToast(message, type = 'success') {
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <span>${type === 'success' ? '✓' : '✕'}</span>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(toast);

  // Trigger show animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto-dismiss after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ── Utility: Format WhatsApp Link ──
function getWhatsAppLink(message = 'Hello NFL, I am interested in your products.') {
  return `https://wa.me/919638291232?text=${encodeURIComponent(message)}`;
}

/* ============================================
   MULTI-LANGUAGE (Google Translate)
   Default English; switch to Hindi / Gujarati.
   ============================================ */

// Called by the Google Translate script once it loads (must be global).
function googleTranslateElementInit() {
  /* global google */
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'en,hi,gu',
    autoDisplay: false
  }, 'google_translate_element');
}

// Read the currently-selected language from Google's cookie (default 'en').
function nflGetCurrentLang() {
  const match = document.cookie.match(/googtrans=\/en\/(\w+)/);
  return match ? match[1] : 'en';
}

// Switch language by setting Google's cookie, then reloading so it applies.
function nflSetLanguage(lang) {
  const host = location.hostname;
  // Clear any existing preference first (both host- and domain-scoped).
  document.cookie = 'googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'googtrans=;path=/;domain=.' + host + ';expires=Thu, 01 Jan 1970 00:00:00 GMT';
  if (lang && lang !== 'en') {
    document.cookie = 'googtrans=/en/' + lang + ';path=/';
    document.cookie = 'googtrans=/en/' + lang + ';path=/;domain=.' + host;
  }
  location.reload();
}

// Inject the hidden translate container + script and the navbar/menu switchers.
function nflInitLanguageSwitcher() {
  // 1) Hidden Google Translate element + loader (once per page).
  if (!document.getElementById('google_translate_element')) {
    const el = document.createElement('div');
    el.id = 'google_translate_element';
    el.className = 'notranslate';
    document.body.appendChild(el);

    const s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.body.appendChild(s);
  }

  const current = nflGetCurrentLang();

  function buildSwitcher(extraClass) {
    const wrap = document.createElement('div');
    wrap.className = 'nfl-lang notranslate ' + (extraClass || '');
    wrap.setAttribute('translate', 'no');
    const select = document.createElement('select');
    select.className = 'nfl-lang-select';
    select.setAttribute('aria-label', 'Select language');
    select.innerHTML = `
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
      <option value="gu">ગુજરાતી</option>`;
    select.value = current;
    select.addEventListener('change', () => nflSetLanguage(select.value));
    wrap.appendChild(select);
    return wrap;
  }

  // 2) Desktop navbar — before the "Request Quote" button.
  const desktopNav = document.querySelector('#navbar .lg\\:flex');
  if (desktopNav && !desktopNav.querySelector('.nfl-lang')) {
    const quoteBtn = desktopNav.querySelector('.btn-primary');
    const sw = buildSwitcher();
    if (quoteBtn) desktopNav.insertBefore(sw, quoteBtn);
    else desktopNav.appendChild(sw);
  }

  // 3) Mobile slide-in menu — at the top of the links list.
  const mobileLinks = document.querySelector('#mobileMenu .flex.flex-col');
  if (mobileLinks && !mobileLinks.querySelector('.nfl-lang')) {
    mobileLinks.insertBefore(buildSwitcher('mb-2'), mobileLinks.firstChild);
  }
}

/* ============================================
   SHARED EMAIL DELIVERY
   Primary  : EmailJS  (clean format, IST time, no third-party branding)
   Fallback : FormSubmit.co  (used only if EmailJS errors or hits its quota)
   ============================================ */

// EmailJS browser SDK uses the PUBLIC key only. The private key is intentionally
// NOT stored here — it must never be exposed in client-side code.
const NFL_EMAILJS = {
  publicKey: 'dE1CyyI5KZf2Aska0',
  serviceId: 'service_hizjmj6',    // ← EmailJS dashboard → Email Services → Service ID
  templateId: 'template_si0bzbi'   // ← EmailJS dashboard → Email Templates → Template ID
};

// Fallback provider — submissions land in this inbox if EmailJS is unavailable.
const NFL_FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/support@naturefreshlifeorganic.com';

// Date/time formatted in India Standard Time, regardless of the visitor's device.
function getISTTimestamp() {
  return new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true
  }) + ' IST';
}

let _emailjsInitialised = false;
function _initEmailJS() {
  if (_emailjsInitialised) return true;
  if (typeof emailjs === 'undefined') return false;
  try {
    emailjs.init({ publicKey: NFL_EMAILJS.publicKey });
    _emailjsInitialised = true;
    return true;
  } catch (e) {
    console.warn('EmailJS init failed:', e);
    return false;
  }
}

// True only once real IDs (not the placeholders) have been filled in above.
function _emailjsConfigured() {
  return NFL_EMAILJS.serviceId && !NFL_EMAILJS.serviceId.startsWith('YOUR_') &&
         NFL_EMAILJS.templateId && !NFL_EMAILJS.templateId.startsWith('YOUR_');
}

/**
 * Send an inquiry, trying EmailJS first and falling back to FormSubmit.
 * @param {object} emailjsParams    Template params for EmailJS.
 * @param {object} formsubmitPayload JSON body for the FormSubmit fallback.
 * @returns {Promise<'emailjs'|'formsubmit'>} which provider delivered it.
 * @throws if BOTH providers fail.
 */
async function sendInquiry(emailjsParams, formsubmitPayload) {
  // 1) Primary — EmailJS
  if (_emailjsConfigured() && _initEmailJS()) {
    try {
      await emailjs.send(NFL_EMAILJS.serviceId, NFL_EMAILJS.templateId, emailjsParams);
      return 'emailjs';
    } catch (err) {
      // Quota reached / rate-limited / network — quietly fall through to backup.
      console.warn('EmailJS failed — falling back to FormSubmit.', err);
    }
  }

  // 2) Fallback — FormSubmit.co
  const res = await fetch(NFL_FORMSUBMIT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(formsubmitPayload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false || data.success === 'false') {
    throw new Error(data.message || 'All email providers failed');
  }
  return 'formsubmit';
}
