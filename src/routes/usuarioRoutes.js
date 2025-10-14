const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");

// Cadastrar usuário
router.post("/", usuarioController.criar);

// Listar usuários
router.get("/", usuarioController.listar);

// Buscar por ID
router.get("/:id", usuarioController.buscarPorId);

// Atualizar
router.put("/:id", usuarioController.atualizar);

// Excluir lógico
router.delete("/:id", usuarioController.excluir);

module.exports = router;
