// ====================================================
// 🧩 ROTAS: GRUPOS
// ====================================================
// Define os endpoints relacionados à tabela "grupos"
// Todas as rotas exigem autenticação JWT
// ====================================================

const express = require("express");
const router = express.Router();
const grupoController = require("../controllers/grupoController");
const authMiddleware = require("../middlewares/authMiddleware");

// ====================================================
// 🔒 Middleware global de autenticação
// ====================================================
router.use(authMiddleware);

// ====================================================
// 🧠 ROTAS
// ====================================================

// Listar grupos
router.get("/", grupoController.listar);

// Obter grupo por ID
router.get("/:id", grupoController.obter);

// Criar novo grupo
router.post("/", grupoController.criar);

// Atualizar grupo
router.put("/:id", grupoController.atualizar);

// Exclusão lógica
router.delete("/:id", grupoController.excluir);

// ====================================================
// 📘 EXPORTAÇÃO DO MÓDULO
// ====================================================
module.exports = router;
