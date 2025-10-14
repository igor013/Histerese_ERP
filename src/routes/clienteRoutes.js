// src/routes/clienteRoutes.js
const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");

// POST /api/clientes
router.post("/", clienteController.criar);

// GET /api/clientes
router.get("/", clienteController.listar);

// PUT /api/clientes/:id
router.put("/:id", clienteController.atualizar);

// DELETE /api/clientes/:id
router.delete("/:id", clienteController.excluir);

module.exports = router;
