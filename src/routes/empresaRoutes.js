const express = require("express");
const router = express.Router();
const empresaController = require("../controllers/empresaController");

// Cadastrar empresa (primeiro acesso)
router.post("/", empresaController.criar);

// Listar (mesmo que tenha só uma, mas útil)
router.get("/", empresaController.listar);

// Atualizar
router.put("/:id", empresaController.atualizar);

module.exports = router;
