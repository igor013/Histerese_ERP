// src/routes/clienteRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/clienteController");
const authMiddleware = require("../middlewares/authMiddleware");

// 🔒 Todas as rotas exigem autenticação
router.use(authMiddleware);

// ====================================================
// 🧾 ROTAS: CLIENTES
// ====================================================

// 🔹 Listar clientes
router.get("/", ctrl.listar);

// 🔹 Obter cliente por ID
router.get("/:id", ctrl.obter);

// 🔹 Criar novo cliente
router.post("/", ctrl.criar);

// 🔹 Atualizar cliente
router.put("/:id", ctrl.atualizar);

// 🔹 Excluir cliente (exclusão lógica)
router.delete("/:id", ctrl.excluir);

// ⚠️ Comentado para evitar crash enquanto confirmamos a função
// router.post("/:id/restaurar", ctrl.restaurar);

module.exports = router;
