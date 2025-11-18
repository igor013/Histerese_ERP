// ====================================================
// 🧩 ROTAS: GRUPOS (ERP Histerese 2.0)
// ====================================================

const express = require("express");
const router = express.Router();
const grupoController = require("../controllers/grupoController");

// ====================================================
// 📘 ROTAS
// ====================================================

// Criar grupo
router.post("/", grupoController.criar);

// Listar grupos (?q=&page=&limit=)
router.get("/", grupoController.listar);

// Buscar por ID
router.get("/:id", grupoController.buscarPorId);

// Atualizar grupo
router.put("/:id", grupoController.atualizar);

// Exclusão lógica
router.delete("/:id", grupoController.excluir);

module.exports = router;
