const empresaRepo = require("../repositories/empresaRepo");

async function criar(req, res) {
    try {
        const empresa = await empresaRepo.criar(req.body);
        res.status(201).json(empresa);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

async function listar(req, res) {
    try {
        const empresas = await empresaRepo.listar();
        res.json(empresas);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

async function atualizar(req, res) {
    try {
        const empresa = await empresaRepo.atualizar(req.params.id, req.body);
        if (!empresa) return res.status(404).json({ erro: "Empresa não encontrada" });
        res.json(empresa);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

module.exports = { criar, listar, atualizar };
