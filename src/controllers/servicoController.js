// ====================================================
// 🧰 Histerese ERP - Controller: Serviços / OS (com logs)
// ====================================================

const ServicoRepository = require("../repositories/servicoRepository");
const { registrarLog } = require("../repositories/logRepo");

const ServicoController = {
    // 🆕 Criar novo serviço / OS
    async criar(req, res) {
        try {
            const empresa_id = req.user?.empresa_id;
            const usuario_id = req.user?.id;
            if (!empresa_id) {
                return res.status(400).json({ erro: "empresa_id é obrigatório" });
            }

            const dados = { ...req.body, empresa_id };
            const novoServico = await ServicoRepository.criarServico(dados);

            // 🧾 LOG DE CRIAÇÃO
            try {
                await registrarLog({
                    usuario_id,
                    empresa_id,
                    acao: "CRIAR",
                    tabela: "servicos",
                    registro_id: novoServico.id,
                    descricao: `Serviço/OS '${novoServico.descricao}' criado com sucesso.`,
                    ip: req.ip,
                });
            } catch (logErr) {
                console.error("⚠️ Falha ao registrar log de criação de serviço:", logErr.message);
            }

            res.status(201).json(novoServico);
        } catch (error) {
            console.error("Erro ao criar serviço:", error);
            res.status(500).json({ erro: "Erro ao criar serviço" });
        }
    },

    // 📋 Listar serviços
    async listar(req, res) {
        try {
            const empresa_id = req.user?.empresa_id;
            const { pagina, limite, busca } = req.query;
            if (!empresa_id) return res.status(400).json({ erro: "empresa_id é obrigatório" });

            const resultado = await ServicoRepository.listarServicos({
                empresa_id,
                pagina: Number(pagina) || 1,
                limite: Number(limite) || 10,
                busca: busca || "",
            });

            res.json(resultado);
        } catch (error) {
            console.error("Erro ao listar serviços:", error);
            res.status(500).json({ erro: "Erro ao listar serviços" });
        }
    },

    // 🔍 Buscar serviço por ID
    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const servico = await ServicoRepository.buscarServicoPorId(id);
            if (!servico) return res.status(404).json({ erro: "Serviço não encontrado" });
            res.json(servico);
        } catch (error) {
            console.error("Erro ao buscar serviço:", error);
            res.status(500).json({ erro: "Erro ao buscar serviço" });
        }
    },

    // ✏️ Atualizar serviço
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.user?.id;
            const empresa_id = req.user?.empresa_id;

            const servicoAtualizado = await ServicoRepository.atualizarServico(id, req.body);
            if (!servicoAtualizado) return res.status(404).json({ erro: "Serviço não encontrado" });

            // 🧾 LOG DE ATUALIZAÇÃO
            try {
                await registrarLog({
                    usuario_id,
                    empresa_id,
                    acao: "EDITAR",
                    tabela: "servicos",
                    registro_id: id,
                    descricao: `Serviço/OS ${id} atualizado.`,
                    ip: req.ip,
                });
            } catch (logErr) {
                console.error("⚠️ Falha ao registrar log de atualização de serviço:", logErr.message);
            }

            res.json(servicoAtualizado);
        } catch (error) {
            console.error("Erro ao atualizar serviço:", error);
            res.status(500).json({ erro: "Erro ao atualizar serviço" });
        }
    },

    // 🗑️ Excluir serviço (exclusão lógica)
    async excluir(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.user?.id;
            const empresa_id = req.user?.empresa_id;

            const servicoExcluido = await ServicoRepository.excluirServico(id);
            if (!servicoExcluido) return res.status(404).json({ erro: "Serviço não encontrado" });

            // 🧾 LOG DE EXCLUSÃO
            try {
                await registrarLog({
                    usuario_id,
                    empresa_id,
                    acao: "EXCLUIR",
                    tabela: "servicos",
                    registro_id: id,
                    descricao: `Serviço/OS ${id} excluído (inativado).`,
                    ip: req.ip,
                });
            } catch (logErr) {
                console.error("⚠️ Falha ao registrar log de exclusão de serviço:", logErr.message);
            }

            res.json({ mensagem: "Serviço excluído com sucesso" });
        } catch (error) {
            console.error("Erro ao excluir serviço:", error);
            res.status(500).json({ erro: "Erro ao excluir serviço" });
        }
    },

    // 🔎 Buscar serviços por status
    async buscarPorStatus(req, res) {
        try {
            const empresa_id = req.user?.empresa_id;
            const { status } = req.query;
            if (!empresa_id || !status)
                return res.status(400).json({ erro: "empresa_id e status são obrigatórios" });

            const servicos = await ServicoRepository.buscarPorStatus(empresa_id, status);
            res.json(servicos);
        } catch (error) {
            console.error("Erro ao buscar serviços por status:", error);
            res.status(500).json({ erro: "Erro ao buscar serviços por status" });
        }
    },

    // 👥 Buscar serviços por cliente
    async buscarPorCliente(req, res) {
        try {
            const empresa_id = req.user?.empresa_id;
            const { cliente_id } = req.query;
            if (!empresa_id || !cliente_id)
                return res.status(400).json({ erro: "empresa_id e cliente_id são obrigatórios" });

            const servicos = await ServicoRepository.buscarPorCliente(empresa_id, cliente_id);
            res.json(servicos);
        } catch (error) {
            console.error("Erro ao buscar serviços por cliente:", error);
            res.status(500).json({ erro: "Erro ao buscar serviços por cliente" });
        }
    },
};

module.exports = ServicoController;
