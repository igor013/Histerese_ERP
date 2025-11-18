// src/routes/usuarioRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/usuarioController");
const authMiddleware = require("../middlewares/authMiddleware");

// ====================================================
// 🧾 Rota pública: LOGIN
// ====================================================
router.post("/login", ctrl.login);

// ====================================================
// 🔒 Rotas protegidas por token
// ====================================================
router.use(authMiddleware);

// 🔹 Listar usuários
router.get("/", ctrl.listar);

// 🔹 Criar novo usuário
router.post("/", ctrl.criar);

// 🔹 Atualizar nome/login
router.put("/:id", ctrl.atualizar);

// 🔹 Alterar senha
router.post("/:id/senha", ctrl.alterarSenha);

// 🔹 Exclusão lógica
router.delete("/:id", ctrl.excluir);

module.exports = router;
