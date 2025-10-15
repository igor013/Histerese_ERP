// src/repositories/equipamentoRepo.js
const { pool } = require('../config/db'); // ✅ usa o pool exportado

// Helpers de paginação
const toInt = (v, d) => (Number.isInteger(+v) && +v > 0 ? +v : d);

const baseSelect = `
  SELECT e.id, e.empresa_id, e.cliente_id, e.tipo, e.marca, e.modelo,
         e.numero_serie, e.identificador, e.observacoes, e.status,
         e.criado_em, e.atualizado_em
  FROM equipamentos e
`;

async function create(data) {
    const {
        empresa_id, cliente_id, tipo, marca, modelo,
        numero_serie, identificador, observacoes
    } = data;

    const sql = `
    INSERT INTO equipamentos
      (empresa_id, cliente_id, tipo, marca, modelo, numero_serie, identificador, observacoes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
  `;
    const params = [empresa_id, cliente_id || null, tipo, marca || null, modelo || null,
        numero_serie || null, identificador || null, observacoes || null];
    const { rows } = await pool.query(sql, params); // ✅ pool.query
    return rows[0];
}

async function list({ empresa_id, q, page = 1, limit = 10, cliente_id, tipo, marca, modelo, status = 'ativo' }) {
    page = toInt(page, 1);
    limit = toInt(limit, 10);
    const offset = (page - 1) * limit;

    const where = ['e.empresa_id = $1'];
    const params = [empresa_id];
    let idx = params.length;

    if (status) {
        where.push(`e.status = $${++idx}`);
        params.push(status);
    }

    if (cliente_id) {
        where.push(`e.cliente_id = $${++idx}`);
        params.push(cliente_id);
    }
    if (tipo) {
        where.push(`e.tipo ILIKE $${++idx}`);
        params.push(`%${tipo}%`);
    }
    if (marca) {
        where.push(`e.marca ILIKE $${++idx}`);
        params.push(`%${marca}%`);
    }
    if (modelo) {
        where.push(`e.modelo ILIKE $${++idx}`);
        params.push(`%${modelo}%`);
    }
    if (q) {
        // busca ampla
        where.push(`(
      e.tipo ILIKE $${++idx}
      OR e.marca ILIKE $${++idx}
      OR e.modelo ILIKE $${++idx}
      OR e.numero_serie ILIKE $${++idx}
      OR e.identificador ILIKE $${++idx}
    )`);
        params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sqlData = `
    ${baseSelect}
    ${whereSql}
    ORDER BY e.criado_em DESC
    LIMIT ${limit} OFFSET ${offset};
  `;

    const sqlCount = `
    SELECT COUNT(*)::int AS total
    FROM equipamentos e
    ${whereSql};
  `;

    const [dataRes, countRes] = await Promise.all([
        pool.query(sqlData, params),   // ✅ pool.query
        pool.query(sqlCount, params)   // ✅ pool.query
    ]);

    return {
        data: dataRes.rows,
        page,
        limit,
        total: countRes.rows[0].total
    };
}

async function getById({ empresa_id, id }) {
    const sql = `${baseSelect} WHERE e.empresa_id = $1 AND e.id = $2 LIMIT 1;`;
    const { rows } = await pool.query(sql, [empresa_id, id]); // ✅ pool.query
    return rows[0] || null;
}

async function update({ empresa_id, id, payload }) {
    const fields = [];
    const params = [];
    let idx = 0;

    const updatable = ['cliente_id', 'tipo', 'marca', 'modelo', 'numero_serie', 'identificador', 'observacoes', 'status'];

    updatable.forEach((k) => {
        if (Object.prototype.hasOwnProperty.call(payload, k)) {
            fields.push(`${k} = $${++idx}`);
            params.push(payload[k]);
        }
    });

    if (!fields.length) return getById({ empresa_id, id });

    fields.push(`atualizado_em = NOW()`);

    const sql = `
    UPDATE equipamentos
      SET ${fields.join(', ')}
    WHERE empresa_id = $${++idx} AND id = $${++idx}
    RETURNING *;
  `;
    params.push(empresa_id, id);

    const { rows } = await pool.query(sql, params); // ✅ pool.query
    return rows[0] || null;
}

async function softDelete({ empresa_id, id }) {
    const sql = `
    UPDATE equipamentos
      SET status = 'excluido', atualizado_em = NOW()
    WHERE empresa_id = $1 AND id = $2 AND status <> 'excluido'
    RETURNING *;
  `;
    const { rows } = await pool.query(sql, [empresa_id, id]); // ✅ pool.query
    return rows[0] || null;
}

async function restore({ empresa_id, id }) {
    const sql = `
    UPDATE equipamentos
      SET status = 'ativo', atualizado_em = NOW()
    WHERE empresa_id = $1 AND id = $2 AND status = 'excluido'
    RETURNING *;
  `;
    const { rows } = await pool.query(sql, [empresa_id, id]); // ✅ pool.query
    return rows[0] || null;
}

module.exports = {
    create,
    list,
    getById,
    update,
    softDelete,
    restore,
};
