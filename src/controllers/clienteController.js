// src/controllers/clienteController.js
const repo = require("../repositories/clienteRepo");
const { registrarLog } = require("../repositories/logRepo");

module.exports = {
    async criar(req, res, next) {
        try {
            const body = req.body;

            if (!body?.nome) {
                return res.status(400).json({ message: "O campo 'nome' é obrigatório." });
            }

            if (!body?.tipo_pessoa) {
                return res.status(400).json({ message: "O campo 'tipo_pessoa' é obrigatório ('F' ou 'J')." });
            } else {
                const tipo = body.tipo_pessoa.toString().trim().toUpperCase();
                if (["F", "FISICA", "FÍSICA"].includes(tipo)) {
                    body.tipo_pessoa = "F";
                } else if (["J", "JURIDICA", "JURÍDICA"].includes(tipo)) {
                    body.tipo_pessoa = "J";
                } else {
                    return res.status(400).json({ message: "Valor inválido para 'tipo_pessoa'." });
                }
            }

            if (body.cpf_cnpj) body.cpf_cnpj = body.cpf_cnpj.replace(/\D/g, "");
            if (!body.cpf_cnpj) body.cpf_cnpj = null;

            const novo = await repo.criarCliente(body);

            await registrarLog({
                usuario_id: req.user?.id,
                empresa_id: req.user?.empresa_id,
                acao: "CRIAR",
                tabela: "clientes",
                registro_id: novo.id,
                descricao: `Cliente ${novo.nome} criado com sucesso.`,
                ip: req.ip,
            });

            res.status(201).json(novo);
        } catch (err) {
            console.error(err);
            next(err);
        }
    },

    async listar(req, res, next) {
        try {
            const { q, page, limit, status } = req.query;
            const data = await repo.listarClientes({
                q,
                page: Number(page) || 1,
                limit: Number(limit) || 20,
                status,
            });
            res.json(data);
        } catch (err) {
            console.error(err);
            next(err);
        }
    },

    async obter(req, res, next) {
        try {
            const { id } = req.params;
            const cliente = await repo.obterClientePorId(id);
            if (!cliente) return res.status(404).json({ message: "Cliente não encontrado." });
            res.json(cliente);
        } catch (err) {
            console.error(err);
            next(err);
        }
    },

    async atualizar(req, res, next) {
        try {
            const { id } = req.params;
            const body = req.body;

            if (!body?.nome) {
                return res.status(400).json({ message: "O campo 'nome' é obrigatório." });
            }

            if (body.cpf_cnpj) body.cpf_cnpj = body.cpf_cnpj.replace(/\D/g, "");
            if (!body.cpf_cnpj) body.cpf_cnpj = null;

            const atualizado = await repo.atualizarCliente(id, body);
            if (!atualizado)
                return res.status(404).json({ message: "Cliente não encontrado ou excluído." });

            await registrarLog({
                usuario_id: req.user?.id,
                empresa_id: req.user?.empresa_id,
                acao: "EDITAR",
                tabela: "clientes",
                registro_id: id,
                descricao: `Cliente ${id} atualizado.`,
                ip: req.ip,
            });

            res.json(atualizado);
        } catch (err) {
            console.error(err);
            next(err);
        }
    },

    async excluir(req, res, next) {
        try {
            const { id } = req.params;
            const deletado = await repo.excluirCliente(id);
            if (!deletado) return res.status(404).json({ message: "Cliente não encontrado." });

            await registrarLog({
                usuario_id: req.user?.id,
                empresa_id: req.user?.empresa_id,
                acao: "EXCLUIR",
                tabela: "clientes",
                registro_id: id,
                descricao: `Cliente ${id} marcado como inativo.`,
                ip: req.ip,
            });

            res.json({ message: "Cliente excluído com sucesso.", cliente: deletado });
        } catch (err) {
            console.error(err);
            next(err);
        }
    },
};
