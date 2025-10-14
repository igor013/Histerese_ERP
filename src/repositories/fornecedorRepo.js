const { pool } = require("../config/db");

// Criar fornecedor
async function criar({ nome, bairro, rua, numero, cidade, estado, email, telefone, site }) {
    const query = `
    INSERT INTO fornecedores (nome, bairro, rua, numero, cidade, estado, email, telefone, site)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *;
  `;
    const values = [nome, bairro, rua, numero, cidade, estado, email, telefone, site];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

// Listar fornecedores ativos
async function listar() {
    const { rows } = await pool.query(`
    SELECT * FROM fornecedores
    WHERE status = 'ativo'
    ORDER BY id DESC
  `);
    return rows;
}

// Buscar por ID (apenas ativos)
async function buscarPorId(id) {
    const { rows } = await pool.query(
        "SELECT * FROM fornecedores WHERE id=$1 AND status='ativo'",
        [id]
    );
    return rows[0];
}

// Atualizar
async function atualizar(id, { nome, bairro, rua, numero, cidade, estado, email, telefone, site }) {
    const query = `
    UPDATE fornecedores
    SET nome=$1, bairro=$2, rua=$3, numero=$4, cidade=$5, estado=$6,
        email=$7, telefone=$8, site=$9
    WHERE id=$10
    RETURNING *;
  `;
    const values = [nome, bairro, rua, numero, cidade, estado, email, telefone, site, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

// Exclusão lógica
async function excluir(id) {
    const { rows } = await pool.query(
        "UPDATE fornecedores SET status='excluido' WHERE id=$1 RETURNING *",
        [id]
    );
    return rows[0];
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir };
