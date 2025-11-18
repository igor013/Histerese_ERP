const pool = require("../config/db");

// ====================================================
// 🧾 Repositório: Grupos (ERP Histerese 2.0)
// ====================================================

// Limpa strings vazias → null
function sanitizeValue(v) {
    if (v === undefined || v === null) return null;
    if (typeof v === "string") {
        const t = v.trim();
        return t === "" ? null : t;
    }
    return v;
}

function sanitizePayload(payload = {}) {
    const out = {};
    for (const [k, v] of Object.entries(payload)) out[k] = sanitizeValue(v);
    return out;
}

// ➕ Criar grupo
async function criar({ empresa_id, nome, descricao }) {
    const p = sanitizePayload({ empresa_id, nome, descricao });

    const query = `
    INSERT INTO grupos (empresa_id, nome, descricao, status, criado_em, atualizado_em)
    VALUES ($1, $2, $3, 'ativo', NOW(), NOW())
    RETURNING *;
  `;
    const { rows } = await pool.query(query, [p.empresa_id, p.nome, p.descricao]);
    return rows[0];
}

// 📋 Listar grupos (busca + paginação)
async function listar({ empresa_id, q = null, limit = 50, offset = 0 }) {
    const filters = [`empresa_id = $1`, `status = 'ativo'`];
    const params = [empresa_id];
    let idx = params.length + 1;

    if (q) {
        filters.push(`unaccent(lower(nome)) LIKE unaccent(lower($${idx++}))`);
        params.push(`%${q}%`);
    }

    const sql = `
    SELECT id, nome, descricao, status, criado_em, atualizado_em
    FROM grupos
    WHERE ${filters.join(" AND ")}
    ORDER BY nome ASC
    LIMIT $${idx++} OFFSET $${idx++};
  `;
    params.push(limit, offset);

    const { rows } = await pool.query(sql, params);
    return rows;
}

// 📊 Contar grupos (para paginação)
async function contar({ empresa_id, q = null }) {
    const filters = [`empresa_id = $1`, `status = 'ativo'`];
    const params = [empresa_id];
    let idx = 2;

    if (q) {
        filters.push(`unaccent(lower(nome)) LIKE unaccent(lower($${idx++}))`);
        params.push(`%${q}%`);
    }

    const { rows } = await pool.query(
        `SELECT COUNT(*)::int AS total FROM grupos WHERE ${filters.join(" AND ")}`,
        params
    );
    return rows[0]?.total ?? 0;
}

// 🔍 Buscar por ID
async function buscarPorId(id, empresa_id) {
    const { rows } = await pool.query(
        `SELECT * FROM grupos
     WHERE id = $1 AND empresa_id = $2 AND status = 'ativo';`,
        [id, empresa_id]
    );
    return rows[0];
}

// ✏️ Atualizar
async function atualizar(id, empresa_id, { nome, descricao }) {
    const p = sanitizePayload({ nome, descricao });
    const query = `
    UPDATE grupos
       SET nome = $1,
           descricao = $2,
           atualizado_em = NOW()
     WHERE id = $3 AND empresa_id = $4
     RETURNING *;
  `;
    const { rows } = await pool.query(query, [
        p.nome,
        p.descricao,
        id,
        empresa_id,
    ]);
    return rows[0];
}

// 🚫 Exclusão lógica
async function excluir(id, empresa_id) {
    const { rows } = await pool.query(
        `UPDATE grupos
        SET status = 'inativo', atualizado_em = NOW()
      WHERE id = $1 AND empresa_id = $2
      RETURNING *;`,
        [id, empresa_id]
    );
    return rows[0];
}

module.exports = {
    criar,
    listar,
    contar,
    buscarPorId,
    atualizar,
    excluir,
};
