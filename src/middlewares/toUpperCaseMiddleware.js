// ====================================================
// 🔠 Middleware: Converter strings para CAIXA ALTA (inteligente)
// ====================================================
// Este middleware percorre todos os campos do corpo da requisição (req.body)
// e transforma os textos em MAIÚSCULAS, com exceção de campos sensíveis
// como senha, e-mails e URLs.
// ====================================================

module.exports = (req, res, next) => {
    if (req.body && typeof req.body === "object") {
        const camposIgnorados = [
            "senha",
            "senha_hash",
            "password",
            "email",
            "e_mail",
            "url",
            "logo",
            "logo_url",
            "imagem",
            "foto",
            "path"
        ];

        for (const key in req.body) {
            const valor = req.body[key];

            // Ignora campos nulos, arrays, objetos e os da lista acima
            if (
                typeof valor !== "string" ||
                camposIgnorados.includes(key.toLowerCase())
            ) {
                continue;
            }

            // Converte texto comum para caixa alta
            req.body[key] = valor.toUpperCase();
        }
    }

    next();
};
