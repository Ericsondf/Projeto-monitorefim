const request = require("supertest");

// Mock do banco de dados antes de importar o app
jest.mock("../src/config/database", () => ({
  query: jest.fn(),
}));

const db = require("../src/config/database");
const Indicacao = require("../src/models/Indicacao");

// Mock createTable para não chamar banco real
jest.spyOn(Indicacao, "createTable").mockResolvedValue();

const app = require("../src/server");

const mockIndicacao = {
  id: 1,
  professor: "Prof. João Silva",
  aluno: "Maria Oliveira",
  disciplina: "Algoritmos",
  justificativa: "Excelente desempenho na disciplina",
  status: "pendente",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("GET /health", () => {
  it("deve retornar status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("GET /api/indicacoes", () => {
  it("deve retornar lista de indicações", async () => {
    db.query.mockResolvedValueOnce([[mockIndicacao]]);
    const res = await request(app).get("/api/indicacoes");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("POST /api/indicacoes", () => {
  it("deve criar uma nova indicação", async () => {
    db.query
      .mockResolvedValueOnce([{ insertId: 1 }])
      .mockResolvedValueOnce([[mockIndicacao]]);
    const res = await request(app).post("/api/indicacoes").send({
      professor: "Prof. João Silva",
      aluno: "Maria Oliveira",
      disciplina: "Algoritmos",
      justificativa: "Excelente aluna",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
  });

  it("deve rejeitar se campos obrigatórios faltarem", async () => {
    const res = await request(app).post("/api/indicacoes").send({ professor: "Alguém" });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("erro");
  });
});

describe("GET /api/indicacoes/stats", () => {
  it("deve retornar estatísticas", async () => {
    db.query.mockResolvedValueOnce([[{ total: 5, pendentes: 2, aprovados: 2, recusados: 1 }]]);
    const res = await request(app).get("/api/indicacoes/stats");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("total");
  });
});

describe("PATCH /api/indicacoes/:id/status", () => {
  it("deve rejeitar status inválido", async () => {
    const res = await request(app)
      .patch("/api/indicacoes/1/status")
      .send({ status: "invalido" });
    expect(res.statusCode).toBe(400);
  });
});

describe("DELETE /api/indicacoes/:id", () => {
  it("deve retornar 404 se não existir", async () => {
    db.query.mockResolvedValueOnce([[]]); // findById retorna vazio
    const res = await request(app).delete("/api/indicacoes/999");
    expect(res.statusCode).toBe(404);
  });
});
