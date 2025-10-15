// src/repositories/clienteRepo.js
const { pool } = require("../config/db");

// ————— helpers
function buildWhere({ q, status }) {
  const where = [];
  const params = [];
  let i = 0;

  // por padrão, só ativos
  if (status) {
    where.push(`status = $${++i}`);
    params.push(status);
  } else {
    where.push(`status = 'ativo'`);
  }

  if (q) {
    where.push(`(
      unaccent(nome) ILIKE unaccent($${++i}) OR
      unaccent(empresa) ILIKE unaccent($${i}) OR
      unaccent(cidade) ILIKE unaccent($${i}) OR
      telefone ILIKE $${i}
    )`);
    params.push(`%${q}%`);
  }

  return { where: where.length ? `WHERE ${where.join(" AND ")}` : "", params };
}

// ————— criar cliente
// src/repositories/clienteRepo.js
async function criarCliente({ nome, empresa, tipo_pessoa, cpf_cnpj, rua, bairro, numero, cidade, complemento, telefone }) {
  const empresa_id = 1; // temporário até integrar autenticação

  const query = `
    INSERT INTO clientes
      (empresa_id, tipo_pessoa, cpf_cnpj, nome, empresa, rua, bairro, numero, cidade, complemento, telefone, status, criado_em, atualizado_em)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'ativo', NOW(), NOW())
    RETURNING *;
  `;
  const values = [
    empresa_id,
    tipo_pessoa,
    cpf_cnpj,
    nome,
    empresa,
    rua,
    bairro,
    numero,
    cidade,
    complemento,
    telefone,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

// ————— listar (com busca + paginação + total)
async function listarClientes({ q, page = 1, limit = 20, status } = {}) {
  const off = (page - 1) * limit;
  const { where, params } = buildWhere({ q, status });

  const listSql = `
    SELECT * FROM clientes
    ${where}
    ORDER BY id DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2};
  `;
  const listParams = [...params, Number(limit), Number(off)];

  const countSql = `SELECT COUNT(*)::int AS total FROM clientes ${where};`;

  const [list, count] = await Promise.all([
    pool.query(listSql, listParams),
    pool.query(countSql, params),
  ]);

  const total = count.rows[0].total;
  return {
    items: list.rows,
    page: Number(page),
    limit: Number(limit),
    total,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

// ————— obter por id (ignora excluídos por padrão)
async function obterClientePorId(id, { incluirExcluido = false } = {}) {
  const sql = `
    SELECT * FROM clientes
    WHERE id=$1 ${incluirExcluido ? "" : "AND status='ativo'"}
    LIMIT 1;
  `;
  const { rows } = await pool.query(sql, [id]);
  return rows[0];
}

// ————— atualizar (PUT completo) — só em ativo + atualiza timestamp
async function atualizarCliente(id, dados) {
  const { nome, empresa, rua, bairro, numero, cidade, complemento, telefone } = dados;
  const query = `
    UPDATE clientes
    SET nome=$1, empresa=$2, rua=$3, bairro=$4, numero=$5, cidade=$6, complemento=$7, telefone=$8,
        atualizado_em = NOW()
    WHERE id=$9 AND status='ativo'
    RETURNING *;
  `;
  const values = [nome, empresa, rua, bairro, numero, cidade, complemento, telefone, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

// ————— patch (parcial)
async function patchCliente(id, dados) {
  const campos = [];
  const valores = [];
  let i = 0;

  const permitidos = ["nome", "empresa", "rua", "bairro", "numero", "cidade", "complemento", "telefone", "status"];
  for (const k of permitidos) {
    if (dados[k] !== undefined) {
      campos.push(`${k} = $${++i}`);
      valores.push(dados[k]);
    }
  }
  campos.push(`atualizado_em = NOW()`);

  const sql = `
    UPDATE clientes SET ${campos.join(", ")}
    WHERE id = $${++i}
    RETURNING *;
  `;
  valores.push(id);

  const { rows } = await pool.query(sql, valores);
  return rows[0];
}

// ————— exclusão lógica (com timestamp)
async function excluirCliente(id) {
  const { rows } = await pool.query(
    `UPDATE clientes SET status='excluido', atualizado_em = NOW() WHERE id=$1 RETURNING *`,
    [id]
  );
  return rows[0];
}

// ————— restaurar (opcional)
async function restaurarCliente(id) {
  const { rows } = await pool.query(
    `UPDATE clientes SET status='ativo', atualizado_em = NOW() WHERE id=$1 RETURNING *`,
    [id]
  );
  return rows[0];
}

module.exports = {
  criarCliente,
  listarClientes,
  obterClientePorId,
  atualizarCliente,
  patchCliente,
  excluirCliente,
  restaurarCliente,
};
