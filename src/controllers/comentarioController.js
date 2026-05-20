const pool = require('../models/db');

exports.criar = async (req, res) => {
  const { receita_id, texto } = req.body;
  const aluno_id = req.user.id;
  try {
    await pool.query(
      'INSERT INTO comentarios (receita_id, aluno_id, texto) VALUES ($1, $2, $3)',
      [receita_id, aluno_id, texto]
    );
    res.json({ mensagem: 'Comentário enviado com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

exports.listarPorReceita = async (req, res) => {
  const { receita_id } = req.params;

  try {
    const result = await pool.query(`
      SELECT c.texto, c.data_criacao, a.nome as autor
      FROM comentarios c
      JOIN alunos a ON c.aluno_id = a.id
      WHERE c.receita_id = $1
      ORDER BY c.data_criacao ASC`,
      [receita_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
};