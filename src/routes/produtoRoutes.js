// ====================================================
// 📦 ROTAS: PRODUTOS
// ====================================================
// Define os endpoints relacionados à tabela "produtos"
// Todas as rotas exigem autenticação JWT (já aplicada no server.js)
// ====================================================

const express = require("express");
const router = express.Router();
const produtoController = require("../controllers/produtoController");

// ====================================================
// 🧩 ROTAS
// ====================================================

// Criar produto
// POST /api/produtos
router.post("/", produtoController.criar);

// Listar produtos (com paginação e busca ?q=)
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

// Restaurar produto inativo
// PUT /api/produtos/:id/restaurar
router.put("/:id/restaurar", produtoController.restaurar);

// ====================================================
// 📘 EXPORTAÇÃO DO MÓDULO
// ====================================================
module.exports = router;
