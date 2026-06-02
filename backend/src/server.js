require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Indicacao = require("./models/Indicacao");
const indicacoesRouter = require("./routes/indicacoes");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Rotas principais
app.use("/api/indicacoes", indicacoesRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

// Inicializar banco e subir servidor
async function start() {
  try {
    await Indicacao.createTable();
    console.log("✔ Tabela 'indicacoes' pronta.");
    app.listen(PORT, () => {
      console.log(`✔ Backend rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Erro ao iniciar servidor:", err.message);
    process.exit(1);
  }
}

start();

module.exports = app;
