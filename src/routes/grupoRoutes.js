// ====================================================
// 🧠 Histerese ERP - Rotas: Grupos
// ====================================================

const express = require("express");
const router = express.Router();
const grupoController = require("../controllers/grupoController");

// Verifica se o controller foi importado corretamente
if (!grupoController || typeof grupoController.listar !== "function") {
    console.error("❌ Erro: grupoController não exporta as funções esperadas.");
}

// Rotas do módulo Grupos
router.get("/", grupoController.listar);
router.get("/:id", grupoController.obter);
router.post("/", grupoController.criar);
router.put("/:id", grupoController.atualizar);
router.delete("/:id", grupoController.excluir);

module.exports = router;
