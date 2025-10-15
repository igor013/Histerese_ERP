// src/routes/usuarioRoutes.js
const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const authMiddleware = require("../middlewares/authMiddleware");

// 🧩 Rotas públicas
// Cadastrar novo usuário
router.post("/", usuarioController.criar);

// 🛡️ Rotas protegidas (precisam de token JWT)
router.get("/", authMiddleware, usuarioController.listar);
router.get("/:id", authMiddleware, usuarioController.buscarPorId);
router.put("/:id", authMiddleware, usuarioController.atualizar);
router.delete("/:id", authMiddleware, usuarioController.excluir);

// 🆙 Alterar status (ex: reativar usuário)
router.patch("/:id/status", authMiddleware, usuarioController.alterarStatus);

module.exports = router;
