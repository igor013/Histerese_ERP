// ====================================================
// ⚙️ ROTAS: EQUIPAMENTOS
// ====================================================
// Define os endpoints relacionados à tabela "equipamentos"
// Todas as rotas exigem autenticação JWT
// ====================================================

const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/equipamentoController");
const authMiddleware = require("../middlewares/authMiddleware");

// ====================================================
// 🔒 Middleware global de autenticação
// ====================================================
router.use(authMiddleware);

// ====================================================
// 🧩 ROTAS
// ====================================================

// Criar novo equipamento
// POST /api/equipamentos
router.post("/", ctrl.create);

// Listar equipamentos (com filtros e paginação)
// GET /api/equipamentos?q=&page=&limit=&cliente_id=&tipo=&marca=&modelo=&status=
router.get("/", ctrl.list);

// Buscar equipamento por ID
// GET /api/equipamentos/:id
router.get("/:id", ctrl.getById);

// Atualizar equipamento
// PUT /api/equipamentos/:id
router.put("/:id", ctrl.update);

// Exclusão lógica (soft delete)
// DELETE /api/equipamentos/:id
router.delete("/:id", ctrl.remove);

// Restaurar equipamento
// PATCH /api/equipamentos/:id/restaurar
router.patch("/:id/restaurar", ctrl.restore);

// ====================================================
// 📘 EXPORTAÇÃO DO MÓDULO
// ====================================================
module.exports = router;
