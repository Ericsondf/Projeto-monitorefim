/* ============================================================
   api.js — Camada de comunicação com o backend
   ============================================================ */

const API_URL = window.API_URL || "http://localhost:3001";

const API = {
  async _fetch(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((data && data.erro) || `Erro ${res.status}`);
    }
    return data;
  },

  // Health
  health() {
    return this._fetch("/health");
  },

  // CRUD Indicações
  listar(status = "") {
    const q = status ? `?status=${status}` : "";
    return this._fetch(`/api/indicacoes${q}`);
  },

  buscar(id) {
    return this._fetch(`/api/indicacoes/${id}`);
  },

  criar(body) {
    return this._fetch("/api/indicacoes", { method: "POST", body: JSON.stringify(body) });
  },

  atualizar(id, body) {
    return this._fetch(`/api/indicacoes/${id}`, { method: "PUT", body: JSON.stringify(body) });
  },

  atualizarStatus(id, status) {
    return this._fetch(`/api/indicacoes/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  remover(id) {
    return this._fetch(`/api/indicacoes/${id}`, { method: "DELETE" });
  },

  stats() {
    return this._fetch("/api/indicacoes/stats");
  },
};
