// repositories/empresaRepo.js
// Camada de acesso ao banco de dados para o módulo Empresa — revisado com paginação, busca e soft delete

const { pool } = require("../config/db");

/** Criação de empresa */
async function criar({ nome, logo_url }) {
    const { rows } = await pool.query(
        `INSERT INTO empresa (nome, logo_url) VALUES ($1, $2) RETURNING *`,
        [nome, logo_url || null]
    );
    return rows[0];
}

/** Listagem com paginação e busca opcional */
async function listar({ page = 1, limit = 20, q } = {}) {
    const off = (Number(page) - 1) * Number(limit);
    const params = [];
    let where = `WHERE status='ativo'`;

    if (q) {
        params.push(`%${q}%`);
        where += ` AND unaccent(nome) ILIKE unaccent($${params.length})`;
    }

    params.push(limit, off);
    const sql = `
    SELECT * FROM empresa
    ${where}
    ORDER BY id DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;

    const { rows } = await pool.query(sql, params);
    return rows;
}

/** Buscar por ID */
async function getById(id) {
    const { rows } = await pool.query(`SELECT * FROM empresa WHERE id=$1`, [id]);
    return rows[0];
}

/** Atualização dinâmica (nome, logo_url, status) */
async function atualizar(id, data) {
    const allowed = ["nome", "logo_url", "status"];
    const sets = [];
    const vals = [];

    allowed.forEach((key) => {
        if (data[key] !== undefined) {
            vals.push(data[key]);
            sets.push(`${key}=$${vals.length}`);
        }
    });

    if (!sets.length) return await getById(id);

    vals.push(id);
    const { rows } = await pool.query(
        `UPDATE empresa SET ${sets.join(", ")}, atualizado_em=NOW()
     WHERE id=$${vals.length} RETURNING *`,
        vals
    );

    return rows[0];
}

/** Exclusão lógica */
async function softDelete(id) {
    const { rows } = await pool.query(
        `UPDATE empresa SET status='inativo', atualizado_em=NOW() WHERE id=$1 RETURNING *`,
        [id]
    );
    return rows[0];
}

module.exports = {
    criar,
    listar,
    getById,
    atualizar,
    softDelete,
};
