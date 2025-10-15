const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db');

const router = express.Router();

// Garante que a pasta exista
const uploadDir = path.join(__dirname, '..', 'uploads', 'logos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowed.includes(ext)) {
            return cb(new Error('Formato inválido. Envie PNG, JPG ou WEBP.'));
        }
        cb(null, true);
    }
});

// 🔹 Upload e substituição da logo
router.post('/logo/:empresaId', upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        const { empresaId } = req.params;
        const relativePath = `${req.protocol}://${req.get('host')}/uploads/logos/${req.file.filename}`;


        // 1️⃣ Busca a logo atual
        const current = await pool.query(
            'SELECT logo_url FROM empresa WHERE id = $1',
            [empresaId]
        );

        if (current.rows.length === 0) {
            return res.status(404).json({ error: 'Empresa não encontrada' });
        }

        const oldLogoUrl = current.rows[0].logo_url;
        if (oldLogoUrl) {
            const oldPath = path.join(__dirname, '..', oldLogoUrl);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath); // ✅ remove o arquivo antigo
                console.log('🗑️ Logo antiga removida:', oldPath);
            }
        }

        // 2️⃣ Atualiza o banco com a nova logo
        const sql = `UPDATE empresa SET logo_url = $1 WHERE id = $2 RETURNING *;`;
        const { rows } = await pool.query(sql, [relativePath, empresaId]);

        res.json({
            message: 'Logo atualizada com sucesso!',
            empresa: rows[0],
            logo_url: relativePath
        });
    } catch (err) {
        console.error('❌ Erro ao enviar logo:', err);
        res.status(500).json({ error: 'Erro ao enviar logo', details: err.message });
    }
});

module.exports = router;
