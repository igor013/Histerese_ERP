const grupoRepo = require("../repositories/grupoRepo");

async function criar(req, res) {
    try {
        const grupo = await grupoRepo.criar(req.body);
        res.status(201).json(grupo);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

async function listar(req, res) {
    try {
        const grupos = await grupoRepo.listar();
        res.json(grupos);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

async function buscarPorId(req, res) {
    try {
        const grupo = await grupoRepo.buscarPorId(req.params.id);
        if (!grupo) return res.status(404).json({ erro: "Grupo não encontrado" });
        res.json(grupo);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

async function atualizar(req, res) {
    try {
        const grupo = await grupoRepo.atualizar(req.params.id, req.body);
        if (!grupo) return res.status(404).json({ erro: "Grupo não encontrado" });
        res.json(grupo);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

async function excluir(req, res) {
    try {
        const grupo = await grupoRepo.excluir(req.params.id);
        if (!grupo) return res.status(404).json({ erro: "Grupo não encontrado" });
        res.json(grupo);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir };
