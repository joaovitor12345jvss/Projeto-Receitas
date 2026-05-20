const express = require('express');
const router = express.Router();

const controller = require('../controllers/habilidadeController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/todas', controller.listarTodas);

// Criar habilidade
router.post('/', authMiddleware, controller.criar);

// Vincular habilidade ao usuário
router.post('/vincular', authMiddleware, controller.vincular);

// Listar habilidades do usuário
router.get('/', authMiddleware, controller.listar);

// Relatório de hablidades
router.get('/relatorio/proporcao', controller.relatorioHabilidades);

module.exports = router;