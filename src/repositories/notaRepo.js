// src/repositories/notaRepo.js
const db = require("../config/db");

// ============================================================
// LISTAR NOTAS
// ============================================================
exports.buscarTodos = async (empresa_id, { page = 1, limit = 100, q = "" }) => {
  const offset = (page - 1) * limit;

  let filtro = "";
  const params = [empresa_id, limit, offset];

  if (q) {
    filtro = `
      AND (
        unaccent(lower(n.numero_nota)) LIKE unaccent(lower($4))
        OR unaccent(lower(f.nome)) LIKE unaccent(lower($4))
        OR unaccent(lower(n.chave_acesso)) LIKE unaccent(lower($4))
      )
    `;
    params.push(`%${q}%`);
  }

  const result = await db.query(
    `
      SELECT 
          n.id,
          n.numero_nota,
          n.serie,
          n.fornecedor_id,
          f.nome AS fornecedor_nome,
          n.data_emissao,
          n.valor_total,
          n.status,
          n.chave_acesso,
          n.criado_em,
          n.atualizado_em
      FROM notas n
      LEFT JOIN fornecedores f ON f.id = n.fornecedor_id
      WHERE n.empresa_id = $1
      ${filtro}
      ORDER BY n.id DESC
      LIMIT $2 OFFSET $3
    `,
    params
  );

  return result.rows;
};

// ============================================================
// BUSCAR NOTA POR ID
// ============================================================
exports.buscarPorId = async (id, empresa_id) => {
  const result = await db.query(
    `
      SELECT 
          *
      FROM notas
      WHERE id = $1
        AND empresa_id = $2
      LIMIT 1
    `,
    [id, empresa_id]
  );

  return result.rows[0] || null;
};

// ============================================================
// CRIAR NOTA (somente cabeçalho — itens são no controller)
// ============================================================
exports.criar = async (empresa_id, dados) => {
  const {
    numero_nota,
    serie,
    fornecedor_id,
    data_emissao,
    valor_total,
    chave_acesso,
    inscricao_estadual,
    cnpj_fornecedor,
    razao_social_fornecedor,
    endereco_fornecedor,
    cidade_fornecedor,
    uf_fornecedor,
    icms,
    ipi,
    pis,
    cofins,
    issqn,
  } = dados;

  const result = await db.query(
    `
      INSERT INTO notas (
        empresa_id,
        numero_nota,
        serie,
        fornecedor_id,
        data_emissao,
        valor_total,
        chave_acesso,
        inscricao_estadual,
        cnpj_fornecedor,
        razao_social_fornecedor,
        endereco_fornecedor,
        cidade_fornecedor,
        uf_fornecedor,
        icms,
        ipi,
        pis,
        cofins,
        issqn
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18
      )
      RETURNING *
    `,
    [
      empresa_id,
      numero_nota || null,
      serie || null,
      fornecedor_id || null,
      data_emissao || null,
      valor_total || null,
      chave_acesso || null,
      inscricao_estadual || null,
      cnpj_fornecedor || null,
      razao_social_fornecedor || null,
      endereco_fornecedor || null,
      cidade_fornecedor || null,
      uf_fornecedor || null,
      icms || 0,
      ipi || 0,
      pis || 0,
      cofins || 0,
      issqn || 0,
    ]
  );

  return result.rows[0];
};

// ============================================================
// ATUALIZAR NOTA
// ============================================================
exports.atualizar = async (id, empresa_id, dados) => {
  const {
    numero_nota,
    serie,
    fornecedor_id,
    data_emissao,
    valor_total,
    chave_acesso,
    inscricao_estadual,
    cnpj_fornecedor,
    razao_social_fornecedor,
    endereco_fornecedor,
    cidade_fornecedor,
    uf_fornecedor,
    icms,
    ipi,
    pis,
    cofins,
    issqn,
  } = dados;

  const result = await db.query(
    `
      UPDATE notas SET
        numero_nota = $1,
        serie = $2,
        fornecedor_id = $3,
        data_emissao = $4,
        valor_total = $5,
        chave_acesso = $6,
        inscricao_estadual = $7,
        cnpj_fornecedor = $8,
        razao_social_fornecedor = $9,
        endereco_fornecedor = $10,
        cidade_fornecedor = $11,
        uf_fornecedor = $12,
        icms = $13,
        ipi = $14,
        pis = $15,
        cofins = $16,
        issqn = $17,
        atualizado_em = NOW()
      WHERE id = $18
        AND empresa_id = $19
      RETURNING *
    `,
    [
      numero_nota || null,
      serie || null,
      fornecedor_id || null,
      data_emissao || null,
      valor_total || null,
      chave_acesso || null,
      inscricao_estadual || null,
      cnpj_fornecedor || null,
      razao_social_fornecedor || null,
      endereco_fornecedor || null,
      cidade_fornecedor || null,
      uf_fornecedor || null,
      icms || 0,
      ipi || 0,
      pis || 0,
      cofins || 0,
      issqn || 0,
      id,
      empresa_id,
    ]
  );

  return result.rows[0];
};

// ============================================================
// EXCLUIR NOTA
// ============================================================
exports.excluir = async (id, empresa_id) => {
  const result = await db.query(
    `
      DELETE FROM notas
      WHERE id = $1
        AND empresa_id = $2
      RETURNING *
    `,
    [id, empresa_id]
  );

  return result.rows[0];
};
