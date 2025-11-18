const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/fornecedorBancarioController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

// Criar conta bancária
router.post("/", ctrl.criar);

// Listar contas bancárias de um fornecedor
router.get("/:fornecedor_id", ctrl.listar);

// Atualizar conta bancária
router.put("/:id", ctrl.atualizar);

// Excluir conta bancária
router.delete("/:id", ctrl.excluir);

module.exports = router;
