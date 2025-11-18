// src/middlewares/auth.js
const jwt = require("jsonwebtoken");

/**
 * Middleware de autenticação:
 * - Se houver Authorization: Bearer <token> e JWT_SECRET -> valida e popula req.user.
 * - Se NÃO houver token:
 *    - Se ALLOW_INSECURE_NOAUTH === 'true' -> usa fallback com empresa_id do DEFAULT_EMPRESA_ID.
 *    - Senão -> 401.
 *
 * Variáveis de ambiente úteis:
 *  - JWT_SECRET=algumseguro
 *  - ALLOW_INSECURE_NOAUTH=true   (apenas DEV!)
 *  - DEFAULT_EMPRESA_ID=1
 */
module.exports = (req, res, next) => {
    try {
        const auth = req.headers["authorization"] || "";
        const hasBearer = auth.startsWith("Bearer ");
        const secret = process.env.JWT_SECRET;

        if (hasBearer && secret) {
            const token = auth.substring("Bearer ".length);
            try {
                const decoded = jwt.verify(token, secret);

                // Suporte a diferentes formatos de payload:
                // - { id, login, empresa_id, ... }
                // - { user: { id, login, empresa_id, ... } }
                const user = decoded?.user || decoded;
                if (!user?.empresa_id) {
                    // Sem empresa_id no token? Se permitido, usa fallback; senão 401.
                    if (process.env.ALLOW_INSECURE_NOAUTH === "true") {
                        req.user = {
                            id: user?.id ?? null,
                            login: user?.login ?? "DEV",
                            empresa_id: Number(process.env.DEFAULT_EMPRESA_ID || 1),
                        };
                        return next();
                    }
                    return res.status(401).json({ erro: "Token inválido: empresa_id ausente." });
                }

                req.user = {
                    id: user.id ?? null,
                    login: user.login ?? null,
                    empresa_id: Number(user.empresa_id),
                };
                return next();
            } catch (err) {
                // Token presente mas inválido
                if (process.env.ALLOW_INSECURE_NOAUTH === "true") {
                    req.user = {
                        id: null,
                        login: "DEV",
                        empresa_id: Number(process.env.DEFAULT_EMPRESA_ID || 1),
                    };
                    return next();
                }
                return res.status(401).json({ erro: "Token inválido." });
            }
        }

        // Sem token:
        if (process.env.ALLOW_INSECURE_NOAUTH === "true") {
            req.user = {
                id: null,
                login: "DEV",
                empresa_id: Number(process.env.DEFAULT_EMPRESA_ID || 1),
            };
            return next();
        }

        return res.status(401).json({ erro: "Não autorizado." });
    } catch (err) {
        console.error("Erro no auth middleware:", err);
        return res.status(500).json({ erro: "Erro de autenticação." });
    }
};
