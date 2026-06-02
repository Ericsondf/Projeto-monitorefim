/* ============================================================
   app.js — Lógica principal da aplicação
   ============================================================ */

// ── Estado global ─────────────────────────────────────────────
const state = {
  view: "dashboard",
  indicacoes: [],
  filtroStatus: "",
  busca: "",
  loading: false,
};

// ── Utilitários ───────────────────────────────────────────────
function formatDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function tagStatus(status) {
  const map = { pendente: "⏳ Pendente", aprovado: "✅ Aprovado", recusado: "❌ Recusado" };
  return `<span class="tag tag-${status}">${map[status] || status}</span>`;
}

// ── Toast ─────────────────────────────────────────────────────
function toast(msg, type = "info") {
  const icons = { success: "✓", error: "✕", info: "ℹ" };
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  document.getElementById("toastContainer").appendChild(el);
  setTimeout(() => {
    el.classList.add("fade-out");
    setTimeout(() => el.remove(), 320);
  }, 3200);
}

// ── Navegação entre views ─────────────────────────────────────
function navTo(view) {
  state.view = view;
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.getElementById(`view-${view}`)?.classList.add("active");
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
  document.querySelector(`.nav-btn[data-view="${view}"]`)?.classList.add("active");

  const titles = { dashboard: "Dashboard", indicacoes: "Indicações", nova: "Nova Indicação" };
  document.getElementById("pageTitle").textContent = titles[view] || "MonitorIA";

  closeSidebar();
  if (view === "dashboard") loadDashboard();
  if (view === "indicacoes") loadIndicacoes();
}

// ── Sidebar mobile ────────────────────────────────────────────
function openSidebar() {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("overlay").classList.remove("hidden");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.add("hidden");
}

// ── Status da API ─────────────────────────────────────────────
async function checkHealth() {
  const dot   = document.getElementById("statusDot");
  const label = document.getElementById("statusLabel");
  try {
    await API.health();
    dot.className = "status-dot online";
    label.textContent = "API conectada";
  } catch {
    dot.className = "status-dot offline";
    label.textContent = "API offline";
  }
}

// ── Dashboard ─────────────────────────────────────────────────
async function loadDashboard() {
  // Stats
  try {
    const s = await API.stats();
    document.getElementById("statTotal").textContent    = s.total    ?? 0;
    document.getElementById("statPendente").textContent = s.pendentes ?? 0;
    document.getElementById("statAprovado").textContent = s.aprovados ?? 0;
    document.getElementById("statRecusado").textContent = s.recusados ?? 0;
  } catch {
    ["statTotal", "statPendente", "statAprovado", "statRecusado"].forEach(
      (id) => (document.getElementById(id).textContent = "—")
    );
  }

  // Recentes (últimas 5)
  const container = document.getElementById("recentList");
  container.innerHTML = `<div class="loading"><div class="spinner"></div> Carregando...</div>`;
  try {
    const lista = await API.listar();
    state.indicacoes = lista;
    renderCards(container, lista.slice(0, 5));
  } catch {
    container.innerHTML = `<div class="empty-state"><div class="emoji">⚠️</div><h3>Não foi possível carregar</h3><p>Verifique se a API está rodando.</p></div>`;
  }
}

// ── Lista de Indicações ───────────────────────────────────────
async function loadIndicacoes() {
  const container = document.getElementById("listaIndicacoes");
  container.innerHTML = `<div class="loading"><div class="spinner"></div> Carregando...</div>`;
  try {
    const lista = await API.listar(state.filtroStatus);
    state.indicacoes = lista;
    aplicarBusca();
  } catch {
    container.innerHTML = `<div class="empty-state"><div class="emoji">⚠️</div><h3>Erro ao carregar</h3><p>Verifique se a API está online.</p></div>`;
  }
}

function aplicarBusca() {
  const q = state.busca.toLowerCase();
  const filtradas = q
    ? state.indicacoes.filter(
        (i) =>
          i.aluno.toLowerCase().includes(q) ||
          i.professor.toLowerCase().includes(q) ||
          i.disciplina.toLowerCase().includes(q)
      )
    : state.indicacoes;
  renderCards(document.getElementById("listaIndicacoes"), filtradas);
}

