// ====================================================
// 💾 ROTA DE BACKUP DO BANCO DE DADOS
// ====================================================
// Este módulo define as rotas responsáveis por:
//   - Geração de backup completo do banco (estrutura + dados)
//   - Download do arquivo .sql mais recente
//
// Requer autenticação JWT para todas as rotas (proteção global)
//
// Estrutura de referência:
//   controllers/backupController.js
// ====================================================

const express = require("express");
const router = express.Router();
const { gerarBackup, downloadBackup } = require("../controllers/backupController");
const authMiddleware = require("../middlewares/authMiddleware");

// ====================================================
// 🔒 Middleware global de autenticação
// ====================================================
// Todas as rotas abaixo exigem token JWT válido
router.use(authMiddleware);

// ====================================================
// 📦 GERA BACKUP MANUAL (pg_dump)
// ====================================================
// Método: GET
// Endpoint: /api/backup
// Retorna um JSON com nome, caminho e status do backup
router.get("/", gerarBackup);

// ====================================================
// 📥 DOWNLOAD DO BACKUP MAIS RECENTE (.sql)
// ====================================================
// Método: GET
// Endpoint: /api/backup/download
// Envia o arquivo .sql mais recente para o cliente
router.get("/download", downloadBackup);

// ====================================================
// 📘 EXPORTAÇÃO DO MÓDULO
// ====================================================
module.exports = router;
