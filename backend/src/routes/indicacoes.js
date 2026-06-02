const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/indicacaoController");

router.get("/", ctrl.listar);
router.get("/stats", ctrl.estatisticas);
router.get("/:id", ctrl.buscar);
router.post("/", ctrl.criar);
router.put("/:id", ctrl.atualizar);
router.patch("/:id/status", ctrl.atualizarStatus);
router.delete("/:id", ctrl.remover);

module.exports = router;
