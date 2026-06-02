const Indicacao = require("../models/Indicacao");

const statusValidos = ["pendente", "aprovado", "recusado"];

const indicacaoController = {
  async listar(req, res) {
    try {
      const { status } = req.query;
      let data;
      if (status) {
        if (!statusValidos.includes(status)) {
          return res.status(400).json({ erro: "Status inválido." });
        }
        data = await Indicacao.findByStatus(status);
      } else {
        data = await Indicacao.findAll();
      }
      res.json(data);
    } catch (err) {
      res.status(500).json({ erro: "Erro ao listar indicações.", detalhe: err.message });
    }
  },

  async buscar(req, res) {
    try {
      const { id } = req.params;
      const item = await Indicacao.findById(id);
      if (!item) return res.status(404).json({ erro: "Indicação não encontrada." });
      res.json(item);
    } catch (err) {
      res.status(500).json({ erro: "Erro ao buscar indicação.", detalhe: err.message });
    }
  },

  async criar(req, res) {
    try {
      const { professor, aluno, disciplina, justificativa } = req.body;
      if (!professor || !aluno || !disciplina) {
        return res.status(400).json({ erro: "professor, aluno e disciplina são obrigatórios." });
      }
      const nova = await Indicacao.create({ professor, aluno, disciplina, justificativa });
      res.status(201).json(nova);
    } catch (err) {
      res.status(500).json({ erro: "Erro ao criar indicação.", detalhe: err.message });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { professor, aluno, disciplina, justificativa, status } = req.body;
      const existe = await Indicacao.findById(id);
      if (!existe) return res.status(404).json({ erro: "Indicação não encontrada." });
      if (status && !statusValidos.includes(status)) {
        return res.status(400).json({ erro: "Status inválido." });
      }
      const atualizada = await Indicacao.update(id, {
        professor: professor ?? existe.professor,
        aluno: aluno ?? existe.aluno,
        disciplina: disciplina ?? existe.disciplina,
        justificativa: justificativa ?? existe.justificativa,
        status: status ?? existe.status,
      });
      res.json(atualizada);
    } catch (err) {
      res.status(500).json({ erro: "Erro ao atualizar indicação.", detalhe: err.message });
    }
  },

  async atualizarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status || !statusValidos.includes(status)) {
        return res.status(400).json({ erro: "Status inválido. Use: pendente, aprovado ou recusado." });
      }
      const existe = await Indicacao.findById(id);
      if (!existe) return res.status(404).json({ erro: "Indicação não encontrada." });
      const atualizada = await Indicacao.updateStatus(id, status);
      res.json(atualizada);
    } catch (err) {
      res.status(500).json({ erro: "Erro ao atualizar status.", detalhe: err.message });
    }
  },

  async remover(req, res) {
    try {
      const { id } = req.params;
      const existe = await Indicacao.findById(id);
      if (!existe) return res.status(404).json({ erro: "Indicação não encontrada." });
      await Indicacao.delete(id);
      res.json({ mensagem: "Indicação removida com sucesso." });
    } catch (err) {
      res.status(500).json({ erro: "Erro ao remover indicação.", detalhe: err.message });
    }
  },

  async estatisticas(req, res) {
    try {
      const stats = await Indicacao.stats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ erro: "Erro ao buscar estatísticas.", detalhe: err.message });
    }
  },
};

module.exports = indicacaoController;
