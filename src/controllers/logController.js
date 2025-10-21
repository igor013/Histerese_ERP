// ====================================================
// 🧾 Histerese ERP - Controller: Logs do Sistema
// ====================================================

const db = require("../config/db");

/**
 * Lista os logs com filtros opcionais.
 * Aceita filtros via query: acao, tabela, usuario_id, limite
 */
async function listarLogs(req, res) {
    try {
        const { empresa_id } = req.user; // pega empresa do token JWT
        const { acao, tabela, usuario_id, limite = 50 } = req.query;

        let query = `
            SELECT l.*, u.nome AS usuario_nome
            FROM logs l
            LEFT JOIN usuarios u ON u.id = l.usuario_id
            WHERE (l.empresa_id = $1 OR l.empresa_id IS NULL)
        `;
        const values = [empresa_id];
        let index = 2;

        if (acao) {
            query += ` AND l.acao ILIKE $${index++}`;
            values.push(`%${acao}%`);
        }
        if (tabela) {
            query += ` AND l.tabela ILIKE $${index++}`;
            values.push(`%${tabela}%`);
        }
        if (usuario_id) {
            query += ` AND l.usuario_id = $${index++}`;
            values.push(usuario_id);
        }

        query += ` ORDER BY l.criado_em DESC LIMIT $${index}`;
        values.push(Number(limite));

        const { rows } = await db.query(query, values);

        res.json(rows);
    } catch (err) {
        console.error("❌ Erro ao listar logs:", err);
        res.status(500).json({ erro: "Erro ao listar logs" });
    }
}

module.exports = { listarLogs };
