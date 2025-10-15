const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ erro: "Token não fornecido" });

    const [, token] = authHeader.split(" ");

    try {
        const decoded = jwt.verify(token, jwtConfig.secret);
        req.userId = decoded.id;
        next();
    } catch {
        return res.status(401).json({ erro: "Token inválido ou expirado" });
    }
}

module.exports = authMiddleware;
