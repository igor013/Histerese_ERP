// ====================================================
// 📦 ROTAS: PRODUTOS
// ====================================================
// Define os endpoints relacionados à tabela "produtos"
// Todas as rotas exigem autenticação JWT
// ====================================================

const express = require("express");
const router = express.Router();
const produtoController = require("../controllers/produtoController");
const authMiddleware = require("../middlewares/authMiddleware");

// ====================================================
// 🔒 Middleware global de autenticação
// ====================================================
router.use(authMiddleware);

// ====================================================
// 🧩 ROTAS
// ====================================================

// Criar produto
// POST /api/produtos
router.post("/", produtoController.criar);

// Listar produtos
// GET /api/produtos
router.get("/", produtoController.listar);

// Buscar produto por ID
// GET /api/produtos/:id
router.get("/:id", produtoController.buscarPorId);

// Atualizar produto
// PUT /api/produtos/:id
router.put("/:id", produtoController.atualizar);

// Exclusão lógica
// DELETE /api/produtos/:id
router.delete("/:id", produtoController.excluir);

// ====================================================
// 📘 EXPORTAÇÃO DO MÓDULO
// ====================================================
module.exports = router;
