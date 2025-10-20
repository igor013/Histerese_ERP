const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const usuarioRepo = require("../repositories/usuarioRepo");

// ======================================================
// 🔑 LOGIN DE USUÁRIO
// ======================================================
async function login(req, res) {
    try {
        const { login, senha } = req.body;

        if (!login || !senha) {
            return res.status(400).json({ erro: "Login e senha são obrigatórios" });
        }

        // Busca o usuário no banco (login é case-insensitive)
        const usuario = await usuarioRepo.buscarPorLogin(login.toUpperCase());
        if (!usuario) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        if (usuario.status !== "ativo") {
            return res.status(403).json({ erro: "Usuário inativo ou bloqueado" });
        }

        // Verifica a senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ erro: "Senha incorreta" });
        }

        // Gera o token JWT com informações completas do usuário
        const token = jwt.sign(
            {
                id: usuario.id,
                login: usuario.login,
                nome: usuario.nome,
                empresa_id: usuario.empresa_id,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES }
        );

        res.json({
            mensagem: "Login realizado com sucesso!",
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                login: usuario.login,
                empresa_id: usuario.empresa_id,
            },
        });
    } catch (err) {
        console.error("Erro no login:", err);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
}

// ======================================================
// 🧍 REGISTRO DE NOVO USUÁRIO (opcional, se já implementado)
// ======================================================
async function registrar(req, res) {
    try {
        const { nome, login, senha, empresa_id } = req.body;

        if (!nome || !login || !senha) {
            return res.status(400).json({ erro: "Campos obrigatórios: nome, login e senha" });
        }

        const existente = await usuarioRepo.buscarPorLogin(login.toUpperCase());
        if (existente) {
            return res.status(400).json({ erro: "Login já está em uso" });
        }

        const senhaHash = await bcrypt.hash(senha, 10);
        const novoUsuario = await usuarioRepo.criar({
            nome,
            login: login.toUpperCase(),
            senha: senhaHash,
            empresa_id,
        });

        res.status(201).json({
            mensagem: "Usuário registrado com sucesso",
            usuario: {
                id: novoUsuario.id,
                nome: novoUsuario.nome,
                login: novoUsuario.login,
                empresa_id: novoUsuario.empresa_id,
            },
        });
    } catch (err) {
        console.error("Erro ao registrar usuário:", err);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
}

module.exports = { login, registrar };
