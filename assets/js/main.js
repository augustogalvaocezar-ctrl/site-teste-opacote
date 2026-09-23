(() => {
  'use strict';

  /* Número do WhatsApp que recebe as solicitações do formulário.
     Formato internacional, só dígitos (ex.: '5548999999999'). */
  const WHATSAPP_NUMBER = '';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const fx = !reduceMotion && finePointer;

  /* ---------- Imagens que falharem somem, deixando o fundo de reserva ---------- */
  document.querySelectorAll('img').forEach((img) => {
    const fail = () => img.classList.add('img-failed');
    if (img.complete && img.naturalWidth === 0 && img.src) fail();
    img.addEventListener('error', fail);
  });

  /* ---------- Scroll: header, progresso, CTA fixo, parallax ---------- */
  const header = document.getElementById('siteHeader');
  const progress = document.getElementById('scrollProgress');
  const stickyCta = document.getElementById('stickyCta');
  const applySection = document.getElementById('aplicar');
  const parallaxEls = reduceMotion ? [] : Array.from(document.querySelectorAll('[data-parallax]'));
  const driftEls = reduceMotion ? [] : Array.from(document.querySelectorAll('[data-drift]'));

  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    header.classList.toggle('scrolled', y > 20);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    stickyCta.classList.toggle('show', y > vh * 0.8 && applySection.getBoundingClientRect().top > vh);

    parallaxEls.forEach((el) => {
      const rect = el.parentElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const offset = (rect.top + rect.height / 2 - vh / 2) * parseFloat(el.dataset.parallax);
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
    driftEls.forEach((el) => {
      el.style.transform = `translate3d(${y * parseFloat(el.dataset.drift)}px, 0, 0)`;
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Transição entre seções (scroll) ---------- */
  const fxSections = reduceMotion ? [] : Array.from(document.querySelectorAll('main > section:not(.hero):not(.marquee)'));
  if (fxSections.length) {
    document.documentElement.classList.add('js-fx');
    fxSections.forEach((s) => s.classList.add('fx-section'));
    let fxTick = false;
    const updateFx = () => {
      const vh = window.innerHeight;
      fxSections.forEach((s) => {
        const top = s.getBoundingClientRect().top;
        // 0 quando o topo da seção aparece no rodapé da tela, 1 quando chega a 30% da altura
        const p = Math.min(Math.max((vh - top) / (vh * 0.7), 0), 1);
        s.style.setProperty('--p', p.toFixed(3));
      });
      fxTick = false;
    };
    window.addEventListener('scroll', () => {
      if (!fxTick) { requestAnimationFrame(updateFx); fxTick = true; }
    }, { passive: true });
    window.addEventListener('resize', updateFx);
    updateFx();
  }

  /* ---------- Brilho que segue o cursor ---------- */
  const cursorGlow = document.getElementById('cursorGlow');
  if (fx) {
    let cx = 0, cy = 0, tx = 0, ty = 0, running = false;
    const follow = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      cursorGlow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) requestAnimationFrame(follow);
      else running = false;
    };
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      cursorGlow.classList.add('on');
      if (!running) { running = true; requestAnimationFrame(follow); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => cursorGlow.classList.remove('on'));
  }

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

  const hasIO = 'IntersectionObserver' in window;

  /* ---------- Link ativo no menu ---------- */
  const navLinks = Array.from(mainNav.querySelectorAll('a'));
  if (hasIO) {
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
  const revealEls = document.querySelectorAll('.reveal, .steps, .compare, .tl');
  if (reduceMotion || !hasIO) {
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
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = formatNumber(Math.round(target * eased), el);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (hasIO && !reduceMotion) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.counter').forEach((el) => {
      el.textContent = formatNumber(0, el);
      counterObserver.observe(el);
    });
  }

  /* ---------- Curva de crescimento da história (liga os pontos de cada ano) ---------- */
  const tl = document.getElementById('timeline');
  const curve = tl && tl.querySelector('.tl-curve');
  if (curve) {
    const line = curve.querySelector('.tl-line');
    const area = curve.querySelector('.tl-area');
    const dots = Array.from(tl.querySelectorAll('.tl-dot'));
    const drawCurve = () => {
      if (getComputedStyle(curve).display === 'none') return;
      // offsets ignoram o transform da animação de entrada dos cards
      const w = tl.clientWidth;
      const h = tl.clientHeight;
      const pts = dots.map((d) => {
        const item = d.parentElement;
        return [item.offsetLeft + d.offsetLeft + d.offsetWidth / 2, item.offsetTop + d.offsetTop + d.offsetHeight / 2];
      });
      pts.push([w, pts[pts.length - 1][1] - 24]);
      let d = `M${pts[0][0]} ${pts[0][1]}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += ` C${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
      }
      curve.setAttribute('viewBox', `0 0 ${w} ${h}`);
      line.setAttribute('d', d);
      area.setAttribute('d', `${d} L${w} ${h} L${pts[0][0]} ${h} Z`);
      line.style.setProperty('--len', Math.ceil(line.getTotalLength()));
    };
    drawCurve();
    window.addEventListener('load', drawCurve);
    if ('ResizeObserver' in window) new ResizeObserver(drawCurve).observe(tl);
    else window.addEventListener('resize', drawCurve);
  }

  /* ---------- Cards com destaque: o card sob o mouse "acende" ---------- */
  document.querySelectorAll('[data-hl-group]').forEach((group) => {
    const cards = Array.from(group.querySelectorAll('.hl-card'));
    const initial = cards.find((c) => c.classList.contains('is-hl'));
    const activate = (card) => cards.forEach((c) => c.classList.toggle('is-hl', c === card));
    cards.forEach((card) => {
      card.addEventListener('pointerenter', () => activate(card));
      card.addEventListener('focusin', () => activate(card));
      card.addEventListener('click', () => activate(card));
    });
    group.addEventListener('pointerleave', () => activate(initial));
  });

  /* ---------- Spotlight dentro dos cards ---------- */
  document.querySelectorAll('.glow-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Tilt 3D ---------- */
  if (fx) {
    document.querySelectorAll('.tilt').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${y * -8}deg) rotateY(${x * 10}deg) translateY(-8px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Botões magnéticos ---------- */
  if (fx) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Retrato + órbitas acompanham o mouse ---------- */
  const orbitStage = document.getElementById('orbitStage');
  if (fx && orbitStage) {
    const hero = document.querySelector('.hero');
    hero.addEventListener('pointermove', (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      orbitStage.style.transform = `perspective(1200px) rotateY(${x * 6}deg) rotateX(${y * -4}deg) translate(${x * -10}px, ${y * -8}px)`;
    });
    hero.addEventListener('pointerleave', () => { orbitStage.style.transform = ''; });
  }

  /* ---------- Checklist "para quem é" ---------- */
  const fitButtons = Array.from(document.querySelectorAll('#fitList button'));
  const fitFill = document.getElementById('fitFill');
  const fitCount = document.getElementById('fitCount');
  const updateFit = () => {
    const n = fitButtons.filter((b) => b.getAttribute('aria-pressed') === 'true').length;
    fitFill.style.width = `${(n / fitButtons.length) * 100}%`;
    fitCount.textContent = `${n}/${fitButtons.length}`;
  };
  fitButtons.forEach((b) => b.addEventListener('click', () => {
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
    updateFit();
  }));

  /* ---------- FAQ: um item aberto por vez ---------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      faqItems.forEach((other) => { if (other !== item) other.open = false; });
    });
  });

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
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  document.getElementById('year').textContent = new Date().getFullYear();
})();
