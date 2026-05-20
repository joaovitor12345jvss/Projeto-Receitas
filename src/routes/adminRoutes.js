const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const controller = require('../controllers/adminController');

router.use(authMiddleware, adminMiddleware);

router.get('/usuarios', controller.listarUsuarios);

router.get('/receitas', controller.listarReceitas);
router.delete('/receitas/:id', controller.deletarReceita);

module.exports = router;

router.delete('/usuarios/:id', controller.deletarUsuario);

router.post('/receitas', controller.criarReceita);
router.put('/receitas/:id', controller.editarReceita);

router.post('/usuarios', controller.cadastrarUsuario);