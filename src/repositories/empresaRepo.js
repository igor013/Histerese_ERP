const { pool } = require("../config/db");

async function criar({ nome }) {
    const query = `INSERT INTO empresa (nome) VALUES ($1) RETURNING *`;
    const values = [nome];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

async function listar() {
    const { rows } = await pool.query("SELECT * FROM empresa WHERE status='ativo'");
    return rows;
}

async function atualizar(id, { nome }) {
    const query = `UPDATE empresa SET nome=$1 WHERE id=$2 RETURNING *`;
    const values = [nome, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

module.exports = { criar, listar, atualizar };
