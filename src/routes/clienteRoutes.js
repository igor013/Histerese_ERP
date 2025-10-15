// src/routes/clienteRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/clienteController");

// 🔹 Listar clientes (com paginação e busca)
// GET /api/clientes?q=nome&page=1&limit=20&status=ativo|excluido
router.get("/", ctrl.listar);

// 🔹 Obter cliente por ID
// GET /api/clientes/:id
router.get("/:id", ctrl.obter);

// 🔹 Criar novo cliente
// POST /api/clientes
router.post("/", ctrl.criar);

// 🔹 Atualizar cliente (PUT completo)
// PUT /api/clientes/:id
router.put("/:id", ctrl.atualizar);

// 🔹 Atualização parcial (PATCH)
// PATCH /api/clientes/:id
router.patch("/:id", ctrl.patch);

// 🔹 Exclusão lógica
// DELETE /api/clientes/:id
router.delete("/:id", ctrl.excluir);

// 🔹 Restaurar cliente excluído
// POST /api/clientes/:id/restaurar
router.post("/:id/restaurar", ctrl.restaurar);

module.exports = router;
