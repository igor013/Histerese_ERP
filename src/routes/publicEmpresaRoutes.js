const express = require("express");
const router = express.Router();
const empresaRepo = require("../repositories/empresaRepo");

// ✅ Listar todas as empresas (público)
router.get("/", async (req, res) => {
    try {
        const empresas = await empresaRepo.listar();
        res.json(empresas);
    } catch (err) {
        console.error("Erro ao listar empresas públicas:", err);
        res.status(500).json({ erro: "Erro interno ao listar empresas." });
    }
});

// ✅ Buscar uma empresa específica (público)
router.get("/:id", async (req, res) => {
    try {
        const empresa = await empresaRepo.buscarPorId(req.params.id);
        if (!empresa) {
            return res.status(404).json({ erro: "Empresa não encontrada" });
        }
        res.json(empresa);
    } catch (err) {
        console.error("Erro ao buscar empresa pública:", err);
        res.status(500).json({ erro: "Erro interno ao buscar empresa." });
    }
});

module.exports = router;
