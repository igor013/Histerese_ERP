const express = require('express');
const router = express.Router();
const ServicoController = require('../controllers/servicoController');

// 🧾 Criar nova OS
router.post('/', ServicoController.criar);

// 📋 Listar OS com paginação e busca
router.get('/', ServicoController.listar);

// 🔍 Buscar OS por ID
router.get('/:id', ServicoController.buscarPorId);

// ✏️ Atualizar OS
router.put('/:id', ServicoController.atualizar);

// 🗑️ Excluir (lógica)
router.delete('/:id', ServicoController.excluir);

// 🎯 Buscar OS por status
router.get('/filtro/status', ServicoController.buscarPorStatus);

// 👤 Buscar OS por cliente
router.get('/filtro/cliente', ServicoController.buscarPorCliente);

module.exports = router;
