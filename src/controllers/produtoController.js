const produtoRepo = require("../repositories/produtoRepo");

async function criar(req, res) {
    try {
        const produto = await produtoRepo.criar(req.body);
        res.status(201).json(produto);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

async function listar(req, res) {
    try {
        const produtos = await produtoRepo.listar();
        res.json(produtos);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

async function buscarPorId(req, res) {
    try {
        const produto = await produtoRepo.buscarPorId(req.params.id);
        if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });
        res.json(produto);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

async function atualizar(req, res) {
    try {
        const produto = await produtoRepo.atualizar(req.params.id, req.body);
        if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });
        res.json(produto);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

async function excluir(req, res) {
    try {
        const produto = await produtoRepo.excluir(req.params.id);
        if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });
        res.json(produto);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir };
