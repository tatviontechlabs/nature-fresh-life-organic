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
  let lastScrollY = 0;

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

    lastScrollY = currentScrollY;
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
  return `https://wa.me/918849425517?text=${encodeURIComponent(message)}`;
}
