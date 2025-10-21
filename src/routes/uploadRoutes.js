// ====================================================
// 📤 ROTAS: UPLOAD DE LOGO DA EMPRESA
// ====================================================
// Gerencia o envio e substituição de logos das empresas.
// Exige autenticação JWT.
// ====================================================

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { pool } = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// ====================================================
// 🔒 Middleware global de autenticação
// ====================================================
router.use(authMiddleware);

// ====================================================
// 📁 GARANTE QUE A PASTA DE UPLOAD EXISTE
// ====================================================
const uploadDir = path.join(__dirname, "..", "uploads", "logos");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ====================================================
// ⚙️ CONFIGURAÇÃO DO MULTER
// ====================================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = [".png", ".jpg", ".jpeg", ".webp"];
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowed.includes(ext)) {
            return cb(new Error("Formato inválido. Envie PNG, JPG ou WEBP."));
        }
        cb(null, true);
    },
});

// ====================================================
// 🚀 UPLOAD E SUBSTITUIÇÃO DA LOGO
// ====================================================
router.post("/logo/:empresaId", upload.single("logo"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Nenhum arquivo enviado" });
        }

        const { empresaId } = req.params;
        const relativePath = `/uploads/logos/${req.file.filename}`;

        // 1️⃣ Busca a logo atual
        const current = await pool.query(
            "SELECT logo_url FROM empresa WHERE id = $1",
            [empresaId]
        );

        if (current.rows.length === 0) {
            return res.status(404).json({ error: "Empresa não encontrada" });
        }

        // 2️⃣ Remove a logo anterior se existir
        const oldLogoUrl = current.rows[0].logo_url;
        if (oldLogoUrl) {
            const oldPath = path.join(__dirname, "..", oldLogoUrl);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
                console.log("🗑️ Logo antiga removida:", oldPath);
            }
        }

        // 3️⃣ Atualiza o banco com a nova logo
        const sql = `UPDATE empresa SET logo_url = $1 WHERE id = $2 RETURNING *;`;
        const { rows } = await pool.query(sql, [relativePath, empresaId]);

        res.json({
            message: "Logo atualizada com sucesso!",
            empresa: rows[0],
            logo_url: relativePath,
        });
    } catch (err) {
        console.error("❌ Erro ao enviar logo:", err);
        res.status(500).json({ error: "Erro ao enviar logo", details: err.message });
    }
});

// ====================================================
// 📘 EXPORTAÇÃO DO MÓDULO
// ====================================================
module.exports = router;
