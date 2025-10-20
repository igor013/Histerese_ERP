// ====================================================
// 📦 REPOSITÓRIO: EMPRESA
// ====================================================
// Responsável por lidar diretamente com o banco de dados
// Tabela: public.empresa
// Campos principais:
//   id, razao_social, nome_fantasia, cnpj, inscricao_estadual,
//   email, telefone, rua, numero, bairro, cidade, uf, cep,
//   tipo, matriz_id, logo_url, status, criado_em, atualizado_em
// ====================================================

const { pool } = require("../config/db");

// ====================================================
// 🧾 LISTAR TODAS AS EMPRESAS (exceto excluídas)
// ====================================================
async function listar() {
    const query = `
    SELECT 
      id,
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
      logo_url,
      status,
      criado_em,
      atualizado_em
    FROM empresa
    WHERE status != 'excluido'
    ORDER BY id ASC;
  `;
    const { rows } = await pool.query(query);
    return rows;
}

// ====================================================
// 🔍 BUSCAR EMPRESA POR ID
// ====================================================
async function buscarPorId(id) {
    const query = `
    SELECT 
      id,
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
      logo_url,
      status,
      criado_em,
      atualizado_em
    FROM empresa
    WHERE id = $1 AND status != 'excluido';
  `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
}

// ====================================================
// 🏢 CRIAR NOVA EMPRESA
// ====================================================
async function criar(dados) {
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
        tipo = "Matriz",
        matriz_id = null,
        logo_url = null
    } = dados;

    const query = `
    INSERT INTO empresa (
      razao_social, nome_fantasia, cnpj, inscricao_estadual,
      email, telefone, rua, numero, bairro, cidade, uf, cep,
      tipo, matriz_id, logo_url, status, criado_em, atualizado_em
    )
    VALUES (
      $1, $2, $3, $4,
      $5, $6, $7, $8, $9, $10, $11, $12,
      $13, $14, $15, 'ativo', NOW(), NOW()
    )
    RETURNING *;
  `;

    const values = [
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
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
}

// ====================================================
// ✏️ ATUALIZAR EMPRESA
// ====================================================
async function atualizar(id, dados) {
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
    } = dados;

    const query = `
    UPDATE empresa
    SET 
      razao_social = COALESCE($1, razao_social),
      nome_fantasia = COALESCE($2, nome_fantasia),
      cnpj = COALESCE($3, cnpj),
      inscricao_estadual = COALESCE($4, inscricao_estadual),
      email = COALESCE($5, email),
      telefone = COALESCE($6, telefone),
      rua = COALESCE($7, rua),
      numero = COALESCE($8, numero),
      bairro = COALESCE($9, bairro),
      cidade = COALESCE($10, cidade),
      uf = COALESCE($11, uf),
      cep = COALESCE($12, cep),
      tipo = COALESCE($13, tipo),
      matriz_id = COALESCE($14, matriz_id),
      logo_url = COALESCE($15, logo_url),
      atualizado_em = NOW()
    WHERE id = $16
    RETURNING *;
  `;

    const values = [
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
        logo_url,
        id
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
}

// ====================================================
// 🗑️ EXCLUSÃO LÓGICA (status = 'excluido')
// ====================================================
async function excluir(id) {
    const query = `
    UPDATE empresa
    SET status = 'excluido', atualizado_em = NOW()
    WHERE id = $1
    RETURNING id, razao_social, nome_fantasia, status;
  `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
}

// ====================================================
// 🧾 REATIVAR EMPRESA (status = 'ativo')
// ====================================================
async function reativar(id) {
    const query = `
    UPDATE empresa
    SET status = 'ativo', atualizado_em = NOW()
    WHERE id = $1
    RETURNING id, razao_social, nome_fantasia, status;
  `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
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
