// ====================================================
// 🧩 Histerese ERP - Controller: Grupos (com logs)
// ====================================================

const grupoRepo = require("../repositories/grupoRepo");
const { registrarLog } = require("../repositories/logRepo");

module.exports = {
    // 📋 LISTAR TODOS OS GRUPOS
    async listar(req, res, next) {
        try {
            const { search, status, page, limit } = req.query;
            const grupos = await grupoRepo.listar({ search, status, page, limit });
            res.status(200).json(grupos);
        } catch (err) {
            next(err);
        }
    },

    // 🔍 OBTER GRUPO POR ID
    async obter(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) return res.status(400).json({ erro: "ID inválido" });

            const grupo = await grupoRepo.obterPorId(id);
            if (!grupo) return res.status(404).json({ erro: "Grupo não encontrado" });

            res.status(200).json(grupo);
        } catch (err) {
            next(err);
        }
    },

    // ➕ CRIAR NOVO GRUPO
    async criar(req, res, next) {
        try {
            const { nome } = req.body;
            if (!nome || !nome.trim()) return res.status(400).json({ erro: "O campo 'nome' é obrigatório." });

            const novo = await grupoRepo.criar({ nome });

            // 🧾 LOG DE CRIAÇÃO
            try {
                await registrarLog({
                    usuario_id: req.user?.id,
                    empresa_id: req.user?.empresa_id,
                    acao: "CRIAR",
                    tabela: "grupos",
                    registro_id: novo.id,
                    descricao: `Grupo '${nome}' criado com sucesso.`,
                    ip: req.ip,
                });
            } catch (logErr) {
                console.error("⚠️ Falha ao registrar log de criação de grupo:", logErr.message);
            }

            res.status(201).json({ mensagem: "Grupo criado com sucesso", grupo: novo });
        } catch (err) {
            next(err);
        }
    },

    // ✏️ ATUALIZAR GRUPO
    async atualizar(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) return res.status(400).json({ erro: "ID inválido" });

            const { nome, status } = req.body;
            if (nome !== undefined && !nome.trim())
                return res.status(400).json({ erro: "O campo 'nome' não pode ser vazio." });

            const atualizado = await grupoRepo.atualizar(id, { nome, status });
            if (!atualizado) return res.status(404).json({ erro: "Grupo não encontrado" });

            // 🧾 LOG DE ATUALIZAÇÃO
            try {
                await registrarLog({
                    usuario_id: req.user?.id,
                    empresa_id: req.user?.empresa_id,
                    acao: "EDITAR",
                    tabela: "grupos",
                    registro_id: id,
                    descricao: `Grupo '${nome || id}' atualizado.`,
                    ip: req.ip,
                });
            } catch (logErr) {
                console.error("⚠️ Falha ao registrar log de atualização de grupo:", logErr.message);
            }

            res.status(200).json({ mensagem: "Grupo atualizado com sucesso", grupo: atualizado });
        } catch (err) {
            next(err);
        }
    },

    // 🚫 EXCLUSÃO LÓGICA
    async excluir(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) return res.status(400).json({ erro: "ID inválido" });

            const excluido = await grupoRepo.excluir(id);
            if (!excluido) return res.status(404).json({ erro: "Grupo não encontrado" });

            // 🧾 LOG DE EXCLUSÃO
            try {
                await registrarLog({
                    usuario_id: req.user?.id,
                    empresa_id: req.user?.empresa_id,
                    acao: "EXCLUIR",
                    tabela: "grupos",
                    registro_id: id,
                    descricao: `Grupo '${id}' marcado como inativo.`,
                    ip: req.ip,
                });
            } catch (logErr) {
                console.error("⚠️ Falha ao registrar log de exclusão de grupo:", logErr.message);
            }

            res.status(200).json({ mensagem: "Grupo inativado com sucesso", grupo: excluido });
        } catch (err) {
            next(err);
        }
    },
};
