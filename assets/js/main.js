(() => {
  'use strict';

  /* Número do WhatsApp que recebe as solicitações do formulário.
     Formato internacional, só dígitos (ex.: '5548999999999'). */
  const WHATSAPP_NUMBER = '';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Imagens que falharem somem, deixando o fundo de reserva ---------- */
  document.querySelectorAll('img').forEach((img) => {
    const fail = () => img.classList.add('img-failed');
    if (img.complete && img.naturalWidth === 0 && img.src) fail();
    img.addEventListener('error', fail);
  });

  /* ---------- Header, barra de progresso, CTA fixo ---------- */
  const header = document.getElementById('siteHeader');
  const progress = document.getElementById('scrollProgress');
  const stickyCta = document.getElementById('stickyCta');
  const applySection = document.getElementById('aplicar');
  const parallaxEls = prefersReducedMotion ? [] : Array.from(document.querySelectorAll('[data-parallax]'));

  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 20);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    const applyTop = applySection.getBoundingClientRect().top;
    stickyCta.classList.toggle('show', y > window.innerHeight * 0.8 && applyTop > window.innerHeight);

    parallaxEls.forEach((el) => {
      const rect = el.parentElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * parseFloat(el.dataset.parallax);
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Menu mobile ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  const setMenu = (open) => {
    mainNav.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    navToggle.innerHTML = `<svg width="24" height="24"><use href="#i-${open ? 'close' : 'menu'}"></use></svg>`;
  };
  navToggle.addEventListener('click', () => setMenu(!mainNav.classList.contains('open')));
  mainNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* ---------- Link ativo no menu ---------- */
  const navLinks = Array.from(mainNav.querySelectorAll('a'));
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach((a) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) sectionObserver.observe(target);
    });
  }

  /* ---------- Reveal ao rolar ---------- */
  const revealEls = document.querySelectorAll('.reveal, .steps, .compare, .exp-media');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in-view'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Contadores ---------- */
  const formatNumber = (value, el) => {
    if (el.dataset.format === 'thousands') return value.toLocaleString('pt-BR');
    if (el.dataset.pad) return String(value).padStart(parseInt(el.dataset.pad, 10), '0');
    return String(value);
  };
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    if (prefersReducedMotion) { el.textContent = formatNumber(target, el); return; }
    const duration = parseInt(el.dataset.duration || '1600', 10);
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNumber(Math.round(target * eased), el);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counters = document.querySelectorAll('.counter');
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => {
      if (!prefersReducedMotion) el.textContent = formatNumber(0, el);
      counterObserver.observe(el);
    });
  }

  /* ---------- FAQ: um item aberto por vez ---------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      faqItems.forEach((other) => { if (other !== item) other.open = false; });
    });
  });

  /* ---------- Retrato do hero acompanha o mouse ---------- */
  const portrait = document.querySelector('.hero-portrait');
  if (portrait && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const hero = document.querySelector('.hero');
    hero.addEventListener('mousemove', (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      portrait.style.transform = `translate(${x * -14}px, ${y * -10}px)`;
    });
    hero.addEventListener('mouseleave', () => { portrait.style.transform = ''; });
    portrait.style.transition = 'transform .6s cubic-bezier(.22,.8,.24,1)';
  }

  /* ---------- Formulário → WhatsApp ---------- */
  const form = document.getElementById('applyForm');
  const note = document.getElementById('formNote');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach((field) => {
      const ok = field.value.trim() !== '';
      field.classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) { note.textContent = 'Preencha todos os campos para continuar.'; return; }

    const data = new FormData(form);
    const message = [
      'Olá, Paulo! Quero verificar a disponibilidade do acompanhamento estratégico.',
      `Nome: ${data.get('nome')}`,
      `Empresa: ${data.get('empresa')}`,
      `WhatsApp: ${data.get('whatsapp')}`,
      `Momento: ${data.get('momento')}`,
    ].join('\n');

    if (!WHATSAPP_NUMBER) {
      note.textContent = 'Solicitação pronta! Configure o número de WhatsApp em assets/js/main.js para receber os contatos.';
      return;
    }
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    note.textContent = 'Abrindo o WhatsApp para finalizar sua solicitação…';
    form.reset();
  });
  form.querySelectorAll('input, select').forEach((field) => {
    field.addEventListener('input', () => field.classList.remove('is-invalid'));
  });

  /* ---------- Voltar ao topo / ano ---------- */
  document.getElementById('toTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
  document.getElementById('year').textContent = new Date().getFullYear();
})();
