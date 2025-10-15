// src/middlewares/errorHandler.js
// Middleware global de tratamento de erros do Histerese ERP

function errorHandler(err, req, res, next) {
    // Log detalhado no terminal (útil para debug)
    console.error("🔥 Erro capturado pelo middleware:", {
        message: err.message,
        stack: err.stack,
        rota: req.originalUrl,
        metodo: req.method,
    });

    // Status padrão: 500 (erro interno)
    const status = err.status || 500;

    // Retorno padronizado em JSON
    res.status(status).json({
        erro: err.message || "Erro interno do servidor",
        status,
    });
}

module.exports = errorHandler;
