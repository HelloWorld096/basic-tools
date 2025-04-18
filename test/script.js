// Data Structure & Storage
let products = JSON.parse(localStorage.getItem('products') || '[]');
let currentProductId = null;
let activeTabSelected = true;

function save() {
  localStorage.setItem('products', JSON.stringify(products));
}

// Calculations
function calcStats(p) {
  const withdrawn = p.transactions.reduce((a, t) => a + t.amount, 0);
  const invested = p.initial;
  return { invested, withdrawn, profit: withdrawn - invested };
}

function formatCurrency(value) {
  return '₹' + value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function getLastTransactionDate(p) {
  if (p.transactions.length === 0) return null;
  return Math.max(...p.transactions.map(t => t.date));
}

function formatTransactionDate(timestamp) {
  if (!timestamp) return 'No transactions';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// UI Updates
function updateOverall() {
  const filtered = products.filter(p => activeTabSelected ? !p.disabled : p.disabled);
  let totalInvested = 0, totalWithdrawn = 0;

  filtered.forEach(p => {
    totalInvested  += p.initial;
    totalWithdrawn += p.transactions.reduce((a, t) => a + t.amount, 0);
  });

  const totalPL = totalWithdrawn - totalInvested;

  document.getElementById('totalInvested').textContent  = formatCurrency(totalInvested);
  document.getElementById('totalWithdrawn').textContent = formatCurrency(totalWithdrawn);

  const plEl = document.getElementById('totalPL');
  plEl.textContent = formatCurrency(totalPL);
  plEl.className  = totalPL >= 0
    ? 'overall-stats-value profit-positive'
    : 'overall-stats-value profit-negative';
}

function updateTabCounts() {
  document.getElementById('activeCount').textContent   = products.filter(p => !p.disabled).length;
  document.getElementById('inactiveCount').textContent = products.filter(p => p.disabled).length;
}

function updateTabUI() {
  document.getElementById('activeTab').classList.toggle('active', activeTabSelected);
  document.getElementById('inactiveTab').classList.toggle('active', !activeTabSelected);
}

// Render the list of investments on the Dashboard
function renderDashboard() {
  const list = document.getElementById('productList');
  list.innerHTML = '';

  const filtered = products
    .filter(p => activeTabSelected ? !p.disabled : p.disabled)
    .sort((a, b) => (getLastTransactionDate(b) || 0) - (getLastTransactionDate(a) || 0));

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <i class="fas fa-${activeTabSelected ? 'chart-line' : 'archive'}"></i>
      <p>No ${activeTabSelected ? 'active' : 'inactive'} investments found.</p>
    `;
    list.appendChild(empty);
  } else {
    filtered.forEach(p => {
      const { invested, withdrawn, profit } = calcStats(p);
      const lastDate = getLastTransactionDate(p);
      const li = document.createElement('li');
      li.className = `product-item ${p.disabled ? 'disabled' : ''}`;
      li.dataset.id = p.id;

      li.innerHTML = `
        <div class="product-header">
          <h3 class="product-name">${p.name}
            <span class="status-indicator ${p.disabled ? 'status-inactive' : 'status-active'}">
              ${p.disabled ? 'Inactive' : 'Active'}
            </span>
          </h3>
          <div class="last-transaction">
            <i class="fas fa-calendar-alt"></i> ${formatTransactionDate(lastDate)}
          </div>
        </div>
        <div class="stats">
          <span class="stats-item"><i class="fas fa-arrow-circle-down"></i> INV: <span class="stats-value">${formatCurrency(invested)}</span></span>
          <span class="stats-item"><i class="fas fa-arrow-circle-up"></i> WTD: <span class="stats-value">${formatCurrency(withdrawn)}</span></span>
          <span class="stats-item"><i class="fas fa-exchange-alt"></i> P/L: <span class="stats-value ${profit >= 0 ? 'profit-positive' : 'profit-negative'}">${formatCurrency(profit)}</span></span>
        </div>
      `;
      li.onclick = () => openDetail(p.id);
      list.appendChild(li);
    });
  }

  updateOverall();
  updateTabCounts();
  updateTabUI();
}

// Render the detail panel for one investment
function renderDetail(p) {
  document.getElementById('productTitle').textContent = p.name;

  const toggleBtn = document.getElementById('toggleStatusBtn');
  toggleBtn.innerHTML = p.disabled
    ? '<i class="fas fa-check-circle"></i> Enable'
    : '<i class="fas fa-ban"></i> Disable';
  toggleBtn.className = p.disabled ? 'btn-outline btn-enable' : 'btn-outline btn-disable';

  const { invested, withdrawn, profit } = calcStats(p);
  document.getElementById('investedAmount').textContent  = formatCurrency(invested);
  document.getElementById('withdrawnAmount').textContent = formatCurrency(withdrawn);

  const profitEl = document.getElementById('profitAmount');
  profitEl.textContent = formatCurrency(profit);
  profitEl.className = profit >= 0 ? 'detail-stats-value profit-positive' : 'detail-stats-value profit-negative';

  document.getElementById('withdrawalForm')
    .classList.toggle('hidden', p.disabled);

  const txList = document.getElementById('transactionList');
  txList.innerHTML = '';
  if (p.transactions.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <i class="fas fa-receipt"></i>
      <p>No transactions recorded yet.</p>
    `;
    txList.appendChild(empty);
  } else {
    [...p.transactions]
      .sort((a, b) => b.date - a.date)
      .forEach(t => {
        const li = document.createElement('li');
        li.className = 'transaction-item';
        li.innerHTML = `
          <span class="transaction-date"><i class="fas fa-calendar-alt"></i> ${formatTransactionDate(t.date)}</span>
          <span class="transaction-amount">- ${formatCurrency(t.amount)}</span>
        `;
        txList.appendChild(li);
      });
  }
}

// Drill into a single investment
function openDetail(id) {
  currentProductId = id;
  const p = products.find(x => x.id === id);

  document.querySelector('.dashboard').classList.remove('active');
  document.querySelector('.detail-view').classList.add('active');
  document.getElementById('openModal').classList.add('hidden');

  // RESET SCROLL
  window.scrollTo(0, 0);

  renderDetail(p);
}

// Go back to the dashboard
document.getElementById('backBtn').onclick = () => {
  document.querySelector('.detail-view').classList.remove('active');
  document.querySelector('.dashboard').classList.add('active');
  document.getElementById('openModal').classList.remove('hidden');

  // RESET SCROLL
  window.scrollTo(0, 0);

  renderDashboard();
};

// Withdraw handler
document.getElementById('withdrawBtn').onclick = () => {
  const amt = parseFloat(document.getElementById('withdrawInput').value);
  if (!isNaN(amt) && amt > 0 && currentProductId) {
    const p = products.find(x => x.id === currentProductId);
    p.transactions.push({ amount: amt, date: Date.now() });
    save();
    renderDetail(p);
    document.getElementById('withdrawInput').value = '';
  }
};

// Toggle active/inactive status
document.getElementById('toggleStatusBtn').onclick = () => {
  const p = products.find(x => x.id === currentProductId);
  p.disabled = !p.disabled;
  save();
  renderDetail(p);
};

// Tab buttons
document.getElementById('activeTab').onclick = () => {
  activeTabSelected = true;
  renderDashboard();
};
document.getElementById('inactiveTab').onclick = () => {
  activeTabSelected = false;
  renderDashboard();
};

// Modal controls
const modal = document.getElementById('modalBackdrop');
document.getElementById('openModal').onclick = () => {
  modal.style.display = 'flex';
  document.getElementById('productName').focus();
};
document.getElementById('cancelModal').onclick = () => {
  modal.style.display = 'none';
};

// Save new investment
document.getElementById('saveProduct').onclick = () => {
  const nameEl = document.getElementById('productName');
  const initEl = document.getElementById('initialInvestment');
  const name = nameEl.value.trim();
  const initial = parseFloat(initEl.value);

  if (name && !isNaN(initial) && initial >= 0) {
    products.push({
      id: Date.now().toString(),
      name,
      initial,
      transactions: [],
      disabled: false
    });
    save();
    nameEl.value = '';
    initEl.value = '';
    modal.style.display = 'none';
    activeTabSelected = true;
    renderDashboard();
  } else {
    if (!name) nameEl.style.borderColor = 'var(--danger)';
    if (isNaN(initial) || initial < 0) initEl.style.borderColor = 'var(--danger)';
  }
};

// Reset validation styling
document.getElementById('productName').addEventListener('input', e => {
  e.target.style.borderColor = 'var(--border-color)';
});
document.getElementById('initialInvestment').addEventListener('input', e => {
  e.target.style.borderColor = 'var(--border-color)';
});

// Kick it all off
renderDashboard();
updateTabUI();
