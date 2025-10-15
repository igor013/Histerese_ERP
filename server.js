const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path"); // ✅ precisa disso
const { pool } = require("./src/config/db");

// Carregar variáveis de ambiente (.env)
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas principais
const empresaRoutes = require("./src/routes/empresaRoutes");
const usuarioRoutes = require("./src/routes/usuarioRoutes");
const produtoRoutes = require("./src/routes/produtoRoutes");
const notaRoutes = require("./src/routes/notaRoutes");
const clienteRoutes = require("./src/routes/clienteRoutes");
const equipamentoRoutes = require("./src/routes/equipamentoRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");
const errorHandler = require('./src/middlewares/errorHandler');

// Rotas base
app.use("/api/empresas", empresaRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/notas", notaRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/equipamentos", equipamentoRoutes);
app.use("/api/upload", uploadRoutes);
app.use(errorHandler);

// ✅ Torna a pasta de uploads acessível publicamente
app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));

// Rota inicial (teste rápido)
app.get("/", (req, res) => {
    res.send("✅ API Histerese ERP está rodando...");
});

// Testar conexão com o banco
app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({ conectado: true, hora_servidor: result.rows[0].now });
    } catch (err) {
        res.status(500).json({ erro: "Falha ao conectar com o banco", detalhes: err.message });
    }
});

// Porta e inicialização do servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
