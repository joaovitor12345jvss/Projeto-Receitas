const express = require('express');
const router = express.Router();
const controller = require('../controllers/comentarioController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:receita_id', controller.listarPorReceita);

router.post('/', authMiddleware, controller.criar);

module.exports = router;