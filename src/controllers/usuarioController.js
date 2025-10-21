// ====================================================
// 👤 Histerese ERP - Controller: Usuários (com logs)
// ====================================================

const usuarioRepo = require("../repositories/usuarioRepo");
const bcrypt = require("bcryptjs");
const { registrarLog } = require("../repositories/logRepo");

// ➕ Criar usuário
async function criar(req, res) {
    try {
        const { nome, login, senha } = req.body;

        if (!nome || !login || !senha) {
            return res.status(400).json({ erro: "Campos obrigatórios: nome, login, senha" });
        }

        const loginNormalizado = login.trim().toUpperCase();

        const existente = await usuarioRepo.buscarPorLogin(loginNormalizado);
        if (existente) {
            return res.status(400).json({ erro: "Login já cadastrado" });
        }

        const senha_hash = await bcrypt.hash(senha, 10);
        const usuario = await usuarioRepo.criar({ nome, login: loginNormalizado, senha_hash });

        // 🧾 LOG DE CRIAÇÃO
        try {
            await registrarLog({
                usuario_id: req.user?.id,
                empresa_id: req.user?.empresa_id,
                acao: "CRIAR",
                tabela: "usuarios",
                registro_id: usuario.id,
                descricao: `Usuário '${nome}' criado com sucesso.`,
                ip: req.ip,
            });
        } catch (logErr) {
            console.error("⚠️ Falha ao registrar log de criação de usuário:", logErr.message);
        }

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

// 📋 Listar usuários
async function listar(req, res) {
    try {
        const usuarios = await usuarioRepo.listar();
        return res.json(usuarios);
    } catch (err) {
        return res.status(500).json({ erro: err.message });
    }
}

// 🔍 Buscar usuário por ID
async function buscarPorId(req, res) {
    try {
        const usuario = await usuarioRepo.buscarPorId(req.params.id);
        if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });
        return res.json(usuario);
    } catch (err) {
        return res.status(500).json({ erro: err.message });
    }
}

// ✏️ Atualizar usuário
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

        // 🧾 LOG DE ATUALIZAÇÃO
        try {
            await registrarLog({
                usuario_id: req.user?.id,
                empresa_id: req.user?.empresa_id,
                acao: "EDITAR",
                tabela: "usuarios",
                registro_id: req.params.id,
                descricao: `Usuário '${usuario.nome}' atualizado.`,
                ip: req.ip,
            });
        } catch (logErr) {
            console.error("⚠️ Falha ao registrar log de atualização de usuário:", logErr.message);
        }

        return res.json(usuario);
    } catch (err) {
        if (err.code === "23505") {
            return res.status(400).json({ erro: "Login já está em uso por outro usuário" });
        }
        return res.status(500).json({ erro: err.message });
    }
}

// 🗑️ Exclusão lógica de usuário
async function excluir(req, res) {
    try {
        const usuario = await usuarioRepo.excluir(req.params.id);
        if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });

        // 🧾 LOG DE EXCLUSÃO
        try {
            await registrarLog({
                usuario_id: req.user?.id,
                empresa_id: req.user?.empresa_id,
                acao: "EXCLUIR",
                tabela: "usuarios",
                registro_id: req.params.id,
                descricao: `Usuário '${usuario.nome}' marcado como excluído.`,
                ip: req.ip,
            });
        } catch (logErr) {
            console.error("⚠️ Falha ao registrar log de exclusão de usuário:", logErr.message);
        }

        return res.json({ mensagem: "Usuário excluído com sucesso" });
    } catch (err) {
        return res.status(500).json({ erro: err.message });
    }
}

// 🔁 Alterar status do usuário
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

        // 🧾 LOG DE ALTERAÇÃO DE STATUS
        try {
            await registrarLog({
                usuario_id: req.user?.id,
                empresa_id: req.user?.empresa_id,
                acao: "ALTERAR_STATUS",
                tabela: "usuarios",
                registro_id: id,
                descricao: `Status do usuário '${usuarioExistente.nome}' alterado para '${status}'.`,
                ip: req.ip,
            });
        } catch (logErr) {
            console.error("⚠️ Falha ao registrar log de alteração de status:", logErr.message);
        }

        return res.json({
            mensagem: `Status alterado para '${status}' com sucesso`,
            usuario: atualizado
        });
    } catch (err) {
        return res.status(500).json({ erro: err.message });
    }
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir, alterarStatus };
