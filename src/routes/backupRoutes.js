const express = require("express");
const router = express.Router();
const backupController = require("../controllers/backupController");
const authMiddleware = require("../middlewares/authMiddleware");

// ======================================================
// 🔐 Todas as rotas de backup exigem autenticação JWT
// ======================================================
router.use(authMiddleware);

// ======================================================
// 📦 GERAÇÃO DE BACKUP MANUAL (PROTEGIDO)
// ======================================================
// Rota: GET /api/backup
// Gera um novo arquivo de backup do banco de dados (.sql)
router.get("/", backupController.gerarBackup);

// ======================================================
// 💾 DOWNLOAD DO BACKUP MAIS RECENTE (PROTEGIDO)
// ======================================================
// Rota: GET /api/backup/download
// Envia o arquivo mais recente da pasta /src/database/backups/
router.get("/download", backupController.downloadBackup);

module.exports = router;
