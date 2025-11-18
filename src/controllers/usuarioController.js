// ====================================================
// 👤 Histerese ERP - Controller: Usuários (com filtro, login multiempresa e troca de senha)
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
        if (!nome || !login || !senha)
            return res.status(400).json({ erro: "Campos obrigatórios: nome, login e senha." });

        const loginUpper = login.trim().toUpperCase();
        let empresa_id = bodyEmpresaId || req.user?.empresa_id || 1;

        const existente = await usuarioRepo.buscarPorLogin(loginUpper, empresa_id);
        if (existente)
            return res.status(400).json({ erro: "Já existe um usuário com esse login nesta empresa." });

        const senha_hash = await bcrypt.hash(senha, 10);
        const usuario = await usuarioRepo.criar({ nome: nome.trim(), login: loginUpper, senha_hash, empresa_id });
        return res.status(201).json({ mensagem: "Usuário criado com sucesso.", usuario });
    } catch (err) {
        console.error("❌ Erro ao criar usuário:", err);
        return res.status(500).json({ erro: "Erro interno ao criar usuário." });
    }
}

// ====================================================
// 🔑 Login com seleção de empresa
// ====================================================
async function login(req, res) {
    try {
        const { login, senha, empresa_id } = req.body;

        if (!login || !senha || !empresa_id) {
            return res.status(400).json({
                erro: "Campos obrigatórios: login, senha e empresa_id.",
            });
        }

        // Busca o usuário (ignora case)
        const user = await usuarioRepo.buscarPorLogin(
            login.trim().toUpperCase(),
            empresa_id
        );

        if (!user) {
            return res.status(401).json({ erro: "Usuário ou senha inválidos." });
        }

        const valida = await bcrypt.compare(senha, user.senha);
        if (!valida) {
            return res.status(401).json({ erro: "Usuário ou senha inválidos." });
        }

        // 🔑 Gera token com empresa_id escolhido
        const token = jwt.sign(
            {
                id: user.id,
                nome: user.nome,
                empresa_id, // 👈 incluído no token
            },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        return res.json({
            mensagem: "Login realizado com sucesso.",
            token,
            usuario: {
                id: user.id,
                nome: user.nome,
                login: user.login,
                empresa_id,
            },
        });
    } catch (err) {
        console.error("❌ Erro no login:", err.message);
        return res.status(500).json({ erro: "Erro interno ao realizar login." });
    }
}

// ====================================================
// 📋 Listar (com filtro)
// ====================================================
async function listar(req, res) {
    try {
        const empresa_id = req.user?.empresa_id || 1;
        const filtro = req.query.filtro || "";
        const usuarios = await usuarioRepo.listar(empresa_id, filtro);
        return res.json(usuarios);
    } catch (err) {
        console.error("❌ Erro ao listar:", err);
        return res.status(500).json({ erro: "Erro interno ao listar usuários." });
    }
}

// ====================================================
// ✏️ Atualizar nome/login
// ====================================================
async function atualizar(req, res) {
    try {
        const { nome, login } = req.body;
        const usuario = await usuarioRepo.atualizar(req.params.id, {
            nome,
            login: login?.trim().toUpperCase(),
        });
        if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });
        return res.json({ mensagem: "Usuário atualizado com sucesso.", usuario });
    } catch (err) {
        return res.status(500).json({ erro: "Erro ao atualizar usuário." });
    }
}

// ====================================================
// 🔒 Alterar senha (com senha atual)
// ====================================================
async function alterarSenha(req, res) {
    try {
        const { senhaAtual, novaSenha } = req.body;
        const id = req.params.id;

        const usuario = await usuarioRepo.buscarPorId(id);
        if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });

        const valida = await bcrypt.compare(senhaAtual, usuario.senha);
        if (!valida) return res.status(401).json({ erro: "Senha atual incorreta." });

        const senha_hash = await bcrypt.hash(novaSenha, 10);
        await usuarioRepo.atualizar(id, { senha_hash });
        return res.json({ mensagem: "Senha alterada com sucesso." });
    } catch (err) {
        return res.status(500).json({ erro: "Erro ao alterar senha." });
    }
}

// ====================================================
// 🗑️ Excluir lógico
// ====================================================
async function excluir(req, res) {
    try {
        const usuario = await usuarioRepo.excluir(req.params.id);
        if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });
        return res.json({ mensagem: "Usuário excluído com sucesso." });
    } catch (err) {
        return res.status(500).json({ erro: "Erro ao excluir usuário." });
    }
}

// ====================================================
// 📦 Exportação
// ====================================================
module.exports = {
    criar,
    login,
    listar,
    atualizar,
    alterarSenha,
    excluir,
};
