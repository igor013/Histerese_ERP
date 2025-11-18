const express = require("express");
const router = express.Router();
const fornecedorController = require("../controllers/fornecedorController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.post("/", fornecedorController.criarFornecedor);
router.get("/", fornecedorController.listarFornecedores);
router.get("/:id", fornecedorController.buscarFornecedorPorId);
router.put("/:id", fornecedorController.atualizarFornecedor);
router.delete("/:id", fornecedorController.excluirFornecedor);

module.exports = router;
