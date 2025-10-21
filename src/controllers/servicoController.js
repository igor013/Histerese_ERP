// ====================================================
// 🧰 Histerese ERP - Controller: Serviços / OS
// ====================================================
// Controla as operações de CRUD e filtros das ordens
// de serviço, vinculadas à empresa do usuário logado.
// ====================================================

const ServicoRepository = require("../repositories/servicoRepository");

const ServicoController = {
    // ====================================================
    // 🆕 Criar novo serviço / OS
    // ====================================================
    async criar(req, res) {
        try {
            const empresa_id = req.user?.empresa_id;
            if (!empresa_id) {
                return res.status(400).json({ erro: "empresa_id é obrigatório" });
            }

            const dados = { ...req.body, empresa_id };
            const novoServico = await ServicoRepository.criarServico(dados);
            res.status(201).json(novoServico);
        } catch (error) {
            console.error("Erro ao criar serviço:", error);
            res.status(500).json({ erro: "Erro ao criar serviço" });
        }
    },

    // ====================================================
    // 📋 Listar serviços (com paginação e busca)
    // ====================================================
    async listar(req, res) {
        try {
            const empresa_id = req.user?.empresa_id;
            const { pagina, limite, busca } = req.query;

            if (!empresa_id) {
                return res.status(400).json({ erro: "empresa_id é obrigatório" });
            }

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

    // ====================================================
    // 🔍 Buscar serviço por ID
    // ====================================================
    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const servico = await ServicoRepository.buscarServicoPorId(id);

            if (!servico) {
                return res.status(404).json({ erro: "Serviço não encontrado" });
            }

            res.json(servico);
        } catch (error) {
            console.error("Erro ao buscar serviço:", error);
            res.status(500).json({ erro: "Erro ao buscar serviço" });
        }
    },

    // ====================================================
    // ✏️ Atualizar serviço
    // ====================================================
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const dados = req.body;

            const servicoAtualizado = await ServicoRepository.atualizarServico(id, dados);

            if (!servicoAtualizado) {
                return res.status(404).json({ erro: "Serviço não encontrado" });
            }

            res.json(servicoAtualizado);
        } catch (error) {
            console.error("Erro ao atualizar serviço:", error);
            res.status(500).json({ erro: "Erro ao atualizar serviço" });
        }
    },

    // ====================================================
    // 🗑️ Excluir serviço (exclusão lógica)
    // ====================================================
    async excluir(req, res) {
        try {
            const { id } = req.params;

            const servicoExcluido = await ServicoRepository.excluirServico(id);

            if (!servicoExcluido) {
                return res.status(404).json({ erro: "Serviço não encontrado" });
            }

            res.json({ mensagem: "Serviço excluído com sucesso" });
        } catch (error) {
            console.error("Erro ao excluir serviço:", error);
            res.status(500).json({ erro: "Erro ao excluir serviço" });
        }
    },

    // ====================================================
    // 🔎 Buscar serviços por status
    // ====================================================
    async buscarPorStatus(req, res) {
        try {
            const empresa_id = req.user?.empresa_id;
            const { status } = req.query;

            if (!empresa_id || !status) {
                return res.status(400).json({ erro: "empresa_id e status são obrigatórios" });
            }

            const servicos = await ServicoRepository.buscarPorStatus(empresa_id, status);
            res.json(servicos);
        } catch (error) {
            console.error("Erro ao buscar serviços por status:", error);
            res.status(500).json({ erro: "Erro ao buscar serviços por status" });
        }
    },

    // ====================================================
    // 👥 Buscar serviços por cliente
    // ====================================================
    async buscarPorCliente(req, res) {
        try {
            const empresa_id = req.user?.empresa_id;
            const { cliente_id } = req.query;

            if (!empresa_id || !cliente_id) {
                return res.status(400).json({ erro: "empresa_id e cliente_id são obrigatórios" });
            }

            const servicos = await ServicoRepository.buscarPorCliente(empresa_id, cliente_id);
            res.json(servicos);
        } catch (error) {
            console.error("Erro ao buscar serviços por cliente:", error);
            res.status(500).json({ erro: "Erro ao buscar serviços por cliente" });
        }
    },
};

module.exports = ServicoController;
