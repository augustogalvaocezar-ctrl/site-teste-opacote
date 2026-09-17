(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky header shadow ---------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.innerHTML = isOpen
      ? '<svg class="icon" width="22" height="22"><use href="#icon-close"></use></svg>'
      : '<svg class="icon" width="24" height="24"><use href="#icon-menu"></use></svg>';
  });
  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.innerHTML = '<svg class="icon" width="24" height="24"><use href="#icon-menu"></use></svg>';
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in-view'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Counters ---------- */
  const counters = document.querySelectorAll('.counter');
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const isYear = el.dataset.format === 'year';
    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const startVal = isYear ? target - 12 : 0;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(startVal + (target - startVal) * eased);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
  };

  if (counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  }

  /* ---------- Contact form (front-end only) ---------- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      formNote.textContent = 'Mensagem pronta para envio! Conecte este formulário ao seu backend ou serviço de e-mail preferido.';
      form.reset();
    });
  }

  /* ---------- Back to top ---------- */
  const toTop = document.getElementById('toTop');
  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Hero visual subtle parallax on pointer move ---------- */
  const visualPanel = document.querySelector('.visual-panel');
  if (visualPanel && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const cards = visualPanel.querySelectorAll('.floating-card, .floating-badge');
    visualPanel.addEventListener('mousemove', (e) => {
      const rect = visualPanel.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cards.forEach((card, i) => {
        const depth = 10 + i * 4;
        card.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });
    });
    visualPanel.addEventListener('mouseleave', () => {
      cards.forEach((card) => { card.style.transform = ''; });
    });
  }
})();
