const express = require('express');
const router = express.Router();

const controller = require('../controllers/receitaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Criar receita (protegido)
router.post('/', authMiddleware, controller.criar);

// Listar receitas (público)
router.get('/', controller.listar);

module.exports = router;

// Relatorio
router.get('/relatorio/proporcao', controller.relatorioProporcao);

router.get('/portfolio', controller.listarPortfolio);

// Editar receita
router.put('/:id', authMiddleware, controller.editar);

// Deletar receita
router.delete('/:id', authMiddleware, controller.deletar);

// Criar categoria
router.post('/categoria', authMiddleware, controller.criarCategoria);

// Vincular categoria
router.post('/vincular', authMiddleware, controller.vincularCategoria);

// Listar categoria com vinculo
router.get('/com-categorias', controller.listarComCategorias);

// Listar categoria
router.get('/categoria', controller.listarCategorias);

// Listar receita por categoria
router.get('/categoria/:id', controller.listarPorCategoria);


// Editar categoria
router.put('/categoria/:id', authMiddleware, controller.editarCategoria);

// Deletar categoria
router.delete('/categoria/:id', authMiddleware, controller.deletarCategoria);

const adminMiddleware = require('../middlewares/adminMiddleware');

router.delete('/categoria/:id', authMiddleware, adminMiddleware, controller.deletarCategoria);

// Listar receita por categoria
router.get('/categoria/:id', controller.listarPorCategoria);

