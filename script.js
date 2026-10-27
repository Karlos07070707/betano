const selections = new Map();
const slipBody = document.getElementById('slipBody');
const toast = document.getElementById('toast');
let activeTab = 'coupon';
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
}
function renderSlip() {
  if (activeTab === 'mybets') {
    slipBody.innerHTML = '<p class="mybets-message">Entre na sua conta para consultar suas apostas.</p>';
    return;
  }
  if (!selections.size) {
    slipBody.innerHTML = '<p class="empty-slip">Sem seleções adicionadas</p>';
    return;
  }
  slipBody.innerHTML = '';
  selections.forEach((item, key) => {
    const row = document.createElement('div');
    row.className = 'slip-selection';
    const info = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = item.team;
    const sub = document.createElement('small');
    sub.textContent = item.match;
    info.append(title, sub);
    const odd = document.createElement('b');
    odd.textContent = item.odd;
    const remove = document.createElement('button');
    remove.className = 'remove-selection';
    remove.setAttribute('aria-label', 'Remover seleção');
    remove.textContent = '×';
    remove.addEventListener('click', () => {
      selections.delete(key);
      document.querySelectorAll('[data-selection-key]').forEach(el => {
        if (el.dataset.selectionKey === key) el.classList.remove('chosen');
      });
      renderSlip();
    });
    row.append(info, odd, remove);
    slipBody.append(row);
  });
}
document.querySelectorAll('[data-odd]').forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('.match-card, .game-row');
    const match = card?.querySelector('h2')?.innerText.replace(/\n/g, ' × ') ||
      card?.querySelector('.teams')?.innerText.replace(/\n/g, ' × ') || 'Partida ao vivo';
    const key = `${match}|${button.dataset.team}|${button.dataset.odd}`;
    if (selections.has(key)) {
      selections.delete(key);
      button.classList.remove('chosen');
    } else {
      // Keep one selection per match, like a typical single-market coupon.
      [...selections.keys()].forEach(existing => {
        if (existing.startsWith(`${match}|`)) selections.delete(existing);
      });
      card?.querySelectorAll('[data-odd]').forEach(el => el.classList.remove('chosen'));
      selections.set(key, { team: button.dataset.team, odd: button.dataset.odd, match });
      button.classList.add('chosen');
      button.dataset.selectionKey = key;
    }
    renderSlip();
  });
});
document.querySelectorAll('.slip-tabs button').forEach(button => {
  button.addEventListener('click', () => {
    activeTab = button.dataset.tab;
    document.querySelectorAll('.slip-tabs button').forEach(tab => tab.classList.toggle('selected', tab === button));
    renderSlip();
  });
});
document.querySelectorAll('.sports-tabs button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.sports-tabs button').forEach(tab => tab.classList.toggle('active', tab === button));
    const title = document.querySelector('.league-bar span');
    title.textContent = `${button.textContent.trim()} · Eventos em destaque`;
    showToast(`Categoria selecionada: ${button.dataset.sport}`);
  });
});
document.querySelectorAll('.prize-options button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.prize-options button').forEach(option => option.classList.toggle('selected', option === button));
    const amount = Number(document.getElementById('stake').value || 0);
    showToast(`Valor de referência: R$ ${amount.toLocaleString('pt-BR')} · Faixa ${button.dataset.prize}`);
  });
});
document.getElementById('stake').addEventListener('input', event => {
  if (Number(event.target.value) < 0) event.target.value = 0;
});
document.getElementById('registerBtn').addEventListener('click', () => showToast('Demonstração: cadastro não conectado.'));
document.getElementById('loginBtn').addEventListener('click', () => showToast('Demonstração: login não conectado.'));
document.querySelector('.promo-next').addEventListener('click', () => {
  const strip = document.querySelector('.promo-strip');
  strip.scrollBy({ left: 260, behavior: 'smooth' });
});
document.querySelector('.menu-toggle').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('sidebar-open');
  showToast('Menu de navegação');
});
renderSlip();
