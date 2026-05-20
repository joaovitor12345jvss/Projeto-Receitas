const pool = require('../models/db');

// listar usuários
exports.listarUsuarios = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, is_admin FROM alunos'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// listar todas receitas
exports.listarReceitas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, a.nome as autor
      FROM receitas r
      JOIN alunos a ON r.aluno_id = a.id
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// deletar qualquer receita
exports.deletarReceita = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM receitas WHERE id = $1', [id]);
    res.json({ mensagem: 'Receita deletada pelo admin' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// deletar usuário
exports.deletarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM alunos WHERE id = $1', [id]);
    res.json({ mensagem: 'Usuário deletado' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// editar receita
exports.editarReceita = async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, link } = req.body;

  try {
    await pool.query(
      'UPDATE receitas SET nome = $1, descricao = $2, link = $3 WHERE id = $4',
      [nome, descricao, link, id]
    );

    res.json({ mensagem: 'Receita atualizada pelo admin' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// criar receita (admin)
exports.criarReceita = async (req, res) => {
  const { nome, descricao, link, aluno_id } = req.body;

  try {
    await pool.query(
      'INSERT INTO receitas (nome, descricao, link, aluno_id) VALUES ($1, $2, $3, $4)',
      [nome, descricao, link, aluno_id]
    );

    res.json({ mensagem: 'Receita criada pelo admin' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

const bcrypt = require('bcrypt');

exports.cadastrarUsuario = async (req, res) => {
  const { nome, email, senha, is_admin } = req.body;

  try {
    // Criptografa a senha antes de salvar (Requisito de segurança)
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    await pool.query(
      'INSERT INTO alunos (nome, email, senha, is_admin) VALUES ($1, $2, $3, $4)',
      [nome, email, senhaHash, is_admin || false]
    );

    res.status(201).json({ mensagem: 'Aluno cadastrado com sucesso pelo administrador!' });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao cadastrar: " + error.message });
  }
};