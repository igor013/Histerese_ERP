// src/controllers/usuarioController.js
const usuarioRepo = require("../repositories/usuarioRepo");
const bcrypt = require("bcryptjs");

async function criar(req, res) {
    try {
        const { nome, login, senha } = req.body;

        if (!nome || !login || !senha) {
            return res.status(400).json({ erro: "Campos obrigatórios: nome, login, senha" });
        }

        // força o login para maiúsculas
        const loginNormalizado = login.trim().toUpperCase();

        // verifica se já existe login igual
        const existente = await usuarioRepo.buscarPorLogin(loginNormalizado);
        if (existente) {
            return res.status(400).json({ erro: "Login já cadastrado" });
        }

        const senha_hash = await bcrypt.hash(senha, 10);
        const usuario = await usuarioRepo.criar({ nome, login: loginNormalizado, senha_hash });

        return res.status(201).json(usuario);
    } catch (err) {
        if (err.code === "23505") {
            return res.status(400).json({
                erro: "Login já existe (possivelmente de um usuário excluído). Use o PATCH /usuarios/:id/status para reativar."
            });
        }
        return res.status(500).json({ erro: err.message });
    }
}

async function listar(req, res) {
    try {
        const usuarios = await usuarioRepo.listar();
        return res.json(usuarios);
    } catch (err) {
        return res.status(500).json({ erro: err.message });
    }
}

async function buscarPorId(req, res) {
    try {
        const usuario = await usuarioRepo.buscarPorId(req.params.id);
        if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });
        return res.json(usuario);
    } catch (err) {
        return res.status(500).json({ erro: err.message });
    }
}

async function atualizar(req, res) {
    try {
        const { nome, login, senha } = req.body;
        const loginNormalizado = login ? login.trim().toUpperCase() : null;
        const senha_hash = senha ? await bcrypt.hash(senha, 10) : null;

        const usuario = await usuarioRepo.atualizar(req.params.id, {
            nome,
            login: loginNormalizado,
            senha_hash
        });

        if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });
        return res.json(usuario);
    } catch (err) {
        if (err.code === "23505") {
            return res.status(400).json({ erro: "Login já está em uso por outro usuário" });
        }
        return res.status(500).json({ erro: err.message });
    }
}

async function excluir(req, res) {
    try {
        const usuario = await usuarioRepo.excluir(req.params.id);
        if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });
        return res.json({ mensagem: "Usuário excluído com sucesso" });
    } catch (err) {
        return res.status(500).json({ erro: err.message });
    }
}

/**
 * PATCH /usuarios/:id/status
 * Body: { "status": "ativo" | "excluido" }
 */
async function alterarStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const statusPermitidos = ["ativo", "excluido"];
        if (!statusPermitidos.includes(status)) {
            return res.status(400).json({ erro: "Status inválido. Use 'ativo' ou 'excluido'." });
        }

        const usuarioExistente = await usuarioRepo.buscarPorId(id);
        if (!usuarioExistente) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        const atualizado = await usuarioRepo.atualizarStatus(id, status);
        return res.json({
            mensagem: `Status alterado para '${status}' com sucesso`,
            usuario: atualizado
        });
    } catch (err) {
        return res.status(500).json({ erro: err.message });
    }
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir, alterarStatus };
