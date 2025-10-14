const express = require("express");
const router = express.Router();
const produtoController = require("../controllers/produtoController");

router.post("/", produtoController.criar);       // Criar produto
router.get("/", produtoController.listar);       // Listar produtos
router.get("/:id", produtoController.buscarPorId); // Buscar por ID
router.put("/:id", produtoController.atualizar); // Atualizar
router.delete("/:id", produtoController.excluir); // Exclusão lógica

module.exports = router;
