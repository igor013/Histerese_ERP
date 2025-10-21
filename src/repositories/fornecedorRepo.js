const pool  = require("../config/db");

// Criar fornecedor
async function criar({ empresa_id, nome, bairro, rua, numero, cidade, estado, email, telefone, site }) {
    const query = `
    INSERT INTO fornecedores (
      empresa_id, nome, bairro, rua, numero, cidade, estado, email, telefone, site, status, criado_em, atualizado_em
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'ativo',NOW(),NOW())
    RETURNING *;
  `;
    const values = [empresa_id, nome, bairro, rua, numero, cidade, estado, email, telefone, site];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

// Listar fornecedores ativos (por empresa)
async function listar(empresa_id) {
    const { rows } = await pool.query(`
    SELECT * FROM fornecedores
    WHERE empresa_id = $1 AND status = 'ativo'
    ORDER BY id DESC
  `, [empresa_id]);
    return rows;
}

// Buscar fornecedor por ID (somente ativos)
async function buscarPorId(id, empresa_id) {
    const { rows } = await pool.query(
        `SELECT * FROM fornecedores WHERE id = $1 AND empresa_id = $2 AND status = 'ativo'`,
        [id, empresa_id]
    );
    return rows[0];
}

// Atualizar fornecedor
async function atualizar(id, { nome, bairro, rua, numero, cidade, estado, email, telefone, site }) {
    const query = `
    UPDATE fornecedores
    SET nome=$1, bairro=$2, rua=$3, numero=$4, cidade=$5, estado=$6,
        email=$7, telefone=$8, site=$9, atualizado_em=NOW()
    WHERE id=$10
    RETURNING *;
  `;
    const values = [nome, bairro, rua, numero, cidade, estado, email, telefone, site, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

// Exclusão lógica (marca como excluído)
async function excluir(id) {
    const { rows } = await pool.query(
        "UPDATE fornecedores SET status='excluido', atualizado_em=NOW() WHERE id=$1 RETURNING *",
        [id]
    );
    return rows[0];
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir };
