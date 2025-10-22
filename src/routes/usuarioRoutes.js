// ====================================================
// 👤 Histerese ERP - Rotas: Usuários
// ====================================================

const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const authMiddleware = require("../middlewares/authMiddleware");

// 🧩 Rotas públicas
router.post("/", usuarioController.criar);
router.post("/login", usuarioController.login); // 🔑 login público

// 🛡️ Rotas protegidas
router.get("/", authMiddleware, usuarioController.listar);
router.get("/:id", authMiddleware, usuarioController.buscarPorId);
router.put("/:id", authMiddleware, usuarioController.atualizar);
router.delete("/:id", authMiddleware, usuarioController.excluir);
router.patch("/:id/status", authMiddleware, usuarioController.alterarStatus);

module.exports = router;
