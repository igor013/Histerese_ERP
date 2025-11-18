const pool = require("../config/db");

// ============================
// 💾 CRUD - Contas Bancárias
// ============================

// Criar conta bancária
async function criar({ fornecedor_id, banco, agencia, conta, pix, tipo_conta, observacao }) {
    const query = `
    INSERT INTO fornecedores_bancos (
      fornecedor_id, banco, agencia, conta, pix, tipo_conta, observacao, status, criado_em, atualizado_em
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,'ativo',NOW(),NOW())
    RETURNING *;
  `;
    const values = [fornecedor_id, banco, agencia, conta, pix, tipo_conta, observacao];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

// Listar contas bancárias de um fornecedor
async function listar(fornecedor_id) {
    const { rows } = await pool.query(
        `SELECT * FROM fornecedores_bancos WHERE fornecedor_id = $1 AND status = 'ativo' ORDER BY id DESC`,
        [fornecedor_id]
    );
    return rows;
}

// Atualizar conta
async function atualizar(id, { banco, agencia, conta, pix, tipo_conta, observacao }) {
    const query = `
    UPDATE fornecedores_bancos
    SET banco=$1, agencia=$2, conta=$3, pix=$4, tipo_conta=$5, observacao=$6, atualizado_em=NOW()
    WHERE id=$7
    RETURNING *;
  `;
    const values = [banco, agencia, conta, pix, tipo_conta, observacao, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

// Exclusão lógica
async function excluir(id) {
    const { rows } = await pool.query(
        `UPDATE fornecedores_bancos SET status='excluido', atualizado_em=NOW() WHERE id=$1 RETURNING *`,
        [id]
    );
    return rows[0];
}

module.exports = { criar, listar, atualizar, excluir };
