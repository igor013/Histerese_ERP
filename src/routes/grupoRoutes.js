const express = require("express");
const router = express.Router();
const grupoController = require("../controllers/grupoController");

router.post("/", grupoController.criar);
router.get("/", grupoController.listar);
router.get("/:id", grupoController.buscarPorId);
router.put("/:id", grupoController.atualizar);
router.delete("/:id", grupoController.excluir);

module.exports = router;
