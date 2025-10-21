// ====================================================
// 🧾 ROTAS: NOTAS FISCAIS
// ====================================================
// Define os endpoints relacionados à tabela "notas"
// Todas as rotas exigem autenticação JWT
// ====================================================

const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const notaController = require("../controllers/notaController");
const authMiddleware = require("../middlewares/authMiddleware");

// ====================================================
// 🔒 Middleware global de autenticação
// ====================================================
router.use(authMiddleware);

// ====================================================
// 🧩 ROTAS
// ====================================================

// Importar XML da nota fiscal
// POST /api/notas/import/xml
router.post("/import/xml", upload.single("file"), notaController.importarXml);

// Criar nova nota
// POST /api/notas
router.post("/", notaController.criar);

// Listar notas
// GET /api/notas
router.get("/", notaController.listar);

// Buscar nota por ID
// GET /api/notas/:id
router.get("/:id", notaController.buscarPorId);

// Atualizar nota
// PUT /api/notas/:id
router.put("/:id", notaController.atualizar);

// Excluir nota (exclusão lógica)
// DELETE /api/notas/:id
router.delete("/:id", notaController.excluir);

// Excluir item de nota
// DELETE /api/notas/itens/:id
router.delete("/itens/:id", notaController.excluirItem);

// ====================================================
// 📘 EXPORTAÇÃO DO MÓDULO
// ====================================================
module.exports = router;
