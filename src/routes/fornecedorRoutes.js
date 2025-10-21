// ====================================================
// 🧾 ROTAS: FORNECEDORES
// ====================================================
// Define os endpoints relacionados à tabela "fornecedores"
// Todas as rotas exigem autenticação JWT
// ====================================================

const express = require("express");
const router = express.Router();
const fornecedorController = require("../controllers/fornecedorController");
const authMiddleware = require("../middlewares/authMiddleware");

// ====================================================
// 🔒 Middleware global de autenticação
// ====================================================
router.use(authMiddleware);

// ====================================================
// 🧩 ROTAS
// ====================================================

// Criar fornecedor
router.post("/", fornecedorController.criar);

// Listar fornecedores ativos
router.get("/", fornecedorController.listar);

// Buscar fornecedor por ID
router.get("/:id", fornecedorController.buscarPorId);

// Atualizar fornecedor
router.put("/:id", fornecedorController.atualizar);

// Exclusão lógica (status='excluido')
router.delete("/:id", fornecedorController.excluir);

// ====================================================
// 📘 EXPORTAÇÃO DO MÓDULO
// ====================================================
module.exports = router;
