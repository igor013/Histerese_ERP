const jwt = require("jsonwebtoken");

// ======================================================
// 🔐 MIDDLEWARE GLOBAL DE AUTENTICAÇÃO JWT
// ======================================================
module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: "Token não fornecido" });
    }

    const [, token] = authHeader.split(" ");

    try {
        // Decodifica o token e armazena no req.user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contém: id, login, nome, empresa_id
        next();
    } catch (err) {
        return res.status(401).json({ erro: "Token inválido ou expirado" });
    }
};
