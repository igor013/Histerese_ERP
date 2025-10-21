// ====================================================
// 🧠 Histerese ERP - Servidor Principal
// ====================================================
// Estrutura:
//   📦 server.js (raiz)
//   📁 src/config
//   📁 src/controllers
//   📁 src/repositories
//   📁 src/routes
//   📁 src/middlewares
// ====================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ====================================================
// ⚙️ MIDDLEWARES GLOBAIS
// ====================================================
app.use(cors());
app.use(express.json());

// ====================================================
// 🔓 ROTAS PÚBLICAS (sem autenticação JWT)
// ====================================================
// Exemplo: login e registro
const authRoutes = require("./src/routes/authRoutes");
app.use("/api/auth", authRoutes);

// ====================================================
// 🔗 ROTAS PROTEGIDAS (JWT aplicado dentro dos arquivos)
// ====================================================

// Empresa
const empresaRoutes = require("./src/routes/empresaRoutes");
app.use("/api/empresas", empresaRoutes);

// Usuários
const usuarioRoutes = require("./src/routes/usuarioRoutes");
app.use("/api/usuarios", usuarioRoutes);

// Clientes
const clienteRoutes = require("./src/routes/clienteRoutes");
app.use("/api/clientes", clienteRoutes);

// Produtos
const produtoRoutes = require("./src/routes/produtoRoutes");
app.use("/api/produtos", produtoRoutes);

// Notas fiscais
const notaRoutes = require("./src/routes/notaRoutes");
app.use("/api/notas", notaRoutes);

// Equipamentos
const equipamentoRoutes = require("./src/routes/equipamentoRoutes");
app.use("/api/equipamentos", equipamentoRoutes);

// Grupos
const grupoRoutes = require("./src/routes/grupoRoutes");
app.use("/api/grupos", grupoRoutes);

// Fornecedores
const fornecedorRoutes = require("./src/routes/fornecedorRoutes");
app.use("/api/fornecedores", fornecedorRoutes);

// Uploads (logos, arquivos etc.)
const uploadRoutes = require("./src/routes/uploadRoutes");
app.use("/api/upload", uploadRoutes);

// Backups (com JWT)
const backupRoutes = require("./src/routes/backupRoutes");
app.use("/api/backup", backupRoutes);
 
// Serviços
const servicoRoutes = require("./src/routes/servicoRoutes");
app.use("/api/servicos", servicoRoutes);



// ====================================================
// ⚙️ MIDDLEWARE GLOBAL DE ERROS
// ====================================================
const errorHandler = require("./src/middlewares/errorHandler");
app.use(errorHandler);

// ====================================================
// 🌐 SERVIR ARQUIVOS ESTÁTICOS (ex: logos)
// ====================================================
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

// ====================================================
// 🚫 ROTA PADRÃO PARA 404
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
app.listen(PORT, () => {
    console.log("===============================================");
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    console.log(`🌍 Acesse: http://localhost:${PORT}`);
    console.log("===============================================");
});
