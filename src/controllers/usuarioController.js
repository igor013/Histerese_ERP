const usuarioRepo = require("../repositories/usuarioRepo");

async function criar(req, res) {
    try {
        const usuario = await usuarioRepo.criar(req.body);
        res.status(201).json(usuario);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

async function listar(req, res) {
    try {
        const usuarios = await usuarioRepo.listar();
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

async function buscarPorId(req, res) {
    try {
        const usuario = await usuarioRepo.buscarPorId(req.params.id);
        if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

async function atualizar(req, res) {
    try {
        const usuario = await usuarioRepo.atualizar(req.params.id, req.body);
        if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

async function excluir(req, res) {
    try {
        const usuario = await usuarioRepo.excluir(req.params.id);
        if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir };
