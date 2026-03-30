/* ========================================================
   script.js — FinanceEmpresa Premium
   Cursor · Canvas Particles · Counter · Scroll · Calc · Forms
======================================================== */

// ─── UTILS ──────────────────────────────────────────────
function formatBRL(n) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(n);
}
function parseBRL(str) {
  return parseFloat(str.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')) || 0;
}
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

// ─── CUSTOM CURSOR ──────────────────────────────────────
const cursor       = document.getElementById('cursor');
const cursorFollow = document.getElementById('cursorFollower');

if (cursor && window.matchMedia('(pointer:fine)').matches) {
  let mx = 0, my = 0, fx = 0, fy = 0;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  // Dot follows instantly
  window.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });

  // Follower lags
  (function tick() {
    fx = lerp(fx, mx, 0.11);
    fy = lerp(fy, my, 0.11);
    cursorFollow.style.left = fx + 'px';
    cursorFollow.style.top  = fy + 'px';
    requestAnimationFrame(tick);
  })();

  // Hover state on interactive elements
  document.querySelectorAll('a, button, input, select, textarea, label').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// ─── NAVBAR SCROLL ──────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

// ─── MOBILE MENU ────────────────────────────────────────
const menuToggle = document.getElementById('menuToggle');
const mobileNav  = document.getElementById('mobileNav');
menuToggle?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  menuToggle.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuToggle.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// ─── HERO CANVAS PARTICLES ──────────────────────────────
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const GOLD  = [200, 151, 62];
  const WHITE = [220, 230, 255];
  const COUNT = 55;

  class Particle {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x  = Math.random() * canvas.width;
      this.y  = initial ? Math.random() * canvas.height : canvas.height + 10;
      this.r  = Math.random() * 1.4 + 0.4;
      this.vy = -(Math.random() * 0.35 + 0.1);
      this.vx = (Math.random() - 0.5) * 0.18;
      this.alpha = Math.random() * 0.35 + 0.05;
      this.color = Math.random() > 0.65 ? GOLD : WHITE;
      this.twinkle = Math.random() * Math.PI * 2;
      this.twinkleSpeed = Math.random() * 0.015 + 0.005;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.twinkle += this.twinkleSpeed;
      if (this.y < -5) this.reset(false);
    }
    draw() {
      const a = this.alpha * (0.65 + 0.35 * Math.sin(this.twinkle));
      const [r, g, b] = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      ctx.fill();
    }
  }

  const particles = Array.from({ length: COUNT }, () => new Particle());

  // Animated connection lines
  function drawConnections() {
    const MAX_DIST = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const a = (1 - dist / MAX_DIST) * 0.06;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(200,151,62,${a})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();

// ─── HERO CARD PROGRESS BAR ─────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.hcard-bar-fill[data-width]').forEach(el => {
      el.style.width = el.dataset.width;
    });
  }, 900);
});

// ─── REVEAL ON SCROLL ───────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── ANIMATED COUNTERS ──────────────────────────────────
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function frame(now) {
    const elapsed = now - start;
    const progress = clamp(elapsed / duration, 0, 1);
    const value = Math.round(easeOut(progress) * target);
    const formatted = value >= 1000
      ? value.toLocaleString('pt-BR')
      : value.toString();
    el.textContent = prefix + (prefix ? ' ' : '') + formatted + suffix;
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-count]').forEach(el => {
  counterObserver.observe(el);
});

// ─── CALC: CURRENCY MASK ────────────────────────────────
const valorInput = document.getElementById('valorFinanciamento');
if (valorInput) {
  valorInput.addEventListener('input', function () {
    let raw = this.value.replace(/\D/g, '');
    if (!raw) { this.value = ''; return; }
    const num = parseInt(raw, 10) / 100;
    this.value = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(num);
  });
}

// ─── CALC: TOGGLE BUTTONS ───────────────────────────────
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ─── CALC: PRICE TABLE ──────────────────────────────────
function calcPrice(pv, taxa, n) {
  const i = taxa / 100;
  const f = Math.pow(1 + i, n);
  const pmt = pv * (i * f) / (f - 1);
  const rows = [];
  let saldo = pv;
  for (let k = 1; k <= n; k++) {
    const juros = saldo * i;
    const amort = pmt - juros;
    saldo -= amort;
    rows.push({ k, pmt, juros, amort, saldo: Math.max(saldo, 0) });
  }
  return { pmt, total: pmt * n, juros: pmt * n - pv, rows };
}

// ─── CALC: SAC TABLE ────────────────────────────────────
function calcSAC(pv, taxa, n) {
  const i = taxa / 100;
  const amort = pv / n;
  let saldo = pv, total = 0, jurosTotal = 0;
  const rows = [];
  for (let k = 1; k <= n; k++) {
    const juros = saldo * i;
    const pmt   = amort + juros;
    saldo -= amort;
    total += pmt;
    jurosTotal += juros;
    rows.push({ k, pmt, juros, amort, saldo: Math.max(saldo, 0) });
  }
  return { pmtFirst: rows[0].pmt, pmtLast: rows[n - 1].pmt, total, juros: jurosTotal, rows };
}

