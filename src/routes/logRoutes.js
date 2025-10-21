// ====================================================
// 🚏 Histerese ERP - Rotas: Logs do Sistema
// ====================================================

const express = require("express");
const router = express.Router();
const { listarLogs } = require("../controllers/logController");
const verificarToken = require("../middlewares/authMiddleware");

// 🔐 Todas as rotas de logs exigem autenticação JWT
router.use(verificarToken);

// 📋 GET /api/logs → Lista os logs com filtros opcionais
router.get("/", listarLogs);

module.exports = router;
