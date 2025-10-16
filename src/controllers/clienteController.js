// src/controllers/clienteController.js
const repo = require("../repositories/clienteRepo");

module.exports = {
    // ——— Criar cliente
    async criar(req, res, next) {
        try {
            const body = req.body;

            // validação simples
            if (!body?.nome) {
                return res.status(400).json({ message: "O campo 'nome' é obrigatório." });
            }

            // 🔒 Validação e normalização de tipo_pessoa
            if (!body?.tipo_pessoa) {
                return res.status(400).json({ message: "O campo 'tipo_pessoa' é obrigatório ('F' ou 'J')." });
            } else {
                const tipo = body.tipo_pessoa.toString().trim().toUpperCase();
                if (["F", "FISICA", "FÍSICA"].includes(tipo)) {
                    body.tipo_pessoa = "F";
                } else if (["J", "JURIDICA", "JURÍDICA"].includes(tipo)) {
                    body.tipo_pessoa = "J";
                } else {
                    return res
                        .status(400)
                        .json({ message: "Valor inválido para 'tipo_pessoa'. Use 'F' para Física ou 'J' para Jurídica." });
                }
            }

            // Normaliza CPF/CNPJ (mantendo apenas números)
            if (body.cpf_cnpj) body.cpf_cnpj = body.cpf_cnpj.replace(/\D/g, "");

            const novo = await repo.criarCliente(body);
            res.status(201).json(novo);
        } catch (err) {
            console.error(err);
            next(err);
        }
    },

    // ——— Listar clientes (com paginação e busca)
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

    // ——— Obter cliente por ID
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

    // ——— Atualizar cliente (PUT completo)
    async atualizar(req, res, next) {
        try {
            const { id } = req.params;
            const body = req.body;

            // Validação básica
            if (!body?.nome) {
                return res.status(400).json({ message: "O campo 'nome' é obrigatório." });
            }

            // 🔒 Validação e normalização de tipo_pessoa
            if (body?.tipo_pessoa) {
                const tipo = body.tipo_pessoa.toString().trim().toUpperCase();
                if (["F", "FISICA", "FÍSICA"].includes(tipo)) {
                    body.tipo_pessoa = "F";
                } else if (["J", "JURIDICA", "JURÍDICA"].includes(tipo)) {
                    body.tipo_pessoa = "J";
                } else {
                    return res
                        .status(400)
                        .json({ message: "Valor inválido para 'tipo_pessoa'. Use 'F' para Física ou 'J' para Jurídica." });
                }
            }

            if (body.cpf_cnpj) body.cpf_cnpj = body.cpf_cnpj.replace(/\D/g, "");

            const atualizado = await repo.atualizarCliente(id, body);
            if (!atualizado)
                return res.status(404).json({ message: "Cliente não encontrado ou excluído." });

            res.json(atualizado);
        } catch (err) {
            console.error(err);
            next(err);
        }
    },

    // ——— Atualização parcial (PATCH)
    async patch(req, res, next) {
        try {
            const { id } = req.params;
            const body = req.body;

            if (body?.tipo_pessoa) {
                const tipo = body.tipo_pessoa.toString().trim().toUpperCase();
                if (["F", "FISICA", "FÍSICA"].includes(tipo)) {
                    body.tipo_pessoa = "F";
                } else if (["J", "JURIDICA", "JURÍDICA"].includes(tipo)) {
                    body.tipo_pessoa = "J";
                } else {
                    return res
                        .status(400)
                        .json({ message: "Valor inválido para 'tipo_pessoa'. Use 'F' para Física ou 'J' para Jurídica." });
                }
            }

            if (body.cpf_cnpj) body.cpf_cnpj = body.cpf_cnpj.replace(/\D/g, "");

            const atualizado = await repo.patchCliente(id, body);
            if (!atualizado) return res.status(404).json({ message: "Cliente não encontrado." });
            res.json(atualizado);
        } catch (err) {
            console.error(err);
            next(err);
        }
    },

    // ——— Exclusão lógica
    async excluir(req, res, next) {
        try {
            const { id } = req.params;
            const deletado = await repo.excluirCliente(id);
            if (!deletado) return res.status(404).json({ message: "Cliente não encontrado." });
            res.json({ message: "Cliente excluído com sucesso.", cliente: deletado });
        } catch (err) {
            console.error(err);
            next(err);
        }
    },

    // ——— Restaurar cliente excluído
    async restaurar(req, res, next) {
        try {
            const { id } = req.params;
            const restaurado = await repo.restaurarCliente(id);
            if (!restaurado) return res.status(404).json({ message: "Cliente não encontrado." });
            res.json({ message: "Cliente restaurado com sucesso.", cliente: restaurado });
        } catch (err) {
            console.error(err);
            next(err);
        }
    },
};
