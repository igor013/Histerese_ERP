// ====================================================
// 🧠 Histerese ERP - Servidor Principal (Versão Final)
// ====================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./src/config/db");
const errorHandler = require("./src/middlewares/errorHandler");
const verificarToken = require("./src/middlewares/authMiddleware");

const app = express();

// ====================================================
// ⚙️ MIDDLEWARES GLOBAIS
// ====================================================
app.use(cors());
app.use(express.json());

// ====================================================
// 🌐 SERVIR ARQUIVOS ESTÁTICOS
// ====================================================
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

// ====================================================
// 🔓 ROTAS PÚBLICAS
// ====================================================
app.get("/", (req, res) => {
    res.json({
        status: "✅ Servidor ativo",
        versao: "2.0",
        autor: "Igor Henrique",
    });
});

// Rota pública de autenticação
app.use("/api/auth", require("./src/routes/authRoutes"));

// ====================================================
// 🔐 ROTAS PROTEGIDAS (JWT)
// ====================================================
app.use(verificarToken);

// 🔹 Módulos principais
app.use("/api/empresas", require("./src/routes/empresaRoutes"));
app.use("/api/usuarios", require("./src/routes/usuarioRoutes"));
app.use("/api/clientes", require("./src/routes/clienteRoutes"));
app.use("/api/produtos", require("./src/routes/produtoRoutes"));
app.use("/api/notas", require("./src/routes/notaRoutes"));
app.use("/api/equipamentos", require("./src/routes/equipamentoRoutes"));
app.use("/api/grupos", require("./src/routes/grupoRoutes"));
app.use("/api/fornecedores", require("./src/routes/fornecedorRoutes"));
app.use("/api/upload", require("./src/routes/uploadRoutes"));
app.use("/api/backup", require("./src/routes/backupRoutes"));
app.use("/api/servicos", require("./src/routes/servicoRoutes"));
app.use("/api/logs", require("./src/routes/logRoutes")); // 🧾 Módulo de Logs

// ====================================================
// ⚙️ MIDDLEWARE GLOBAL DE ERROS
// ====================================================
app.use(errorHandler);

// ====================================================
// 🚫 ROTA PADRÃO 404
// ====================================================
app.use((req, res) => {
    res.status(404).json({
        erro: "Rota não encontrada",
        caminho: req.originalUrl,
        metodo: req.method,
    });
});

// ====================================================
// 🚀 INICIALIZAÇÃO DO SERVIDOR
// ====================================================
const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
    try {
        await db.connect();
        console.log("===============================================");
        console.log(`✅ Servidor rodando na porta ${PORT}`);
        console.log(`🌍 Acesse: http://localhost:${PORT}`);
        console.log("===============================================");
        console.log("✅ Conectado ao PostgreSQL com sucesso");
    } catch (error) {
        console.error("❌ Erro ao conectar ao banco de dados:", error.message);
        process.exit(1);
    }
});
