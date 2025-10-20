// ====================================================
// 🧭 ROTAS: EMPRESA
// ====================================================
// Define os endpoints relacionados à tabela "empresa"
// ====================================================

const express = require("express");
const router = express.Router();
const empresaController = require("../controllers/empresaController");
const authMiddleware = require("../middlewares/authMiddleware");

// ====================================================
// 🔒 Middleware global de autenticação
// ====================================================
// Caso queira liberar para teste, comente esta linha temporariamente.
router.use(authMiddleware);

// ====================================================
// 📋 LISTAR TODAS AS EMPRESAS
// GET /api/empresas
// ====================================================
router.get("/", empresaController.listar);

// ====================================================
// 🔍 BUSCAR EMPRESA POR ID
// GET /api/empresas/:id
// ====================================================
router.get("/:id", empresaController.buscarPorId);

// ====================================================
// 🏢 CRIAR NOVA EMPRESA
// POST /api/empresas
// ====================================================
router.post("/", empresaController.criar);

// ====================================================
// ✏️ ATUALIZAR EMPRESA
// PUT /api/empresas/:id
// ====================================================
router.put("/:id", empresaController.atualizar);

// ====================================================
// 🗑️ EXCLUIR EMPRESA (exclusão lógica)
// DELETE /api/empresas/:id
// ====================================================
router.delete("/:id", empresaController.excluir);

// ====================================================
// 🔁 REATIVAR EMPRESA
// PATCH /api/empresas/:id/status
// Body: { "status": "ativo" }
// ====================================================
router.patch("/:id/status", empresaController.reativar);

// ====================================================
// 📦 EXPORTAÇÃO DO MÓDULO
// ====================================================
module.exports = router;
