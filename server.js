// server.js
// Servidor principal do Histerese ERP

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { pool } = require("./src/config/db");

// Carregar variáveis de ambiente (.env)
dotenv.config();

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// ✅ Torna a pasta de uploads acessível publicamente
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

// Importação de rotas
const empresaRoutes = require("./src/routes/empresaRoutes");
const usuarioRoutes = require("./src/routes/usuarioRoutes");
const produtoRoutes = require("./src/routes/produtoRoutes");
const notaRoutes = require("./src/routes/notaRoutes");
const clienteRoutes = require("./src/routes/clienteRoutes");
const equipamentoRoutes = require("./src/routes/equipamentoRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const authRoutes = require("./src/routes/authRoutes");

// Rotas base da API
app.use("/api/empresas", empresaRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/notas", notaRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/equipamentos", equipamentoRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);

// ✅ Middleware global de tratamento de erros (DEVE vir por último)
const errorHandler = require("./src/middlewares/errorHandler");
app.use(errorHandler);

// Rota inicial (teste rápido)
app.get("/", (req, res) => {
    res.send("✅ API Histerese ERP está rodando...");
});

// Rota para testar conexão com o banco
app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({ conectado: true, hora_servidor: result.rows[0].now });
    } catch (err) {
        res
            .status(500)
            .json({ erro: "Falha ao conectar com o banco", detalhes: err.message });
    }
});

// Porta e inicialização do servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
