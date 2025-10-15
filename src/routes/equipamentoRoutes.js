// src/routes/equipamentoRoutes.js
const express = require('express');
const ctrl = require('../controllers/equipamentoController');

const router = express.Router();

// POST   /equipamentos
router.post('/', ctrl.create);

// GET    /equipamentos?q=&page=&limit=&cliente_id=&tipo=&marca=&modelo=&status=
router.get('/', ctrl.list);

// GET    /equipamentos/:id
router.get('/:id', ctrl.getById);

// PUT    /equipamentos/:id
router.put('/:id', ctrl.update);

// DELETE /equipamentos/:id  (soft delete)
router.delete('/:id', ctrl.remove);

// PATCH  /equipamentos/:id/restaurar
router.patch('/:id/restaurar', ctrl.restore);

module.exports = router;
