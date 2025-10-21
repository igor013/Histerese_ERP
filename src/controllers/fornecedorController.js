const fornecedorRepo = require("../repositories/fornecedorRepo");

// Criar fornecedor
async function criar(req, res) {
    try {
        // 🔐 Pega o empresa_id diretamente do token JWT
        const empresa_id = req.user.empresa_id;

        const data = await fornecedorRepo.criar({ ...req.body, empresa_id });
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

// Listar fornecedores
async function listar(req, res) {
    try {
        const empresa_id = req.user.empresa_id;
        const data = await fornecedorRepo.listar(empresa_id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

// Buscar fornecedor por ID
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

// Atualizar fornecedor
async function atualizar(req, res) {
    try {
        const empresa_id = req.user.empresa_id;
        const data = await fornecedorRepo.atualizar(req.params.id, { ...req.body, empresa_id });
        if (!data) return res.status(404).json({ erro: "Fornecedor não encontrado" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

// Exclusão lógica
async function excluir(req, res) {
    try {
        const empresa_id = req.user.empresa_id;
        const data = await fornecedorRepo.excluir(req.params.id, empresa_id);
        if (!data) return res.status(404).json({ erro: "Fornecedor não encontrado" });
        res.json({ message: "Fornecedor excluído com sucesso", fornecedor: data });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir };
