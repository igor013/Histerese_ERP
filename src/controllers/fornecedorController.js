// ====================================================
// 🧾 Histerese ERP - Controller: Fornecedores (com logs)
// ====================================================

const fornecedorRepo = require("../repositories/fornecedorRepo");
const { registrarLog } = require("../repositories/logRepo");

// ====================================================
// ➕ Criar fornecedor
// ====================================================
async function criar(req, res) {
    try {
        const empresa_id = req.user.empresa_id;
        const usuario_id = req.user.id;

        const data = await fornecedorRepo.criar({ ...req.body, empresa_id });

        // 🧾 LOG DE CRIAÇÃO
        try {
            await registrarLog({
                usuario_id,
                empresa_id,
                acao: "CRIAR",
                tabela: "fornecedores",
                registro_id: data.id,
                descricao: `Fornecedor '${data.nome}' criado com sucesso.`,
                ip: req.ip,
            });
        } catch (logErr) {
            console.error("⚠️ Falha ao registrar log de criação de fornecedor:", logErr.message);
        }

        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

// ====================================================
// 📋 Listar fornecedores
// ====================================================
async function listar(req, res) {
    try {
        const empresa_id = req.user.empresa_id;
        const data = await fornecedorRepo.listar(empresa_id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

// ====================================================
// 🔍 Buscar fornecedor por ID
// ====================================================
async function buscarPorId(req, res) {
    try {
        const empresa_id = req.user.empresa_id;
        const data = await fornecedorRepo.buscarPorId(req.params.id, empresa_id);
        if (!data) return res.status(404).json({ erro: "Fornecedor não encontrado" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

// ====================================================
// ✏️ Atualizar fornecedor
// ====================================================
async function atualizar(req, res) {
    try {
        const empresa_id = req.user.empresa_id;
        const usuario_id = req.user.id;
        const id = req.params.id;

        const data = await fornecedorRepo.atualizar(id, { ...req.body, empresa_id });
        if (!data) return res.status(404).json({ erro: "Fornecedor não encontrado" });

        // 🧾 LOG DE EDIÇÃO
        try {
            await registrarLog({
                usuario_id,
                empresa_id,
                acao: "EDITAR",
                tabela: "fornecedores",
                registro_id: id,
                descricao: `Fornecedor '${data.nome}' atualizado.`,
                ip: req.ip,
            });
        } catch (logErr) {
            console.error("⚠️ Falha ao registrar log de edição de fornecedor:", logErr.message);
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

// ====================================================
// 🗑️ Exclusão lógica de fornecedor
// ====================================================
async function excluir(req, res) {
    try {
        const empresa_id = req.user.empresa_id;
        const usuario_id = req.user.id;
        const id = req.params.id;

        const data = await fornecedorRepo.excluir(id, empresa_id);
        if (!data) return res.status(404).json({ erro: "Fornecedor não encontrado" });

        // 🧾 LOG DE EXCLUSÃO
        try {
            await registrarLog({
                usuario_id,
                empresa_id,
                acao: "EXCLUIR",
                tabela: "fornecedores",
                registro_id: id,
                descricao: `Fornecedor '${data.nome}' marcado como inativo.`,
                ip: req.ip,
            });
        } catch (logErr) {
            console.error("⚠️ Falha ao registrar log de exclusão de fornecedor:", logErr.message);
        }

        res.json({ message: "Fornecedor excluído com sucesso", fornecedor: data });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir };
