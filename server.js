// ======================================================
// 🧠 Histerese ERP — Servidor principal (Backend Fase 2)
// ======================================================
// Suporte completo a autenticação JWT, upload de arquivos,
// manipulação de dados multiempresa e backup do banco de dados.
// ======================================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { pool } = require("./src/config/db");

// Carrega variáveis de ambiente (.env)
dotenv.config();

const app = express();

// ======================================================
// 🔧 Middlewares globais
// ======================================================
app.use(cors());
app.use(express.json());

// ✅ Torna a pasta de uploads acessível publicamente
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

// ======================================================
// 📦 Importação de rotas
// ======================================================
const empresaRoutes = require("./src/routes/empresaRoutes");
const usuarioRoutes = require("./src/routes/usuarioRoutes");
const produtoRoutes = require("./src/routes/produtoRoutes");
const notaRoutes = require("./src/routes/notaRoutes");
const clienteRoutes = require("./src/routes/clienteRoutes");
const equipamentoRoutes = require("./src/routes/equipamentoRoutes");
const fornecedorRoutes = require("./src/routes/fornecedorRoutes");
const servicoRoutes = require("./src/routes/servicoRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const authRoutes = require("./src/routes/authRoutes");
const backupRoutes = require("./src/routes/backupRoutes"); // 🧩 Novo módulo de backup

// ======================================================
// 🚀 Rotas públicas (sem autenticação)
// ======================================================
app.use("/api/auth", authRoutes);      // Login e registro
app.use("/api/upload", uploadRoutes);  // Upload de imagens/logos

// 🔹 Teste de conexão com o banco
app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({ conectado: true, hora_servidor: result.rows[0].now });
    } catch (err) {
        res.status(500).json({
            erro: "Falha ao conectar com o banco",
            detalhes: err.message,
        });
    }
});

// ======================================================
// 🔐 Middleware global de autenticação (após rotas públicas)
// ======================================================
const authMiddleware = require("./src/middlewares/authMiddleware");
app.use(authMiddleware);

// ======================================================
// 🔒 Rotas protegidas (JWT obrigatório)
// ======================================================
app.use("/api/empresas", empresaRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/notas", notaRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/equipamentos", equipamentoRoutes);
app.use("/api/fornecedores", fornecedorRoutes);
app.use("/api/servicos", servicoRoutes);

// ======================================================
// 💾 Rotas de backup
// ======================================================
// /api/backup       → Gera novo backup (sem autenticação)
// /api/backup/download → Download protegido com JWT
app.use("/api/backup", backupRoutes);

// ======================================================
// ⚠️ Middleware global de erros (sempre no fim)
// ======================================================
const errorHandler = require("./src/middlewares/errorHandler");
app.use(errorHandler);

// ======================================================
// 🏠 Rota inicial
// ======================================================
app.get("/", (req, res) => {
    res.send("✅ API Histerese ERP está rodando com autenticação global JWT...");
});

// ======================================================
// 🖥️ Inicialização do servidor
// ======================================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
    console.log(`🚀 Servidor Histerese ERP rodando na porta ${PORT}`)
);
