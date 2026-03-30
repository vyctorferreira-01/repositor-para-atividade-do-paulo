// ===== NAVBAR MOBILE =====
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ===== FORMATAÇÃO DE MOEDA =====
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(value);
}

function parseCurrency(str) {
  return parseFloat(str.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')) || 0;
}

// Máscara de moeda no campo de valor
const valorInput = document.getElementById('valorFinanciamento');
if (valorInput) {
  valorInput.addEventListener('input', function () {
    let raw = this.value.replace(/\D/g, '');
    if (!raw) { this.value = ''; return; }
    let number = parseInt(raw, 10) / 100;
    this.value = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
  });
}

// ===== CALCULADORA PRICE =====
function calcPrice(pv, taxa, n) {
  // PMT = PV * [i * (1+i)^n] / [(1+i)^n - 1]
  const i = taxa / 100;
  const fator = Math.pow(1 + i, n);
  const pmt = pv * (i * fator) / (fator - 1);
  const totalPago = pmt * n;
  const totalJuros = totalPago - pv;
  const rows = [];
  let saldo = pv;
  for (let k = 1; k <= n; k++) {
    const juros = saldo * i;
    const amort = pmt - juros;
    saldo -= amort;
    rows.push({ parcela: k, prestacao: pmt, juros, amortizacao: amort, saldo: Math.max(saldo, 0) });
  }
  return { pmt, totalPago, totalJuros, rows };
}

// ===== CALCULADORA SAC =====
function calcSAC(pv, taxa, n) {
  const i = taxa / 100;
  const amortizacao = pv / n;
  const rows = [];
  let saldo = pv;
  let totalPago = 0;
  let totalJuros = 0;
  for (let k = 1; k <= n; k++) {
    const juros = saldo * i;
    const prestacao = amortizacao + juros;
    saldo -= amortizacao;
    totalPago += prestacao;
    totalJuros += juros;
    rows.push({ parcela: k, prestacao, juros, amortizacao, saldo: Math.max(saldo, 0) });
  }
  const pmtFirst = rows[0].prestacao;
  const pmtLast = rows[n - 1].prestacao;
  return { pmtFirst, pmtLast, totalPago, totalJuros, rows };
}

// ===== RENDERIZAR RESULTADO =====
function renderResult(pv, taxa, n, tipo) {
  const resultEl = document.getElementById('calcResult');

  let pmt, totalPago, totalJuros, rows, pmtFirst, pmtLast;

  if (tipo === 'price') {
    const res = calcPrice(pv, taxa, n);
    pmt = res.pmt; totalPago = res.totalPago; totalJuros = res.totalJuros; rows = res.rows;
  } else {
    const res = calcSAC(pv, taxa, n);
    pmtFirst = res.pmtFirst; pmtLast = res.pmtLast;
    totalPago = res.totalPago; totalJuros = res.totalJuros; rows = res.rows;
    pmt = pmtFirst; // para exibir
  }

  const parcelaLabel = tipo === 'price'
    ? `${n}x de <strong>${formatCurrency(pmt)}</strong>`
    : `De ${formatCurrency(pmtFirst)} a ${formatCurrency(pmtLast)}`;

  // Tabela (mostrar até 12 linhas ou todas se <= 12)
  const maxRows = rows.length;
  let tableRows = '';
  for (let r = 0; r < maxRows; r++) {
    const row = rows[r];
    tableRows += `
      <tr>
        <td>${row.parcela}</td>
        <td>${formatCurrency(row.prestacao)}</td>
        <td>${formatCurrency(row.juros)}</td>
        <td>${formatCurrency(row.amortizacao)}</td>
        <td>${formatCurrency(row.saldo)}</td>
      </tr>`;
  }

  resultEl.innerHTML = `
    <div class="result-content">
      <div class="result-title">Resumo da Simulação</div>
      <div class="result-highlight">
        <div class="rh-label">${tipo === 'price' ? 'Parcela mensal fixa' : '1ª parcela (SAC)'}</div>
        <div class="rh-value">${formatCurrency(pmt)}</div>
      </div>
      <div class="result-grid">
        <div class="result-item">
          <div class="ri-label">Valor financiado</div>
          <div class="ri-value">${formatCurrency(pv)}</div>
        </div>
        <div class="result-item">
          <div class="ri-label">Total de parcelas</div>
          <div class="ri-value">${n}x</div>
        </div>
        <div class="result-item">
          <div class="ri-label">Total de juros</div>
          <div class="ri-value">${formatCurrency(totalJuros)}</div>
        </div>
        <div class="result-item">
          <div class="ri-label">Total a pagar</div>
          <div class="ri-value">${formatCurrency(totalPago)}</div>
        </div>
      </div>
      <div class="result-table">
        <div class="result-table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Prestação</th>
                <th>Juros</th>
                <th>Amortiz.</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>
      <p class="result-notice" style="margin-top:12px">Simulação meramente ilustrativa. Sujeita a análise de crédito.</p>
    </div>`;
}

// ===== BOTÃO CALCULAR =====
const calcBtn = document.getElementById('calcularBtn');
if (calcBtn) {
  calcBtn.addEventListener('click', () => {
    const rawValor = document.getElementById('valorFinanciamento').value;
    const pv = parseCurrency(rawValor);
    const taxa = parseFloat(document.getElementById('taxaJuros').value);
    const n = parseInt(document.getElementById('numeroParcelas').value);
    const tipo = document.getElementById('tipoFinanciamento').value;

    if (!pv || pv <= 0) {
      alert('Informe um valor de financiamento válido.');
      return;
    }
    if (!taxa || taxa <= 0) {
      alert('Informe uma taxa de juros válida.');
      return;
    }
    if (!n || n <= 0) {
      alert('Selecione o número de parcelas.');
      return;
    }

    renderResult(pv, taxa, n, tipo);

    // Scroll suave para o resultado em mobile
    if (window.innerWidth <= 768) {
      document.getElementById('calcResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// ===== FORMULÁRIO DE CONTATO =====
const contatoForm = document.getElementById('contatoForm');
const formMsg = document.getElementById('formMsg');
if (contatoForm) {
  contatoForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const mensagem = document.getElementById('mensagem').value.trim();

    if (!nome || !email) {
      formMsg.textContent = 'Por favor, preencha nome e e-mail.';
      formMsg.className = 'form-feedback error';
      return;
    }

    // Simula envio
    const btn = contatoForm.querySelector('button[type="submit"]');
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    setTimeout(() => {
      formMsg.textContent = 'Mensagem enviada com sucesso! Entraremos em contato em breve.';
      formMsg.className = 'form-feedback success';
      contatoForm.reset();
      btn.textContent = 'Enviar Mensagem';
      btn.disabled = false;
      setTimeout(() => { formMsg.textContent = ''; }, 5000);
    }, 1500);
  });
}

// ===== MÁSCARA CNPJ =====
const cnpjInput = document.getElementById('cnpj');
if (cnpjInput) {
  cnpjInput.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').substring(0, 14);
    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');
    this.value = v;
  });
}

// ===== MÁSCARA TELEFONE =====
const telInput = document.getElementById('telefone');
if (telInput) {
  telInput.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').substring(0, 11);
    if (v.length <= 10) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    this.value = v;
  });
}

// ===== ANIMAÇÃO DE ENTRADA =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.feature-card, .solution-card, .depo-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});