// ── Renderizar cards ──────────────────────────────────────────
function renderCards(container, lista) {
  if (!lista || lista.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="emoji">📭</div><h3>Nenhuma indicação encontrada</h3><p>Tente outro filtro ou crie uma nova indicação.</p></div>`;
    return;
  }
  container.innerHTML = lista
    .map(
      (i) => `
    <div class="ind-card" data-id="${i.id}">
      <div class="ind-card-main">
        <span class="ind-card-title">${escHtml(i.aluno)}</span>
        <span class="ind-card-sub">Professor: ${escHtml(i.professor)}</span>
        <div class="ind-card-meta">
          <span class="tag tag-disciplina">${escHtml(i.disciplina)}</span>
          ${tagStatus(i.status)}
          <span class="ind-card-date">${formatDate(i.created_at)}</span>
        </div>
      </div>
    </div>`
    )
    .join("");

  container.querySelectorAll(".ind-card").forEach((card) => {
    card.addEventListener("click", () => abrirModal(Number(card.dataset.id)));
  });
}

function escHtml(str) {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(str || ""));
  return d.innerHTML;
}

// ── Modal de detalhe / edição ─────────────────────────────────
async function abrirModal(id) {
  let item;
  try {
    item = await API.buscar(id);
  } catch {
    toast("Não foi possível carregar a indicação.", "error");
    return;
  }

  const content = document.getElementById("modalContent");
  content.innerHTML = `
    <h2 class="modal-title">Detalhes da Indicação</h2>
    <div class="modal-row"><label>Aluno Indicado</label><span>${escHtml(item.aluno)}</span></div>
    <div class="modal-row"><label>Professor</label><span>${escHtml(item.professor)}</span></div>
    <div class="modal-row"><label>Disciplina</label><span>${escHtml(item.disciplina)}</span></div>
    <div class="modal-row"><label>Justificativa</label><span>${escHtml(item.justificativa) || "<em>Não informada</em>"}</span></div>
    <div class="modal-row"><label>Status Atual</label><span>${tagStatus(item.status)}</span></div>
    <div class="modal-row"><label>Criado em</label><span>${formatDate(item.created_at)}</span></div>

    <div class="modal-actions">
      <div class="modal-status-btns">
        ${item.status !== "aprovado" ? `<button class="btn btn-sm" style="background:var(--green-bg);color:var(--green);border-color:#86efac" data-action="status" data-val="aprovado">✅ Aprovar</button>` : ""}
        ${item.status !== "recusado" ? `<button class="btn btn-sm btn-danger" data-action="status" data-val="recusado">❌ Recusar</button>` : ""}
        ${item.status !== "pendente" ? `<button class="btn btn-sm btn-ghost" data-action="status" data-val="pendente">⏳ Pendente</button>` : ""}
      </div>
      <button class="btn btn-sm btn-ghost" data-action="editar">✏️ Editar</button>
      <button class="btn btn-sm btn-danger" data-action="excluir">🗑 Excluir</button>
    </div>
  `;

  // Botões de ação
  content.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const action = btn.dataset.action;
      if (action === "status") {
        await mudarStatus(item.id, btn.dataset.val);
      } else if (action === "excluir") {
        await excluir(item.id);
      } else if (action === "editar") {
        fecharModal();
        abrirEdicao(item);
      }
    });
  });

  document.getElementById("modal").classList.remove("hidden");
  document.getElementById("overlay").classList.remove("hidden");
}

function fecharModal() {
  document.getElementById("modal").classList.add("hidden");
  document.getElementById("overlay").classList.add("hidden");
}

// ── Edição inline no form ─────────────────────────────────────
function abrirEdicao(item) {
  navTo("nova");
  document.getElementById("fProfessor").value   = item.professor;
  document.getElementById("fAluno").value        = item.aluno;
  document.getElementById("fDisciplina").value   = item.disciplina;
  document.getElementById("fJustificativa").value = item.justificativa || "";

  const btn = document.getElementById("btnSalvar");
  btn.querySelector("span").textContent = "Salvar Alterações";
  btn._editId = item.id;
}

// ── Mudar status ──────────────────────────────────────────────
async function mudarStatus(id, status) {
  try {
    await API.atualizarStatus(id, status);
    toast(`Status alterado para "${status}" com sucesso!`, "success");
    fecharModal();
    if (state.view === "dashboard") loadDashboard();
    else loadIndicacoes();
  } catch (e) {
    toast(e.message, "error");
  }
}

// ── Excluir ───────────────────────────────────────────────────
async function excluir(id) {
  if (!confirm("Tem certeza que deseja excluir esta indicação?")) return;
  try {
    await API.remover(id);
    toast("Indicação excluída.", "success");
    fecharModal();
    if (state.view === "dashboard") loadDashboard();
    else loadIndicacoes();
  } catch (e) {
    toast(e.message, "error");
  }
}

// ── Formulário ────────────────────────────────────────────────
function limparForm() {
  ["fProfessor", "fAluno", "fDisciplina", "fJustificativa"].forEach((id) => {
    const el = document.getElementById(id);
    el.value = "";
    el.classList.remove("error");
  });
  const btn = document.getElementById("btnSalvar");
  btn.querySelector("span").textContent = "Salvar Indicação";
  btn._editId = null;
}

async function salvarForm() {
  const campos = {
    fProfessor:  document.getElementById("fProfessor"),
    fAluno:      document.getElementById("fAluno"),
    fDisciplina: document.getElementById("fDisciplina"),
  };

  let ok = true;
  Object.values(campos).forEach((el) => {
    el.classList.remove("error");
    if (!el.value.trim()) { el.classList.add("error"); ok = false; }
  });

  if (!ok) { toast("Preencha todos os campos obrigatórios.", "error"); return; }

  const body = {
    professor:    campos.fProfessor.value.trim(),
    aluno:        campos.fAluno.value.trim(),
    disciplina:   campos.fDisciplina.value.trim(),
    justificativa: document.getElementById("fJustificativa").value.trim(),
  };

  const btn = document.getElementById("btnSalvar");
  btn.disabled = true;
  btn.querySelector("span").textContent = "Salvando...";

  try {
    if (btn._editId) {
      await API.atualizar(btn._editId, body);
      toast("Indicação atualizada com sucesso!", "success");
    } else {
      await API.criar(body);
      toast("Indicação criada com sucesso!", "success");
    }
    limparForm();
    navTo("indicacoes");
  } catch (e) {
    toast(e.message, "error");
  } finally {
    btn.disabled = false;
    btn.querySelector("span").textContent = btn._editId ? "Salvar Alterações" : "Salvar Indicação";
  }
}

// ── Inicialização ─────────────────────────────────────────────
function init() {
  // Navegação sidebar
  document.querySelectorAll(".nav-btn, .btn-link[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => navTo(btn.dataset.view));
  });

  // Botão menu mobile
  document.getElementById("menuToggle").addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar.classList.contains("open")) closeSidebar();
    else openSidebar();
  });

  // Fechar overlay
  document.getElementById("overlay").addEventListener("click", () => {
    closeSidebar();
    fecharModal();
  });

  // Fechar modal
  document.getElementById("modalClose").addEventListener("click", fecharModal);

  // Formulário
  document.getElementById("btnSalvar").addEventListener("click", salvarForm);
  document.getElementById("btnLimpar").addEventListener("click", limparForm);

  // Filtros
  document.querySelectorAll(".filter-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      state.filtroStatus = pill.dataset.status;
      loadIndicacoes();
    });
  });

  // Busca
  document.getElementById("searchInput").addEventListener("input", (e) => {
    state.busca = e.target.value;
    aplicarBusca();
  });

  // Verificar saúde da API periodicamente
  checkHealth();
  setInterval(checkHealth, 30000);

  // Carregar dashboard inicial
  loadDashboard();
}

document.addEventListener("DOMContentLoaded", init);
