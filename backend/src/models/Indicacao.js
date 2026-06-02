const db = require("../config/database");

const Indicacao = {
  async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS indicacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        professor VARCHAR(100) NOT NULL,
        aluno VARCHAR(100) NOT NULL,
        disciplina VARCHAR(100) NOT NULL,
        justificativa TEXT,
        status ENUM('pendente', 'aprovado', 'recusado') DEFAULT 'pendente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await db.query(sql);
  },

  async findAll() {
    const [rows] = await db.query(
      "SELECT * FROM indicacoes ORDER BY created_at DESC"
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query("SELECT * FROM indicacoes WHERE id = ?", [id]);
    return rows[0] || null;
  },

  async findByStatus(status) {
    const [rows] = await db.query(
      "SELECT * FROM indicacoes WHERE status = ? ORDER BY created_at DESC",
      [status]
    );
    return rows;
  },

  async create({ professor, aluno, disciplina, justificativa }) {
    const [result] = await db.query(
      "INSERT INTO indicacoes (professor, aluno, disciplina, justificativa) VALUES (?, ?, ?, ?)",
      [professor, aluno, disciplina, justificativa || null]
    );
    return this.findById(result.insertId);
  },

  async updateStatus(id, status) {
    await db.query("UPDATE indicacoes SET status = ? WHERE id = ?", [status, id]);
    return this.findById(id);
  },

  async update(id, { professor, aluno, disciplina, justificativa, status }) {
    await db.query(
      "UPDATE indicacoes SET professor=?, aluno=?, disciplina=?, justificativa=?, status=? WHERE id=?",
      [professor, aluno, disciplina, justificativa, status, id]
    );
    return this.findById(id);
  },

  async delete(id) {
    const [result] = await db.query("DELETE FROM indicacoes WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  async stats() {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) AS total,
        SUM(status = 'pendente') AS pendentes,
        SUM(status = 'aprovado') AS aprovados,
        SUM(status = 'recusado') AS recusados
      FROM indicacoes
    `);
    return rows[0];
  },
};

module.exports = Indicacao;
