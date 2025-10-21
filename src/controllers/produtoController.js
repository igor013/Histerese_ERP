// ====================================================
// 🧾 Histerese ERP - Controller: Produtos (com logs)
// ====================================================

const produtoRepo = require("../repositories/produtoRepo");
const { registrarLog } = require("../repositories/logRepo");

// ➕ Criar produto
async function criar(req, res) {
    try {
        const produto = await produtoRepo.criar(req.body);

        // 🧾 LOG DE CRIAÇÃO
        try {
            await registrarLog({
                usuario_id: req.user?.id,
                empresa_id: req.user?.empresa_id,
                acao: "CRIAR",
                tabela: "produtos",
                registro_id: produto.id,
                descricao: `Produto '${produto.nome}' criado com sucesso.`,
                ip: req.ip,
            });
        } catch (logErr) {
            console.error("⚠️ Falha ao registrar log de criação de produto:", logErr.message);
        }

        res.status(201).json(produto);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

// 📋 Listar produtos
async function listar(req, res) {
    try {
        const produtos = await produtoRepo.listar();
        res.json(produtos);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

// 🔍 Buscar produto por ID
async function buscarPorId(req, res) {
    try {
        const produto = await produtoRepo.buscarPorId(req.params.id);
        if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });
        res.json(produto);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

// ✏️ Atualizar produto
async function atualizar(req, res) {
    try {
        const produto = await produtoRepo.atualizar(req.params.id, req.body);
        if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });

        // 🧾 LOG DE ATUALIZAÇÃO
        try {
            await registrarLog({
                usuario_id: req.user?.id,
                empresa_id: req.user?.empresa_id,
                acao: "EDITAR",
                tabela: "produtos",
                registro_id: req.params.id,
                descricao: `Produto '${produto.nome}' atualizado.`,
                ip: req.ip,
            });
        } catch (logErr) {
            console.error("⚠️ Falha ao registrar log de atualização de produto:", logErr.message);
        }

        res.json(produto);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

// 🗑️ Exclusão lógica de produto
async function excluir(req, res) {
    try {
        const produto = await produtoRepo.excluir(req.params.id);
        if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });

        // 🧾 LOG DE EXCLUSÃO
        try {
            await registrarLog({
                usuario_id: req.user?.id,
                empresa_id: req.user?.empresa_id,
                acao: "EXCLUIR",
                tabela: "produtos",
                registro_id: req.params.id,
                descricao: `Produto '${produto.nome}' marcado como inativo.`,
                ip: req.ip,
            });
        } catch (logErr) {
            console.error("⚠️ Falha ao registrar log de exclusão de produto:", logErr.message);
        }

        res.json(produto);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir };
