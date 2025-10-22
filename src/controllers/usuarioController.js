// ====================================================
// 👤 Histerese ERP - Controller: Usuários (versão final estável)
// ====================================================

const usuarioRepo = require("../repositories/usuarioRepo");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registrarLog } = require("../repositories/logRepo");
const db = require("../config/db");

// ====================================================
// ➕ Criar usuário
// ====================================================
async function criar(req, res) {
    try {
        const { nome, login, senha, empresa_id: bodyEmpresaId } = req.body;

        if (!nome || !login || !senha) {
            return res.status(400).json({ erro: "Campos obrigatórios: nome, login e senha." });
        }

        const loginNormalizado = login.trim().toUpperCase();

        let empresa_id = bodyEmpresaId || req.user?.empresa_id;
        empresa_id = empresa_id ? Number(empresa_id) : null;

        if (!empresa_id || isNaN(empresa_id)) {
            const { rows } = await db.query("SELECT id FROM empresa ORDER BY id ASC LIMIT 1");
            empresa_id = rows[0]?.id;
        }

        if (!empresa_id) {
            return res.status(400).json({
                erro: "Nenhuma empresa cadastrada. Cadastre uma empresa antes de criar usuários."
            });
        }

        const existente = await usuarioRepo.buscarPorLogin(loginNormalizado, empresa_id);
        if (existente) {
            return res.status(400).json({ erro: "Já existe um usuário com esse login nesta empresa." });
        }

        const senha_hash = await bcrypt.hash(senha, 10);

        const usuario = await usuarioRepo.criar({
            nome: nome.trim(),
            login: loginNormalizado,
            senha_hash,
            empresa_id
        });

        try {
            await registrarLog({
                usuario_id: req.user?.id || usuario.id,
                empresa_id,
                acao: "CRIAR",
                tabela: "usuarios",
                registro_id: usuario.id,
                descricao: `Usuário '${usuario.nome}' criado na empresa ${empresa_id}.`,
                ip: req.ip
            });
        } catch (logErr) {
            console.error("⚠️ Falha ao registrar log:", logErr.message);
        }

        return res.status(201).json({
            mensagem: "Usuário criado com sucesso.",
            usuario
        });
    } catch (err) {
        console.error("❌ Erro ao criar usuário:", err);
        return res.status(500).json({
            erro: "Erro interno ao criar usuário.",
            detalhes: err.message
        });
    }
}

// ====================================================
// 🔑 Login de usuário
// ====================================================
async function login(req, res) {
    try {
        const { login, senha, empresa_id } = req.body;

        if (!login || !senha || !empresa_id) {
            return res.status(400).json({ erro: "Campos obrigatórios: login, senha e empresa_id." });
        }

        const loginNormalizado = login.trim().toUpperCase();
        const usuario = await usuarioRepo.buscarPorLogin(loginNormalizado, empresa_id);

        if (!usuario) {
            return res.status(401).json({ erro: "Usuário ou senha inválidos." });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ erro: "Usuário ou senha inválidos." });
        }

        if (usuario.status === "excluido") {
            return res.status(403).json({ erro: "Usuário inativo. Contate o administrador." });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                nome: usuario.nome,
                empresa_id: usuario.empresa_id
            },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        return res.json({
            mensagem: "Login realizado com sucesso.",
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                login: usuario.login,
                empresa_id: usuario.empresa_id,
                status: usuario.status
            }
        });
    } catch (err) {
        console.error("❌ Erro ao realizar login:", err);
        return res.status(500).json({ erro: "Erro interno ao realizar login." });
    }
}

// ====================================================
// 📋 Listar usuários
// ====================================================
async function listar(req, res) {
    try {
        const empresa_id = req.user?.empresa_id || 1;
        const usuarios = await usuarioRepo.listar(empresa_id);
        return res.json(usuarios);
    } catch (err) {
        console.error("❌ Erro ao listar usuários:", err);
        return res.status(500).json({ erro: "Erro interno ao listar usuários." });
    }
}

// ====================================================
// 🔍 Buscar usuário por ID
// ====================================================
async function buscarPorId(req, res) {
    try {
        const usuario = await usuarioRepo.buscarPorId(req.params.id);
        if (!usuario) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }
        return res.json(usuario);
    } catch (err) {
        console.error("❌ Erro ao buscar usuário:", err);
        return res.status(500).json({ erro: "Erro interno ao buscar usuário." });
    }
}

// ====================================================
// ✏️ Atualizar usuário
// ====================================================
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

        if (!usuario) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        try {
            await registrarLog({
                usuario_id: req.user?.id,
                empresa_id: req.user?.empresa_id,
                acao: "EDITAR",
                tabela: "usuarios",
                registro_id: req.params.id,
                descricao: `Usuário '${usuario.nome}' atualizado.`,
                ip: req.ip
            });
        } catch (logErr) {
            console.error("⚠️ Falha ao registrar log:", logErr.message);
        }

        return res.json({
            mensagem: "Usuário atualizado com sucesso.",
            usuario
        });
    } catch (err) {
        console.error("❌ Erro ao atualizar usuário:", err);
        return res.status(500).json({ erro: "Erro interno ao atualizar usuário." });
    }
}

// ====================================================
// 🗑️ Exclusão lógica
// ====================================================
async function excluir(req, res) {
    try {
        const usuario = await usuarioRepo.excluir(req.params.id);
        if (!usuario) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        try {
            await registrarLog({
                usuario_id: req.user?.id,
                empresa_id: req.user?.empresa_id,
                acao: "EXCLUIR",
                tabela: "usuarios",
                registro_id: req.params.id,
                descricao: `Usuário '${usuario.nome}' marcado como excluído.`,
                ip: req.ip
            });
        } catch (logErr) {
            console.error("⚠️ Falha ao registrar log:", logErr.message);
        }

        return res.json({ mensagem: "Usuário excluído com sucesso." });
    } catch (err) {
        console.error("❌ Erro ao excluir usuário:", err);
        return res.status(500).json({ erro: "Erro interno ao excluir usuário." });
    }
}

// ====================================================
// 🔁 Alterar status
// ====================================================
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
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        const atualizado = await usuarioRepo.atualizarStatus(id, status);

        try {
            await registrarLog({
                usuario_id: req.user?.id,
                empresa_id: req.user?.empresa_id,
                acao: "ALTERAR_STATUS",
                tabela: "usuarios",
                registro_id: id,
                descricao: `Status do usuário '${usuarioExistente.nome}' alterado para '${status}'.`,
                ip: req.ip
            });
        } catch (logErr) {
            console.error("⚠️ Falha ao registrar log:", logErr.message);
        }

        return res.json({
            mensagem: `Status alterado para '${status}' com sucesso.`,
            usuario: atualizado
        });
    } catch (err) {
        console.error("❌ Erro ao alterar status:", err);
        return res.status(500).json({ erro: "Erro interno ao alterar status do usuário." });
    }
}

// ====================================================
// 📦 Exportação
// ====================================================
module.exports = {
    criar,
    login,
    listar,
    buscarPorId,
    atualizar,
    excluir,
    alterarStatus
};
