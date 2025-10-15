// src/controllers/equipamentoController.js
const equipamentoRepo = require('../repositories/equipamentoRepo');

// empresa_id fixo por enquanto
const EMPRESA_ID = 1;

function handlePgError(res, err) {
    if (err && err.code === '23505') {
        return res.status(409).json({ error: 'Conflito: já existe equipamento com este número de série para o cliente.' });
    }
    return res.status(500).json({ error: 'Erro interno', details: err.message });
}

module.exports = {
    async create(req, res) {
        try {
            const { cliente_id, tipo, marca, modelo, numero_serie, identificador, observacoes } = req.body;

            if (!tipo || String(tipo).trim() === '') {
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

            return res.status(201).json(novo);
        } catch (err) {
            return handlePgError(res, err);
        }
    },

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
                status: status || 'ativo',
            });

            return res.json(resultado);
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao listar equipamentos', details: err.message });
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;
            const equip = await equipamentoRepo.getById({ empresa_id: EMPRESA_ID, id });

            if (!equip) return res.status(404).json({ error: 'Equipamento não encontrado' });
            return res.json(equip);
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao obter equipamento', details: err.message });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const payload = { ...req.body };

            // Se veio tipo vazio, rejeita
            if (Object.prototype.hasOwnProperty.call(payload, 'tipo') && (!payload.tipo || String(payload.tipo).trim() === '')) {
                return res.status(400).json({ error: "Campo 'tipo' não pode ser vazio." });
            }

            const atualizado = await equipamentoRepo.update({
                empresa_id: EMPRESA_ID,
                id,
                payload
            });

            if (!atualizado) return res.status(404).json({ error: 'Equipamento não encontrado' });
            return res.json(atualizado);
        } catch (err) {
            return handlePgError(res, err);
        }
    },

    async remove(req, res) {
        try {
            const { id } = req.params;
            const removido = await equipamentoRepo.softDelete({ empresa_id: EMPRESA_ID, id });
            if (!removido) return res.status(404).json({ error: 'Equipamento não encontrado ou já excluído' });
            return res.json({ ok: true });
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao excluir equipamento', details: err.message });
        }
    },

    async restore(req, res) {
        try {
            const { id } = req.params;
            const restaurado = await equipamentoRepo.restore({ empresa_id: EMPRESA_ID, id });
            if (!restaurado) return res.status(404).json({ error: 'Equipamento não encontrado ou não está excluído' });
            return res.json(restaurado);
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao restaurar equipamento', details: err.message });
        }
    },
};
