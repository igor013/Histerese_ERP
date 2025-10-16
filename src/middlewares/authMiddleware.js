// src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");

// 🔓 Rotas públicas — ignoradas pelo middleware
const rotasPublicas = [
    "/api/auth",        // login e registro
    "/api/upload",      // upload de logos/imagens
    "/api/test-db",     // teste de conexão
    "/uploads",         // acesso direto a arquivos
    "/",                // rota inicial
];

// 🧩 Middleware global de autenticação JWT
function authMiddleware(req, res, next) {
    const path = req.path.toLowerCase();

    // Verifica se a rota começa com alguma rota pública
    const isPublic = rotasPublicas.some((rota) => path.startsWith(rota));
    if (isPublic) {
        return next();
    }

    // Captura o token no header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ erro: "Token não fornecido" });
    }

    // Aceita tokens com ou sem o prefixo "Bearer "
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

    try {
        const decoded = jwt.verify(token, jwtConfig.secret);
        req.userId = decoded.id; // adiciona o id do usuário à requisição
        next();
    } catch (err) {
        console.error("❌ Erro de autenticação JWT:", err.message);
        return res.status(401).json({ erro: "Token inválido ou expirado" });
    }
}

module.exports = authMiddleware;
