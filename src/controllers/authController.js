// src/controllers/authController.js
const usuarioRepo = require("../repositories/usuarioRepo");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");

async function login(req, res) {
    try {
        let { login, senha } = req.body;

        if (!login || !senha) {
            return res.status(400).json({ erro: "Informe login e senha." });
        }

        // força o login para maiúsculas (consistência com o cadastro)
        const loginNormalizado = login.trim().toUpperCase();

        const usuario = await usuarioRepo.buscarPorLogin(loginNormalizado);
        if (!usuario) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        if (usuario.status === "excluido") {
            return res.status(403).json({ erro: "Usuário está inativo/excluído." });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ erro: "Senha incorreta" });
        }

        const token = jwt.sign(
            { id: usuario.id, nome: usuario.nome },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        return res.json({
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                login: usuario.login,
                status: usuario.status
            },
            token
        });
    } catch (err) {
        return res.status(500).json({ erro: err.message });
    }
}

module.exports = { login };
