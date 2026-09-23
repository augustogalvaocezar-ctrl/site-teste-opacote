(() => {
  'use strict';

  /* Configurações editáveis ficam em assets/js/config.js */
  const CONFIG = window.LP_CONFIG || {};
  const WHATSAPP_NUMBER = String(CONFIG.whatsapp || '').replace(/\D/g, '');

  /* ---------- Rastreamento (Meta Pixel / GA4), só se configurado ---------- */
  const track = (name, params) => {
    if (window.fbq) window.fbq('track', name, params);
    if (window.gtag) window.gtag('event', name, params);
  };
  if (CONFIG.metaPixelId) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', CONFIG.metaPixelId);
    window.fbq('track', 'PageView');
  }
  if (CONFIG.ga4Id) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(CONFIG.ga4Id)}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', CONFIG.ga4Id);
  }
  document.addEventListener('click', (e) => {
    const cta = e.target.closest('a[href="#aplicar"]');
    if (cta) track('ViewContent', { content_name: 'Verificar disponibilidade' });
  });

  /* ---------- Vídeo do Paulo (só aparece com youtubeId) ---------- */
  if (CONFIG.youtubeId || CONFIG.demo) {
    const videoSection = document.getElementById('video');
    videoSection.hidden = false;
    document.getElementById('videoPoster').addEventListener('click', (e) => {
      if (!CONFIG.youtubeId) {
        e.currentTarget.querySelector('.video-play').insertAdjacentHTML('afterend', '<span class="demo-note">Prévia: o vídeo do Paulo entra aqui</span>');
        return;
      }
      const frame = document.createElement('iframe');
      frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(CONFIG.youtubeId)}?autoplay=1&rel=0`;
      frame.title = 'Vídeo do Paulo Ávila';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture';
      frame.allowFullscreen = true;
      e.currentTarget.replaceWith(frame);
      track('ViewContent', { content_name: 'Vídeo do Paulo' });
    });
  }

  /* ---------- Depoimentos (só aparecem se houver itens reais) ---------- */
  const depoimentos = Array.isArray(CONFIG.depoimentos) ? CONFIG.depoimentos.filter((d) => d && d.texto && d.nome) : [];
  if (depoimentos.length) {
    const grid = document.getElementById('testiGrid');
    depoimentos.forEach((d) => {
      const card = document.createElement('figure');
      card.className = 'testi-card';
      if (CONFIG.demo) {
        const tag = document.createElement('span');
        tag.className = 'demo-tag';
        tag.textContent = 'Exemplo';
        card.appendChild(tag);
      }
      if (d.resultado) {
        const r = document.createElement('span');
        r.className = 'testi-result';
        r.textContent = d.resultado;
        card.appendChild(r);
      }
      const q = document.createElement('blockquote');
      q.className = 'testi-text';
      q.style.margin = '0';
      q.textContent = d.texto;
      card.appendChild(q);
      const who = document.createElement('figcaption');
      who.className = 'testi-who';
      if (d.foto) {
        const img = document.createElement('img');
        img.src = d.foto; img.alt = d.nome; img.loading = 'lazy';
        who.appendChild(img);
      } else {
        const av = document.createElement('span');
        av.className = 'testi-avatar';
        av.textContent = d.nome.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
        who.appendChild(av);
      }
      const info = document.createElement('div');
      const n = document.createElement('strong'); n.textContent = d.nome;
      const c = document.createElement('small'); c.textContent = d.empresa || '';
      info.append(n, c);
      who.appendChild(info);
      card.appendChild(who);
      grid.appendChild(card);
    });
    document.getElementById('depoimentos').hidden = false;
  }

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
  const parallaxEls = (reduceMotion || !finePointer) ? [] : Array.from(document.querySelectorAll('[data-parallax]'));
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
  const fxSections = (reduceMotion || !finePointer) ? [] : Array.from(document.querySelectorAll('main > section:not(.hero):not(.marquee)'));
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

  /* ---------- Botão fixo some quando outro botão de chamada está na tela ---------- */
  if (hasIOEarly()) {
    const inlineCtas = document.querySelectorAll('main a.btn-neon[href="#aplicar"], .apply-form');
    const visible = new Set();
    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      stickyCta.classList.toggle('hide-inline', visible.size > 0);
    }, { threshold: 0.3 });
    inlineCtas.forEach((el) => ctaObserver.observe(el));
  }
  function hasIOEarly() { return 'IntersectionObserver' in window; }

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
    // só no mouse: no toque o destaque trocando fazia o carrossel "dançar"
    if (!finePointer) return;
    cards.forEach((card) => {
      card.addEventListener('pointerenter', () => activate(card));
      card.addEventListener('focusin', () => activate(card));
    });
    group.addEventListener('pointerleave', () => activate(initial));
  });

  /* ---------- Spotlight dentro dos cards ---------- */
  if (finePointer) document.querySelectorAll('.glow-card').forEach((card) => {
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
      note.textContent = 'Solicitação pronta! Configure o número de WhatsApp em assets/js/config.js para receber os contatos.';
      return;
    }
    track('Lead', { content_name: 'Conversa estratégica' });
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    note.textContent = 'Abrindo o WhatsApp para finalizar sua solicitação…';
    form.reset();
  });
  const phone = document.getElementById('f-whats');
  phone.addEventListener('input', () => {
    const d = phone.value.replace(/\D/g, '').slice(0, 11);
    phone.value = d.length > 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
      : d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
      : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
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
