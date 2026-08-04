const API_BASE = '/api/tasks';

const STATUS_FLOW = ['pending', 'in_progress', 'done'];
const STATUS_LABEL = { pending: 'PENDENTE', in_progress: 'EM ANDAMENTO', done: 'CONCLUÍDO' };
const PRIORITY_LABEL = { low: 'BAIXA', medium: 'MÉDIA', high: 'ALTA' };

const state = {
  tasks: [],
  filterStatus: '',
  filterPriority: '',
};

const grid = document.getElementById('ticket-grid');
const emptyState = document.getElementById('empty-state');
const template = document.getElementById('ticket-template');
const form = document.getElementById('new-ticket-form');
const formError = document.getElementById('form-error');

// ---------- Relógio do cabeçalho ----------
function tickClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString('pt-BR');
}
tickClock();
setInterval(tickClock, 1000);

// ---------- Comunicação com a API ----------
async function apiRequest(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.error || `Erro ${res.status}`;
    const details = data?.details ? ` — ${data.details.join(' ')}` : '';
    throw new Error(message + details);
  }

  return data;
}

async function fetchTasks() {
  const params = new URLSearchParams();
  if (state.filterStatus) params.set('status', state.filterStatus);
  if (state.filterPriority) params.set('priority', state.filterPriority);
  params.set('limit', '100');

  const result = await apiRequest('GET', `${API_BASE}?${params.toString()}`);
  state.tasks = result.data;
  renderStats(result.data);
  renderGrid();
}

// ---------- Renderização ----------
function renderStats(tasksForCount) {
  // Estatísticas sempre refletem o total real (busca sem filtro em paralelo seria mais correto,
  // mas para manter simples usamos a lista corrente quando não há filtro ativo).
  if (!state.filterStatus && !state.filterPriority) {
    const counts = { pending: 0, in_progress: 0, done: 0 };
    tasksForCount.forEach((t) => { counts[t.status] = (counts[t.status] || 0) + 1; });
    document.getElementById('stat-pending').textContent = counts.pending;
    document.getElementById('stat-progress').textContent = counts.in_progress;
    document.getElementById('stat-done').textContent = counts.done;
  }
}

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('pt-BR');
}

function renderGrid() {
  grid.querySelectorAll('.ticket:not(.ticket--form)').forEach((el) => el.remove());

  if (state.tasks.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  state.tasks.forEach((task) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = task.id;
    node.dataset.status = task.status;

    node.querySelector('.ticket__number').textContent = `TICKET #${String(task.id).padStart(4, '0')}`;

    const stamp = node.querySelector('.ticket__stamp');
    stamp.textContent = PRIORITY_LABEL[task.priority];
    stamp.classList.add(`ticket__stamp--${task.priority}`);

    node.querySelector('.ticket__title').textContent = task.title;

    const desc = node.querySelector('.ticket__desc');
    if (task.description) {
      desc.textContent = task.description;
    } else {
      desc.remove();
    }

    const due = formatDate(task.due_date);
    node.querySelector('.ticket__due').textContent = due ? `PRAZO ${due}` : 'SEM PRAZO';
    node.querySelector('.ticket__created').textContent = `ABERTO ${formatDate(task.created_at) || ''}`;

    node.querySelector('.punch__label').textContent = STATUS_LABEL[task.status];

    node.querySelector('.punch').addEventListener('click', () => advanceStatus(task));
    node.querySelector('.void-btn').addEventListener('click', () => deleteTask(task));

    grid.appendChild(node);
  });
}

// ---------- Ações ----------
async function advanceStatus(task) {
  const currentIndex = STATUS_FLOW.indexOf(task.status);
  const nextStatus = STATUS_FLOW[(currentIndex + 1) % STATUS_FLOW.length];

  try {
    await apiRequest('PUT', `${API_BASE}/${task.id}`, { status: nextStatus });
    await fetchTasks();
  } catch (err) {
    alert(`Não foi possível atualizar o ticket: ${err.message}`);
  }
}

async function deleteTask(task) {
  if (!confirm(`Anular o ticket #${task.id} — "${task.title}"?`)) return;

  try {
    await apiRequest('DELETE', `${API_BASE}/${task.id}`);
    await fetchTasks();
  } catch (err) {
    alert(`Não foi possível remover o ticket: ${err.message}`);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.hidden = true;

  const payload = {
    title: document.getElementById('field-title').value.trim(),
    description: document.getElementById('field-description').value.trim(),
    priority: document.getElementById('field-priority').value,
    due_date: document.getElementById('field-due-date').value || null,
  };

  try {
    await apiRequest('POST', API_BASE, payload);
    form.reset();
    form.hidden = true;
    await fetchTasks();
  } catch (err) {
    formError.textContent = err.message;
    formError.hidden = false;
  }
});

// ---------- Toggle do formulário ----------
const btnNewToggle = document.getElementById('btn-new-toggle');
const btnCancelNew = document.getElementById('btn-cancel-new');

btnNewToggle.addEventListener('click', () => {
  form.hidden = !form.hidden;
  if (!form.hidden) document.getElementById('field-title').focus();
});
btnCancelNew.addEventListener('click', () => {
  form.hidden = true;
  form.reset();
  formError.hidden = true;
});

// ---------- Filtros ----------
document.querySelectorAll('[data-filter-status]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-filter-status]').forEach((b) => b.classList.remove('chip--active'));
    btn.classList.add('chip--active');
    state.filterStatus = btn.dataset.filterStatus;
    fetchTasks();
  });
});

document.querySelectorAll('[data-filter-priority]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-filter-priority]').forEach((b) => b.classList.remove('chip--active'));
    btn.classList.add('chip--active');
    state.filterPriority = btn.dataset.filterPriority;
    fetchTasks();
  });
});

// ---------- Inicialização ----------
fetchTasks().catch((err) => {
  grid.innerHTML = `<p style="color:#c4543c;font-family:'IBM Plex Mono',monospace;">Falha ao carregar tickets: ${err.message}</p>`;
});