// ─── CALC: RENDER RESULT ────────────────────────────────
function renderResult(pv, taxa, n, tipo) {
  const el = document.getElementById('calcResult');
  let res, mainPmt, mainLabel;

  if (tipo === 'price') {
    res = calcPrice(pv, taxa, n);
    mainPmt = res.pmt;
    mainLabel = 'Parcela mensal fixa (Price)';
  } else {
    res = calcSAC(pv, taxa, n);
    mainPmt = res.pmtFirst;
    mainLabel = '1ª parcela (SAC — decrescente)';
  }

  const tableRows = res.rows.map(r => `
    <tr>
      <td>${r.k}</td>
      <td>${formatBRL(r.pmt)}</td>
      <td>${formatBRL(r.juros)}</td>
      <td>${formatBRL(r.amort)}</td>
      <td>${formatBRL(r.saldo)}</td>
    </tr>`).join('');

  el.innerHTML = `
    <div class="result-content">
      <div class="result-head">Resumo da Simulação</div>
      <div class="result-main">
        <div class="rm-label">${mainLabel}</div>
        <div class="rm-value">${formatBRL(mainPmt)}</div>
      </div>
      <div class="result-grid-2">
        <div class="result-box">
          <div class="rb-label">Valor Financiado</div>
          <div class="rb-val">${formatBRL(pv)}</div>
        </div>
        <div class="result-box">
          <div class="rb-label">Total de Parcelas</div>
          <div class="rb-val">${n}×</div>
        </div>
        <div class="result-box">
          <div class="rb-label">Total de Juros</div>
          <div class="rb-val">${formatBRL(res.juros)}</div>
        </div>
        <div class="result-box">
          <div class="rb-label">Total a Pagar</div>
          <div class="rb-val">${formatBRL(res.total)}</div>
        </div>
      </div>
      <div class="result-table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Prestação</th><th>Juros</th><th>Amortiz.</th><th>Saldo</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      <p class="result-notice">Simulação ilustrativa. Sujeita à análise de crédito.</p>
    </div>`;

  // Animate value in
  const rmVal = el.querySelector('.rm-value');
  if (rmVal) {
    rmVal.style.opacity = '0';
    rmVal.style.transform = 'translateY(12px)';
    requestAnimationFrame(() => {
      rmVal.style.transition = 'opacity .5s, transform .5s cubic-bezier(.16,1,.3,1)';
      rmVal.style.opacity = '1';
      rmVal.style.transform = 'translateY(0)';
    });
  }

  if (window.innerWidth <= 900) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ─── CALC: BUTTON ────────────────────────────────────────
document.getElementById('calcularBtn')?.addEventListener('click', () => {
  const raw  = document.getElementById('valorFinanciamento').value;
  const pv   = parseBRL(raw);
  const taxa = parseFloat(document.getElementById('taxaJuros').value);
  const n    = parseInt(document.getElementById('numeroParcelas').value, 10);
  const tipo = document.querySelector('input[name="tipo"]:checked')?.value || 'price';

  if (!pv || pv <= 0)    { showCalcError('Informe um valor de financiamento válido.'); return; }
  if (!taxa || taxa <= 0) { showCalcError('Informe uma taxa de juros válida.'); return; }
  if (!n || n <= 0)       { showCalcError('Selecione o número de parcelas.'); return; }

  renderResult(pv, taxa, n, tipo);
});

function showCalcError(msg) {
  const el = document.getElementById('calcResult');
  el.innerHTML = `<div class="result-empty"><div class="empty-ring">
    <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#f26060" stroke-width="1.5"/><path d="M12 8v4m0 4h.01" stroke="#f26060" stroke-width="1.5" stroke-linecap="round"/></svg>
  </div><p style="color:#f26060">${msg}</p></div>`;
}

// ─── CONTATO FORM ────────────────────────────────────────
const contatoForm = document.getElementById('contatoForm');
const formMsg     = document.getElementById('formMsg');
contatoForm?.addEventListener('submit', function (e) {
  e.preventDefault();
  const nome  = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  if (!nome || !email) {
    formMsg.textContent  = 'Por favor, preencha nome e e-mail.';
    formMsg.className    = 'form-feedback error';
    return;
  }
  const btn = this.querySelector('button[type="submit"]');
  const orig = btn.querySelector('span').textContent;
  btn.querySelector('span').textContent = 'Enviando…';
  btn.disabled = true;
  setTimeout(() => {
    formMsg.textContent = 'Mensagem enviada com sucesso! Retornaremos em breve.';
    formMsg.className   = 'form-feedback success';
    contatoForm.reset();
    btn.querySelector('span').textContent = orig;
    btn.disabled = false;
    setTimeout(() => { formMsg.textContent = ''; }, 5000);
  }, 1500);
});

// ─── MASKS ───────────────────────────────────────────────
document.getElementById('cnpj')?.addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').substring(0, 14);
  v = v.replace(/^(\d{2})(\d)/, '$1.$2');
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
  v = v.replace(/(\d{4})(\d)/, '$1-$2');
  this.value = v;
});

document.getElementById('telefone')?.addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').substring(0, 11);
  this.value = v.length <= 10
    ? v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    : v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
});

// ─── SMOOTH ANCHOR OFFSET (navbar height) ────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

