const pool = require("../config/db");

/**
 * Util: converte "" para null e remove espaços extras.
 */
function sanitizeValue(v) {
  if (v === undefined) return null;
  if (typeof v === "string") {
    const t = v.trim();
    return t === "" ? null : t;
  }
  return v;
}

function sanitizePayload(payload = {}) {
  const out = {};
  for (const [k, v] of Object.entries(payload)) {
    out[k] = sanitizeValue(v);
  }
  return out;
}

/**
 * Cria produto (multi-empresa).
 * Espera { empresa_id, nome, valor_compra, valor_venda, quantidade, unidade_medida, fornecedor_id, grupo_id, numero_nota }
 */
async function criar({
  empresa_id,
  nome,
  valor_compra,
  valor_venda,
  quantidade,
  unidade_medida,
  fornecedor_id,
  grupo_id,
  numero_nota,
}) {
  const p = sanitizePayload({
    empresa_id,
    nome,
    valor_compra,
    valor_venda,
    quantidade,
    unidade_medida,
    fornecedor_id,
    grupo_id,
    numero_nota,
  });

  const query = `
    INSERT INTO produtos
      (empresa_id, nome, valor_compra, valor_venda, quantidade, unidade_medida, fornecedor_id, grupo_id, numero_nota, status, criado_em, atualizado_em)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,'ativo', NOW(), NOW())
    RETURNING *;
  `;
  const values = [
    p.empresa_id,
    p.nome,
    p.valor_compra,
    p.valor_venda,
    p.quantidade,
    p.unidade_medida,
    p.fornecedor_id,
    p.grupo_id,
    p.numero_nota,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

/**
 * Lista produtos da empresa autenticada.
 * Filtros simples: busca por nome (q) e paginação.
 */
async function listar({ empresa_id, q = null, limit = 20, offset = 0, status = 'ativo' }) {
  const filters = [`p.empresa_id = $1`];
  const params = [empresa_id];
  let idx = params.length + 1;

  // status: 'ativo' | 'inativo' | 'todos'
  const st = String(status || 'ativo').toLowerCase();
  if (st === 'ativo') filters.push(`p.status = 'ativo'`);
  else if (st === 'inativo') filters.push(`p.status = 'inativo'`);
  // 'todos' não aplica filtro de status

  if (q) {
    filters.push(`unaccent(lower(p.nome)) LIKE unaccent(lower($${idx++}))`);
    params.push(`%${q}%`);
  }

  const sql = `
    SELECT
      p.*,
      g.nome AS grupo_nome,
      f.nome AS fornecedor_nome
    FROM produtos p
    LEFT JOIN grupos g ON p.grupo_id = g.id
    LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
    WHERE ${filters.join(" AND ")}
    ORDER BY p.nome ASC
    LIMIT $${idx++}
    OFFSET $${idx++};
  `;
  params.push(limit);
  params.push(offset);

  const { rows } = await pool.query(sql, params);
  return rows;
}

async function contar({ empresa_id, q = null, status = 'ativo' }) {
  const filters = [`empresa_id = $1`];
  const params = [empresa_id];
  let idx = params.length + 1;
  const st = String(status || 'ativo').toLowerCase();
  if (st === 'ativo') filters.push(`status = 'ativo'`);
  else if (st === 'inativo') filters.push(`status = 'inativo'`);
  if (q) {
    filters.push(`unaccent(lower(nome)) LIKE unaccent(lower($${idx++}))`);
    params.push(`%${q}%`);
  }
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM produtos WHERE ${filters.join(" AND ")}`,
    params
  );
  return rows[0]?.total ?? 0;
}

async function buscarPorId(id, empresa_id) {
  const { rows } = await pool.query(
    `SELECT p.*,
            g.nome AS grupo_nome,
            f.nome AS fornecedor_nome
       FROM produtos p
       LEFT JOIN grupos g ON p.grupo_id = g.id
       LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      WHERE p.id = $1 AND p.empresa_id = $2 AND p.status = 'ativo'`,
    [id, empresa_id]
  );
  return rows[0];
}

async function atualizar(
  id,
  empresa_id,
  {
    nome,
    valor_compra,
    valor_venda,
    quantidade,
    unidade_medida,
    fornecedor_id,
    grupo_id,
    numero_nota,
  }
) {
  const p = sanitizePayload({
    nome,
    valor_compra,
    valor_venda,
    quantidade,
    unidade_medida,
    fornecedor_id,
    grupo_id,
    numero_nota,
  });

  const query = `
    UPDATE produtos
       SET nome = $1,
           valor_compra = $2,
           valor_venda = $3,
           quantidade = $4,
           unidade_medida = $5,
           fornecedor_id = $6,
           grupo_id = $7,
           numero_nota = $8,
           atualizado_em = NOW()
     WHERE id = $9 AND empresa_id = $10
     RETURNING *;
  `;
  const values = [
    p.nome,
    p.valor_compra,
    p.valor_venda,
    p.quantidade,
    p.unidade_medida,
    p.fornecedor_id,
    p.grupo_id,
    p.numero_nota,
    id,
    empresa_id,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

/**
 * Exclusão lógica: padronizado para "inativo".
 */
async function excluir(id, empresa_id) {
  const { rows } = await pool.query(
    `UPDATE produtos
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
  // novo
  async restaurar(id, empresa_id) {
    const { rows } = await pool.query(
      `UPDATE produtos SET status = 'ativo', atualizado_em = NOW()
       WHERE id = $1 AND empresa_id = $2 RETURNING *;`,
      [id, empresa_id]
    );
    return rows[0];
  },
};
