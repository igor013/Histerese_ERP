// src/controllers/clienteController.js
const repo = require("../repositories/clienteRepo");
const { registrarLog } = require("../repositories/logRepo");

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
                        .json({ message: "Valor inválido para 'tipo_pessoa'. Use 'F' ou 'J'." });
                }
            }

            // Normaliza CPF/CNPJ (mantendo apenas números)
            if (body.cpf_cnpj) body.cpf_cnpj = body.cpf_cnpj.replace(/\D/g, "");

            const novo = await repo.criarCliente(body);

            // 🧾 REGISTRA LOG DE CRIAÇÃO
            try {
                await registrarLog({
                    usuario_id: req.user?.id,
                    empresa_id: req.user?.empresa_id,
                    acao: "CRIAR",
                    tabela: "clientes",
                    registro_id: novo.id,
                    descricao: `Cliente ${novo.nome} criado com sucesso.`,
                    ip: req.ip,
                });
            } catch (logErr) {
                console.error("⚠️ Falha ao registrar log de criação de cliente:", logErr.message);
            }

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

            if (!body?.nome) {
                return res.status(400).json({ message: "O campo 'nome' é obrigatório." });
            }

            if (body?.tipo_pessoa) {
                const tipo = body.tipo_pessoa.toString().trim().toUpperCase();
                if (["F", "FISICA", "FÍSICA"].includes(tipo)) {
                    body.tipo_pessoa = "F";
                } else if (["J", "JURIDICA", "JURÍDICA"].includes(tipo)) {
                    body.tipo_pessoa = "J";
                } else {
                    return res
                        .status(400)
                        .json({ message: "Valor inválido para 'tipo_pessoa'. Use 'F' ou 'J'." });
                }
            }

            if (body.cpf_cnpj) body.cpf_cnpj = body.cpf_cnpj.replace(/\D/g, "");

            const atualizado = await repo.atualizarCliente(id, body);
            if (!atualizado)
                return res.status(404).json({ message: "Cliente não encontrado ou excluído." });

            // 🧾 LOG DE ATUALIZAÇÃO
            try {
                await registrarLog({
                    usuario_id: req.user?.id,
                    empresa_id: req.user?.empresa_id,
                    acao: "EDITAR",
                    tabela: "clientes",
                    registro_id: id,
                    descricao: `Cliente ${id} atualizado.`,
                    ip: req.ip,
                });
            } catch (logErr) {
                console.error("⚠️ Falha ao registrar log de atualização:", logErr.message);
            }

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
                        .json({ message: "Valor inválido para 'tipo_pessoa'. Use 'F' ou 'J'." });
                }
            }

            if (body.cpf_cnpj) body.cpf_cnpj = body.cpf_cnpj.replace(/\D/g, "");

            const atualizado = await repo.patchCliente(id, body);
            if (!atualizado) return res.status(404).json({ message: "Cliente não encontrado." });

            // 🧾 LOG PATCH
            try {
                await registrarLog({
                    usuario_id: req.user?.id,
                    empresa_id: req.user?.empresa_id,
                    acao: "EDITAR",
                    tabela: "clientes",
                    registro_id: id,
                    descricao: "Atualização parcial de cliente.",
                    ip: req.ip,
                });
            } catch (logErr) {
                console.error("⚠️ Falha ao registrar log PATCH:", logErr.message);
            }

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

            // 🧾 LOG DE EXCLUSÃO
            try {
                await registrarLog({
                    usuario_id: req.user?.id,
                    empresa_id: req.user?.empresa_id,
                    acao: "EXCLUIR",
                    tabela: "clientes",
                    registro_id: id,
                    descricao: `Cliente ${id} marcado como inativo.`,
                    ip: req.ip,
                });
            } catch (logErr) {
                console.error("⚠️ Falha ao registrar log de exclusão:", logErr.message);
            }

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

            // 🧾 LOG DE REATIVAÇÃO
            try {
                await registrarLog({
                    usuario_id: req.user?.id,
                    empresa_id: req.user?.empresa_id,
                    acao: "REATIVAR",
                    tabela: "clientes",
                    registro_id: id,
                    descricao: `Cliente ${id} restaurado.`,
                    ip: req.ip,
                });
            } catch (logErr) {
                console.error("⚠️ Falha ao registrar log de restauração:", logErr.message);
            }

            res.json({ message: "Cliente restaurado com sucesso.", cliente: restaurado });
        } catch (err) {
            console.error(err);
            next(err);
        }
    },
};
