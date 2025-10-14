// src/controllers/clienteController.js
const clienteRepo = require("../repositories/clienteRepo");

// Criar
async function criar(req, res) {
    try {
        const cliente = await clienteRepo.criarCliente(req.body);
        res.status(201).json(cliente);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

// Listar
async function listar(req, res) {
    try {
        const clientes = await clienteRepo.listarClientes();
        res.json(clientes);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

// Atualizar
async function atualizar(req, res) {
    try {
        const cliente = await clienteRepo.atualizarCliente(req.params.id, req.body);
        if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado" });
        res.json(cliente);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

// Excluir lógico
async function excluir(req, res) {
    try {
        const cliente = await clienteRepo.excluirCliente(req.params.id);
        if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado" });
        res.json(cliente);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

module.exports = { criar, listar, atualizar, excluir };
