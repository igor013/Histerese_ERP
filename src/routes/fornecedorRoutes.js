const express = require("express");
const router = express.Router();
const fornecedorController = require("../controllers/fornecedorController");

// Criar
router.post("/", fornecedorController.criar);

// Listar
router.get("/", fornecedorController.listar);

// Buscar por ID
router.get("/:id", fornecedorController.buscarPorId);

// Atualizar
router.put("/:id", fornecedorController.atualizar);

// Exclusão lógica
router.delete("/:id", fornecedorController.excluir);

module.exports = router;
