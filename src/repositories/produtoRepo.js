const  pool  = require("../config/db");

async function criar({ nome, valor_compra, valor_venda, quantidade, unidade_medida, fornecedor_id, grupo_id, numero_nota }) {
    const query = `
    INSERT INTO produtos (nome, valor_compra, valor_venda, quantidade, unidade_medida, fornecedor_id, grupo_id, numero_nota)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
  `;
    const values = [nome, valor_compra, valor_venda, quantidade, unidade_medida, fornecedor_id, grupo_id, numero_nota];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

async function listar() {
    const { rows } = await pool.query(`
    SELECT p.*,
            g.nome AS grupo_nome,
            f.nome AS fornecedor_nome
    FROM produtos p
    LEFT JOIN grupos g ON p.grupo_id = g.id
    LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
    WHERE p.status='ativo'
    ORDER BY p.id DESC
    `);
    return rows;
}

async function buscarPorId(id) {
    const { rows } = await pool.query(
        "SELECT * FROM produtos WHERE id=$1 AND status='ativo'",
        [id]
    );
    return rows[0];
}

async function atualizar(id, { nome, valor_compra, valor_venda, quantidade, unidade_medida, fornecedor_id, grupo_id, numero_nota }) {
    const query = `
    UPDATE produtos
    SET nome=$1, valor_compra=$2, valor_venda=$3, quantidade=$4,
        unidade_medida=$5, fornecedor_id=$6, grupo_id=$7, numero_nota=$8
    WHERE id=$9
    RETURNING *;
  `;
    const values = [nome, valor_compra, valor_venda, quantidade, unidade_medida, fornecedor_id, grupo_id, numero_nota, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

async function excluir(id) {
    const { rows } = await pool.query(
        "UPDATE produtos SET status='excluido' WHERE id=$1 RETURNING *",
        [id]
    );
    return rows[0];
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir };
