const fornecedorBancarioRepo = require("../repositories/fornecedorBancarioRepo");
const { registrarLog } = require("../repositories/logRepo");

// Criar conta
async function criar(req, res) {
    try {
        const { fornecedor_id, banco, agencia, conta, pix, tipo_conta, observacao } = req.body;
        const novaConta = await fornecedorBancarioRepo.criar({
            fornecedor_id,
            banco,
            agencia,
            conta,
            pix,
            tipo_conta,
            observacao,
        });

        await registrarLog({
            usuario_id: req.user.id,
            empresa_id: req.user.empresa_id,
            acao: "CRIAR",
            tabela: "fornecedores_bancos",
            registro_id: novaConta.id,
            descricao: `Conta bancária adicionada ao fornecedor ${fornecedor_id}.`,
            ip: req.ip,
        });

        res.status(201).json(novaConta);
    } catch (err) {
        console.error("Erro ao criar conta bancária:", err);
        res.status(500).json({ erro: "Erro interno ao criar conta bancária." });
    }
}

// Listar
async function listar(req, res) {
    try {
        const contas = await fornecedorBancarioRepo.listar(req.params.fornecedor_id);
        res.json(contas);
    } catch (err) {
        console.error("Erro ao listar contas:", err);
        res.status(500).json({ erro: "Erro ao listar contas bancárias." });
    }
}

// Atualizar
async function atualizar(req, res) {
    try {
        const conta = await fornecedorBancarioRepo.atualizar(req.params.id, req.body);
        res.json({ mensagem: "Conta bancária atualizada.", conta });
    } catch (err) {
        console.error("Erro ao atualizar conta:", err);
        res.status(500).json({ erro: "Erro ao atualizar conta bancária." });
    }
}

// Excluir
async function excluir(req, res) {
    try {
        const conta = await fornecedorBancarioRepo.excluir(req.params.id);
        res.json({ mensagem: "Conta bancária excluída.", conta });
    } catch (err) {
        console.error("Erro ao excluir conta:", err);
        res.status(500).json({ erro: "Erro ao excluir conta bancária." });
    }
}

module.exports = { criar, listar, atualizar, excluir };
