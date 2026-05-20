const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão DB
const pool = require('./models/db');

// Middlewares
const authMiddleware = require('./middlewares/authMiddleware');

// Rotas
const authRoutes = require('./routes/authRoutes');
const receitaRoutes = require('./routes/receitaRoutes');
const habilidadeRoutes = require('./routes/habilidadeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const comentarioRoutes = require('./routes/comentarioRoutes');
app.use('/comentarios', comentarioRoutes);
app.use('/admin', adminRoutes);

// Rotas públicas
app.get('/', (req, res) => {
  res.send('Servidor funcionando!');
});

app.get('/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// Rotas de autenticação
app.use('/auth', authRoutes);

// Rota protegida de teste
app.get('/perfil', authMiddleware, (req, res) => {
  res.json({
    mensagem: 'Acesso autorizado!',
    usuario: req.user
  });
});

// Rotas principais
app.use('/receitas', receitaRoutes);
app.use('/habilidades', habilidadeRoutes);

module.exports = app;
