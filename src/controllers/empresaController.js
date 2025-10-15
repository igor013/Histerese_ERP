// controllers/empresaController.js
// Controlador do módulo Empresa — revisado para validação, paginação/busca e tratamento de erros via next(err)

const empresaRepo = require("../repositories/empresaRepo");

/** Utilidades de validação básicas **/
function badRequest(message) {
    const e = new Error(message || "Requisição inválida");
    e.status = 400;
    return e;
}

function assertNome(nome) {
    if (typeof nome !== "string" || !nome.trim()) {
        throw badRequest("Campo 'nome' é obrigatório.");
    }
}

function parsePositiveInt(value, fallback) {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : fallback;
}

/**
 * POST /empresa
 * Body: { nome: string, logo_url?: string }
 */
async function criar(req, res, next) {
    try {
        const { nome, logo_url } = req.body || {};
        assertNome(nome);

        const empresa = await empresaRepo.criar({ nome: nome.trim(), logo_url });
        return res.status(201).json(empresa);
    } catch (err) {
        return next(err);
    }
}

/**
 * GET /empresa
 * Query: page?: number, limit?: number, q?: string
 */
async function listar(req, res, next) {
    try {
        const page = parsePositiveInt(req.query.page, 1);
        const limit = parsePositiveInt(req.query.limit, 20);
        const q = typeof req.query.q === "string" && req.query.q.trim() ? req.query.q.trim() : undefined;

        const empresas = await empresaRepo.listar({ page, limit, q });
        return res.json(empresas);
    } catch (err) {
        return next(err);
    }
}

/**
 * GET /empresa/:id
 */
async function obterPorId(req, res, next) {
    try {
        const { id } = req.params;
        const empresa = await empresaRepo.getById(id);
        if (!empresa) {
            return res.status(404).json({ erro: "Empresa não encontrada" });
        }
        return res.json(empresa);
    } catch (err) {
        return next(err);
    }
}

/**
 * PUT /empresa/:id
 * Body: { nome?: string, logo_url?: string, status?: 'ativo' | 'inativo' }
 */
async function atualizar(req, res, next) {
    try {
        const { id } = req.params;
        const data = { ...req.body };

        // valida apenas se vier no payload
        if (data.nome !== undefined) assertNome(data.nome);
        if (data.nome) data.nome = data.nome.trim();

        const empresa = await empresaRepo.atualizar(id, data);
        if (!empresa) {
            return res.status(404).json({ erro: "Empresa não encontrada" });
        }
        return res.json(empresa);
    } catch (err) {
        return next(err);
    }
}

/**
 * DELETE /empresa/:id (soft delete)
 */
async function remover(req, res, next) {
    try {
        const { id } = req.params;
        const empresa = await empresaRepo.softDelete(id);
        if (!empresa) {
            return res.status(404).json({ erro: "Empresa não encontrada" });
        }
        return res.json({ ok: true });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    criar,
    listar,
    obterPorId,
    atualizar,
    remover,
};
