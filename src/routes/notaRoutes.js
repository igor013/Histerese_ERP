const express = require("express");
const router = express.Router();
const notaController = require("../controllers/notaController");

// Rota para criar uma nova nota com itens
router.post("/", notaController.criar);

// Rota para listar todas as notas
router.get("/", notaController.listar);

// Rota para buscar uma nota específica com seus itens
router.get("/:id", notaController.buscarPorId);

// Rota para atualizar cabeçalho de uma nota
router.put("/:id", notaController.atualizar);

// Rota para excluir uma nota inteira
router.delete("/:id", notaController.excluir);

// Rota para excluir um item específico da nota
router.delete("/itens/:id", notaController.excluirItem);

module.exports = router;
