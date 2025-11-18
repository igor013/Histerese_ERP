// src/routes/notaRoutes.js
const express = require("express");
const router = express.Router();

const notaController = require("../controllers/notaController");
const auth = require("../middlewares/authMiddleware");

// Upload XML
const multer = require("multer");

// Armazena em memória para evitar problemas de path no Windows
const upload = multer({ storage: multer.memoryStorage() });

// -------------------------------------------------------------
// ROTAS DE NOTAS FISCAIS
// -------------------------------------------------------------

// 🧾 Listar notas
router.get("/", auth, notaController.listarNotas);

// 🔎 Buscar nota (com itens)
router.get("/:id", auth, notaController.buscarNota);

// ➕ Criar nota (com itens)
router.post("/", auth, notaController.criarNota);

// ✏ Atualizar nota
router.put("/:id", auth, notaController.atualizarNota);

// 🗑 Excluir nota
router.delete("/:id", auth, notaController.excluirNota);

// -------------------------------------------------------------
// IMPORTAÇÃO DE XML
// -------------------------------------------------------------
router.post(
    "/import/xml",
    auth,
    upload.single("file"), // campo "file" vindo do front
    notaController.importarXml
);

// -------------------------------------------------------------
// ITENS DA NOTA
// -------------------------------------------------------------

// ➕ Adicionar item a uma nota
router.post("/:id/itens", auth, notaController.adicionarItem);

// ✏ Atualizar item
router.put("/itens/:itemId", auth, notaController.atualizarItem);

// 🗑 Excluir item
router.delete("/itens/:itemId", auth, notaController.excluirItem);

module.exports = router;
