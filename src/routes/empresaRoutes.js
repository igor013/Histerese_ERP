// routes/empresaRoutes.js
// Rotas do módulo Empresa — compatíveis com o controller revisado

const express = require("express");
const router = express.Router();
const empresaController = require("../controllers/empresaController");

// Criar nova empresa
router.post("/", empresaController.criar);

// Listar empresas com paginação e busca (GET /empresa?page=1&limit=20&q=texto)
router.get("/", empresaController.listar);

// Obter empresa específica por ID
router.get("/:id", empresaController.obterPorId);

// Atualizar dados da empresa
router.put("/:id", empresaController.atualizar);

// Exclusão lógica (soft delete)
router.delete("/:id", empresaController.remover);

module.exports = router;