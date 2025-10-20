// ====================================================
// 🧩 CONTROLLER: EMPRESA
// ====================================================
// Responsável por receber as requisições, validar dados
// e chamar o repositório (empresaRepo.js)
// ====================================================

const empresaRepo = require("../repositories/empresaRepo");

// ====================================================
// 📋 LISTAR TODAS AS EMPRESAS
// ====================================================
async function listar(req, res) {
    try {
        const empresas = await empresaRepo.listar();
        return res.json(empresas);
    } catch (err) {
        console.error("Erro ao listar empresas:", err);
        return res.status(500).json({ erro: "Erro interno ao listar empresas" });
    }
}

// ====================================================
// 🔍 BUSCAR EMPRESA POR ID
// ====================================================
async function buscarPorId(req, res) {
    try {
        const { id } = req.params;
        const empresa = await empresaRepo.buscarPorId(id);

        if (!empresa) {
            return res.status(404).json({ erro: "Empresa não encontrada" });
        }

        return res.json(empresa);
    } catch (err) {
        console.error("Erro ao buscar empresa:", err);
        return res.status(500).json({ erro: "Erro interno ao buscar empresa" });
    }
}

// ====================================================
// 🏢 CRIAR NOVA EMPRESA
// ====================================================
async function criar(req, res) {
    try {
        const {
            razao_social,
            nome_fantasia,
            cnpj,
            inscricao_estadual,
            email,
            telefone,
            rua,
            numero,
            bairro,
            cidade,
            uf,
            cep,
            tipo,
            matriz_id,
            logo_url
        } = req.body;

        // 🔒 Validação dos campos obrigatórios
        if (!razao_social || razao_social.trim() === "") {
            return res.status(400).json({ erro: "O campo 'razao_social' é obrigatório." });
        }

        // 🔍 Se quiser, pode validar CNPJ ou email aqui também
        const dados = {
            razao_social: razao_social.trim(),
            nome_fantasia: nome_fantasia || null,
            cnpj: cnpj || null,
            inscricao_estadual: inscricao_estadual || null,
            email: email || null,
            telefone: telefone || null,
            rua: rua || null,
            numero: numero || null,
            bairro: bairro || null,
            cidade: cidade || null,
            uf: uf || null,
            cep: cep || null,
            tipo: tipo || "Matriz",
            matriz_id: matriz_id || null,
            logo_url: logo_url || null
        };

        const nova = await empresaRepo.criar(dados);
        return res.status(201).json({
            mensagem: "Empresa criada com sucesso",
            empresa: nova
        });
    } catch (err) {
        console.error("Erro ao criar empresa:", err);
        return res.status(500).json({
            erro: "Erro interno ao criar empresa",
            detalhes: err.message
        });
    }
}

// ====================================================
// ✏️ ATUALIZAR EMPRESA
// ====================================================
async function atualizar(req, res) {
    try {
        const { id } = req.params;
        const dados = req.body;

        const existente = await empresaRepo.buscarPorId(id);
        if (!existente) {
            return res.status(404).json({ erro: "Empresa não encontrada" });
        }

        const atualizada = await empresaRepo.atualizar(id, dados);
        return res.json({
            mensagem: "Empresa atualizada com sucesso",
            empresa: atualizada
        });
    } catch (err) {
        console.error("Erro ao atualizar empresa:", err);
        return res.status(500).json({ erro: "Erro interno ao atualizar empresa" });
    }
}

// ====================================================
// 🗑️ EXCLUSÃO LÓGICA
// ====================================================
async function excluir(req, res) {
    try {
        const { id } = req.params;
        const empresa = await empresaRepo.excluir(id);

        if (!empresa) {
            return res.status(404).json({ erro: "Empresa não encontrada" });
        }

        return res.json({
            mensagem: "Empresa excluída com sucesso",
            empresa
        });
    } catch (err) {
        console.error("Erro ao excluir empresa:", err);
        return res.status(500).json({ erro: "Erro interno ao excluir empresa" });
    }
}

// ====================================================
// 🔁 REATIVAR EMPRESA
// ====================================================
async function reativar(req, res) {
    try {
        const { id } = req.params;
        const empresa = await empresaRepo.reativar(id);

        if (!empresa) {
            return res.status(404).json({ erro: "Empresa não encontrada" });
        }

        return res.json({
            mensagem: "Empresa reativada com sucesso",
            empresa
        });
    } catch (err) {
        console.error("Erro ao reativar empresa:", err);
        return res.status(500).json({ erro: "Erro interno ao reativar empresa" });
    }
}

// ====================================================
// 🧩 EXPORTAÇÃO DO MÓDULO
// ====================================================
module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    excluir,
    reativar
};
