// ====================================================
// 🧠 Histerese ERP - Controller: Grupos
// ====================================================
// Funções: listar, obter, criar, atualizar, excluir
// ====================================================

const grupoRepo = require("../repositories/grupoRepo");

module.exports = {
    // --------------------------------------------------
    // 📋 LISTAR TODOS OS GRUPOS (com busca e paginação)
    // --------------------------------------------------
    async listar(req, res, next) {
        try {
            const { search, status, page, limit } = req.query;
            const grupos = await grupoRepo.listar({ search, status, page, limit });
            res.status(200).json(grupos);
        } catch (err) {
            next(err);
        }
    },

    // --------------------------------------------------
    // 🔍 OBTER GRUPO POR ID
    // --------------------------------------------------
    async obter(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ erro: "ID inválido" });
            }

            const grupo = await grupoRepo.obterPorId(id);
            if (!grupo) {
                return res.status(404).json({ erro: "Grupo não encontrado" });
            }

            res.status(200).json(grupo);
        } catch (err) {
            next(err);
        }
    },

    // --------------------------------------------------
    // ➕ CRIAR NOVO GRUPO
    // --------------------------------------------------
    async criar(req, res, next) {
        try {
            const { nome } = req.body;

            if (!nome || !nome.trim()) {
                return res.status(400).json({ erro: "O campo 'nome' é obrigatório." });
            }

            const novo = await grupoRepo.criar({ nome });
            res.status(201).json({
                mensagem: "Grupo criado com sucesso",
                grupo: novo,
            });
        } catch (err) {
            next(err);
        }
    },

    // --------------------------------------------------
    // ✏️ ATUALIZAR GRUPO EXISTENTE
    // --------------------------------------------------
    async atualizar(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ erro: "ID inválido" });
            }

            const { nome, status } = req.body;

            if (nome !== undefined && !nome.trim()) {
                return res.status(400).json({ erro: "O campo 'nome' não pode ser vazio." });
            }

            const atualizado = await grupoRepo.atualizar(id, { nome, status });
            if (!atualizado) {
                return res.status(404).json({ erro: "Grupo não encontrado" });
            }

            res.status(200).json({
                mensagem: "Grupo atualizado com sucesso",
                grupo: atualizado,
            });
        } catch (err) {
            next(err);
        }
    },

    // --------------------------------------------------
    // 🚫 EXCLUSÃO LÓGICA (inativar grupo)
    // --------------------------------------------------
    async excluir(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ erro: "ID inválido" });
            }

            const excluido = await grupoRepo.excluir(id);
            if (!excluido) {
                return res.status(404).json({ erro: "Grupo não encontrado" });
            }

            res.status(200).json({
                mensagem: "Grupo inativado com sucesso",
                grupo: excluido,
            });
        } catch (err) {
            next(err);
        }
    },
};
