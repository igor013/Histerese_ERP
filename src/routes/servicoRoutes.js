// ====================================================
// 🧰 ROTAS: SERVIÇOS / ORDEM DE SERVIÇO (OS)
// ====================================================
// Define os endpoints relacionados à tabela "servicos"
// Todas as rotas exigem autenticação JWT
// ====================================================

const express = require("express");
const router = express.Router();
const ServicoController = require("../controllers/servicoController");
const authMiddleware = require("../middlewares/authMiddleware");

// ====================================================
// 🔒 Middleware global de autenticação
// ====================================================
router.use(authMiddleware);

// ====================================================
// 🧩 ROTAS
// ====================================================

// Criar nova OS
// POST /api/servicos
router.post("/", ServicoController.criar);

// Listar OS com paginação e busca
// GET /api/servicos
router.get("/", ServicoController.listar);

// Buscar OS por ID
// GET /api/servicos/:id
router.get("/:id", ServicoController.buscarPorId);

// Atualizar OS
// PUT /api/servicos/:id
router.put("/:id", ServicoController.atualizar);

// Excluir (exclusão lógica)
// DELETE /api/servicos/:id
router.delete("/:id", ServicoController.excluir);

// Buscar OS por status
// GET /api/servicos/filtro/status
router.get("/filtro/status", ServicoController.buscarPorStatus);

// Buscar OS por cliente
// GET /api/servicos/filtro/cliente
router.get("/filtro/cliente", ServicoController.buscarPorCliente);

// ====================================================
// 📘 EXPORTAÇÃO DO MÓDULO
// ====================================================
module.exports = router;
