const pool = require('../models/db');

// Criar habilidade
exports.criar = async (req, res) => {
  const { nome } = req.body;

  try {
    await pool.query(
      'INSERT INTO habilidades (nome) VALUES ($1)',
      [nome]
    );

    res.json({ mensagem: 'Habilidade criada com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Vincular habilidade ao aluno com nível
exports.vincular = async (req, res) => {
  const { habilidade_id, nivel } = req.body;
  const aluno_id = req.user.id;

  if (nivel < 0 || nivel > 10) {
    return res.status(400).json({ erro: "O nível da habilidade deve ser entre 0 e 10." });
  }

  try {
    await pool.query(
      'INSERT INTO aluno_habilidade (aluno_id, habilidade_id, nivel) VALUES ($1, $2, $3)',
      [aluno_id, habilidade_id, nivel]
    );
    res.json({ mensagem: 'Habilidade vinculada com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};
// Listar habilidades do usuário
exports.listar = async (req, res) => {
  const aluno_id = req.user.id;

  try {
    const result = await pool.query(`
      SELECT h.id, h.nome, ah.nivel
      FROM aluno_habilidade ah
      JOIN habilidades h ON ah.habilidade_id = h.id
      WHERE ah.aluno_id = $1
    `, [aluno_id]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Listar tudo
exports.listarTodas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM habilidades ORDER BY nome ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Relatório de habilidades
exports.relatorioHabilidades = async (req, res) => {
  try {
    const query = `
      SELECT 
        h.nome as habilidade,
        COUNT(ah.aluno_id) as total_alunos_dominam,
        (SELECT COUNT(*) FROM alunos WHERE is_admin = false) as total_geral_alunos
      FROM habilidades h
      LEFT JOIN aluno_habilidade ah ON h.id = ah.habilidade_id
      GROUP BY h.id, h.nome;
    `;
    const result = await pool.query(query);

    const relatorio = result.rows.map(row => ({
      habilidade: row.habilidade,
      quantidade: row.total_alunos_dominam,
      proporcao: row.total_geral_alunos > 0 
        ? ((row.total_alunos_dominam / row.total_geral_alunos) * 100).toFixed(1) 
        : 0
    }));

    res.json(relatorio);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};