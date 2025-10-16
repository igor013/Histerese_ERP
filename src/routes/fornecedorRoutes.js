const express = require("express");
const router = express.Router();
const fornecedorController = require("../controllers/fornecedorController");

// 🔹 Criar fornecedor
router.post("/", fornecedorController.criar);

// 🔹 Listar fornecedores ativos
router.get("/", fornecedorController.listar);

// 🔹 Buscar fornecedor por ID
router.get("/:id", fornecedorController.buscarPorId);

// 🔹 Atualizar fornecedor
router.put("/:id", fornecedorController.atualizar);

// 🔹 Exclusão lógica (status='excluido')
router.delete("/:id", fornecedorController.excluir);

module.exports = router;
