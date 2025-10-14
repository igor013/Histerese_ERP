const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Importa o controller principal
const notaController = require("../controllers/notaController");

// Rota para importar XML da nota fiscal (campo "file")
router.post("/import/xml", upload.single("file"), notaController.importarXml);

// Rotas já existentes de notas
router.post("/", notaController.criar);
router.get("/", notaController.listar);
router.get("/:id", notaController.buscarPorId);
router.put("/:id", notaController.atualizar);
router.delete("/:id", notaController.excluir);
router.delete("/itens/:id", notaController.excluirItem);

module.exports = router;
