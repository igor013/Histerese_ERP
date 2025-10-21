// ====================================================
// 🔐 Histerese ERP - Auth Controller (multiempresa)
// ====================================================

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

// ====================================================
// 🧩 LOGIN
// ====================================================

async function login(req, res, next) {
    try {
        const { login, senha, empresa_id } = req.body;

        if (!login || !senha || !empresa_id) {
            return res.status(400).json({ erro: "Login, senha e empresa são obrigatórios." });
        }

        // Verifica usuário e empresa
        const { rows } = await db.query(
            "SELECT * FROM usuarios WHERE UPPER(login) = UPPER($1) AND empresa_id = $2 AND status = 'ativo'",
            [login, empresa_id]
        );

        const usuario = rows[0];
        if (!usuario) {
            return res.status(404).json({ erro: "Usuário não encontrado nesta empresa." });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ erro: "Senha incorreta." });
        }

        // Gera token com empresa_id
        const token = jwt.sign(
            {
                id: usuario.id,
                nome: usuario.nome,
                empresa_id: usuario.empresa_id,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES || "8h" }
        );

        res.status(200).json({
            mensagem: "Login realizado com sucesso!",
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                empresa_id: usuario.empresa_id,
            },
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { login };
