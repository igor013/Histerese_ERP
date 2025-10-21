// ====================================================
// 🧠 Histerese ERP - Controller: Equipamentos (com logs)
// ====================================================

const equipamentoRepo = require("../repositories/equipamentoRepo");
const { registrarLog } = require("../repositories/logRepo");

// empresa_id fixo por enquanto
const EMPRESA_ID = 1;

function handlePgError(res, err) {
    if (err && err.code === "23505") {
        return res
            .status(409)
            .json({ error: "Conflito: já existe equipamento com este número de série para o cliente." });
    }
    return res.status(500).json({ error: "Erro interno", details: err.message });
}

module.exports = {
    // ====================================================
    // ➕ Criar equipamento
    // ====================================================
    async create(req, res) {
        try {
            const { cliente_id, tipo, marca, modelo, numero_serie, identificador, observacoes } = req.body;

            if (!tipo || String(tipo).trim() === "") {
                return res.status(400).json({ error: "Campo 'tipo' é obrigatório." });
            }

            const novo = await equipamentoRepo.create({
                empresa_id: EMPRESA_ID,
                cliente_id,
                tipo: String(tipo).trim(),
                marca,
                modelo,
                numero_serie,
                identificador,
                observacoes,
            });

            // 🧾 LOG DE CRIAÇÃO
            try {
                await registrarLog({
                    usuario_id: req.user?.id,
                    empresa_id: EMPRESA_ID,
                    acao: "CRIAR",
                    tabela: "equipamentos",
                    registro_id: novo.id,
                    descricao: `Equipamento (${tipo} - ${marca || "sem marca"}) criado para o cliente ${cliente_id || "N/A"}.`,
                    ip: req.ip,
                });
            } catch (logErr) {
                console.error("⚠️ Falha ao registrar log de criação de equipamento:", logErr.message);
            }

            return res.status(201).json(novo);
        } catch (err) {
            return handlePgError(res, err);
        }
    },

    // ====================================================
    // 📋 Listar equipamentos
    // ====================================================
    async list(req, res) {
        try {
            const { q, page, limit, cliente_id, tipo, marca, modelo, status } = req.query;

            const resultado = await equipamentoRepo.list({
                empresa_id: EMPRESA_ID,
                q,
                page,
                limit,
                cliente_id,
                tipo,
                marca,
                modelo,
                status: status || "ativo",
            });

            return res.json(resultado);
        } catch (err) {
            return res.status(500).json({ error: "Erro ao listar equipamentos", details: err.message });
        }
    },

    // ====================================================
    // 🔍 Obter equipamento por ID
    // ====================================================
    async getById(req, res) {
        try {
            const { id } = req.params;
            const equip = await equipamentoRepo.getById({ empresa_id: EMPRESA_ID, id });

            if (!equip) return res.status(404).json({ error: "Equipamento não encontrado" });
            return res.json(equip);
        } catch (err) {
            return res.status(500).json({ error: "Erro ao obter equipamento", details: err.message });
        }
    },

    // ====================================================
    // ✏️ Atualizar equipamento
    // ====================================================
    async update(req, res) {
        try {
            const { id } = req.params;
            const payload = { ...req.body };

            if (
                Object.prototype.hasOwnProperty.call(payload, "tipo") &&
                (!payload.tipo || String(payload.tipo).trim() === "")
            ) {
                return res.status(400).json({ error: "Campo 'tipo' não pode ser vazio." });
            }

            const atualizado = await equipamentoRepo.update({
                empresa_id: EMPRESA_ID,
                id,
                payload,
            });

            if (!atualizado) return res.status(404).json({ error: "Equipamento não encontrado" });

            // 🧾 LOG DE ATUALIZAÇÃO
            try {
                await registrarLog({
                    usuario_id: req.user?.id,
                    empresa_id: EMPRESA_ID,
                    acao: "EDITAR",
                    tabela: "equipamentos",
                    registro_id: id,
                    descricao: `Equipamento ${id} atualizado (${payload.tipo || "sem tipo"} - ${payload.marca || "sem marca"}).`,
                    ip: req.ip,
                });
            } catch (logErr) {
                console.error("⚠️ Falha ao registrar log de atualização de equipamento:", logErr.message);
            }

            return res.json(atualizado);
        } catch (err) {
            return handlePgError(res, err);
        }
    },

    // ====================================================
    // 🗑️ Exclusão lógica de equipamento
    // ====================================================
    async remove(req, res) {
        try {
            const { id } = req.params;
            const removido = await equipamentoRepo.softDelete({ empresa_id: EMPRESA_ID, id });

            if (!removido) return res.status(404).json({ error: "Equipamento não encontrado ou já excluído" });

            // 🧾 LOG DE EXCLUSÃO
            try {
                await registrarLog({
                    usuario_id: req.user?.id,
                    empresa_id: EMPRESA_ID,
                    acao: "EXCLUIR",
                    tabela: "equipamentos",
                    registro_id: id,
                    descricao: `Equipamento ${id} marcado como inativo.`,
                    ip: req.ip,
                });
            } catch (logErr) {
                console.error("⚠️ Falha ao registrar log de exclusão de equipamento:", logErr.message);
            }

            return res.json({ ok: true });
        } catch (err) {
            return res.status(500).json({ error: "Erro ao excluir equipamento", details: err.message });
        }
    },

    // ====================================================
    // 🔁 Restaurar equipamento
    // ====================================================
    async restore(req, res) {
        try {
            const { id } = req.params;
            const restaurado = await equipamentoRepo.restore({ empresa_id: EMPRESA_ID, id });

            if (!restaurado)
                return res.status(404).json({ error: "Equipamento não encontrado ou não está excluído" });

            // 🧾 LOG DE REATIVAÇÃO
            try {
                await registrarLog({
                    usuario_id: req.user?.id,
                    empresa_id: EMPRESA_ID,
                    acao: "REATIVAR",
                    tabela: "equipamentos",
                    registro_id: id,
                    descricao: `Equipamento ${id} restaurado.`,
                    ip: req.ip,
                });
            } catch (logErr) {
                console.error("⚠️ Falha ao registrar log de restauração de equipamento:", logErr.message);
            }

            return res.json(restaurado);
        } catch (err) {
            return res.status(500).json({ error: "Erro ao restaurar equipamento", details: err.message });
        }
    },
};
