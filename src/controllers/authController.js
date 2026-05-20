const pool = require('../models/db');
const bcrypt = require('bcrypt');

// Cadastro de usuário
exports.register = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const hash = await bcrypt.hash(senha, 10);

    await pool.query(
      'INSERT INTO alunos (nome, email, senha) VALUES ($1, $2, $3)',
      [nome, email, hash]
    );

    res.json({ mensagem: 'Usuário criado com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

const jwt = require('jsonwebtoken');

// Login
exports.login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM alunos WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha inválida' });
    }

    const token = jwt.sign(
      { id: user.id, isAdmin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};