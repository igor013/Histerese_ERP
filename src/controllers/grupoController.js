const grupoRepo = require("../repositories/grupoRepo");
const { registrarLog } = require("../repositories/logRepo");

// ====================================================
// 🎚️ Controller: Grupos (ERP Histerese 2.0)
// ====================================================

// ➕ Criar grupo
async function criar(req, res) {
    try {
        const empresa_id = req.user?.empresa_id;
        const { nome, descricao } = req.body;

        if (!empresa_id)
            return res.status(401).json({ erro: "Empresa não identificada." });
        if (!nome?.trim())
            return res.status(400).json({ erro: "O campo 'nome' é obrigatório." });

        const grupo = await grupoRepo.criar({ empresa_id, nome, descricao });

        // Log
        try {
            await registrarLog({
                usuario_id: req.user?.id,
                empresa_id,
                acao: "CRIAR",
                tabela: "grupos",
                registro_id: grupo.id,
                descricao: `Grupo '${grupo.nome}' criado.`,
                ip: req.ip,
            });
        } catch (errLog) {
            console.error("⚠️ Falha ao registrar log:", errLog.message);
        }

        res.status(201).json(grupo);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

// 📋 Listar
async function listar(req, res) {
    try {
        const empresa_id = req.user?.empresa_id;
        if (!empresa_id)
            return res.status(401).json({ erro: "Empresa não identificada." });

        const q = req.query.q || null;
        const limit = Math.min(parseInt(req.query.limit || "50", 10), 100);
        const page = Math.max(parseInt(req.query.page || "1", 10), 1);
        const offset = (page - 1) * limit;

        const [items, total] = await Promise.all([
            grupoRepo.listar({ empresa_id, q, limit, offset }),
            grupoRepo.contar({ empresa_id, q }),
        ]);

        res.json({
            items,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

// 🔍 Buscar por ID
async function buscarPorId(req, res) {
    try {
        const empresa_id = req.user?.empresa_id;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ erro: "ID inválido." });

        const grupo = await grupoRepo.buscarPorId(id, empresa_id);
        if (!grupo) return res.status(404).json({ erro: "Grupo não encontrado." });

        res.json(grupo);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

// ✏️ Atualizar
async function atualizar(req, res) {
    try {
        const empresa_id = req.user?.empresa_id;
        const id = parseInt(req.params.id, 10);
        const { nome, descricao } = req.body;

        if (!empresa_id)
            return res.status(401).json({ erro: "Empresa não identificada." });
        if (isNaN(id)) return res.status(400).json({ erro: "ID inválido." });
        if (!nome?.trim())
            return res.status(400).json({ erro: "O campo 'nome' é obrigatório." });

        const grupo = await grupoRepo.atualizar(id, empresa_id, { nome, descricao });
        if (!grupo) return res.status(404).json({ erro: "Grupo não encontrado." });

        // Log
        try {
            await registrarLog({
                usuario_id: req.user?.id,
                empresa_id,
                acao: "EDITAR",
                tabela: "grupos",
                registro_id: id,
                descricao: `Grupo '${nome}' atualizado.`,
                ip: req.ip,
            });
        } catch (errLog) {
            console.error("⚠️ Falha ao registrar log:", errLog.message);
        }

        res.json(grupo);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

// 🚫 Exclusão lógica
async function excluir(req, res) {
    try {
        const empresa_id = req.user?.empresa_id;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ erro: "ID inválido." });

        const grupo = await grupoRepo.excluir(id, empresa_id);
        if (!grupo) return res.status(404).json({ erro: "Grupo não encontrado." });

        // Log
        try {
            await registrarLog({
                usuario_id: req.user?.id,
                empresa_id,
                acao: "EXCLUIR",
                tabela: "grupos",
                registro_id: id,
                descricao: `Grupo '${grupo.nome}' inativado.`,
                ip: req.ip,
            });
        } catch (errLog) {
            console.error("⚠️ Falha ao registrar log:", errLog.message);
        }

        res.json(grupo);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir };
