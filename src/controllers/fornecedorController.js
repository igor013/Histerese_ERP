const fornecedorRepo = require("../repositories/fornecedorRepo");

async function criar(req, res) {
    try {
        const data = await fornecedorRepo.criar(req.body);
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

async function listar(req, res) {
    try {
        const data = await fornecedorRepo.listar();
        res.json(data);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

async function buscarPorId(req, res) {
    try {
        const data = await fornecedorRepo.buscarPorId(req.params.id);
        if (!data) return res.status(404).json({ erro: "Fornecedor não encontrado" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

async function atualizar(req, res) {
    try {
        const data = await fornecedorRepo.atualizar(req.params.id, req.body);
        if (!data) return res.status(404).json({ erro: "Fornecedor não encontrado" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

async function excluir(req, res) {
    try {
        const data = await fornecedorRepo.excluir(req.params.id);
        if (!data) return res.status(404).json({ erro: "Fornecedor não encontrado" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir };
