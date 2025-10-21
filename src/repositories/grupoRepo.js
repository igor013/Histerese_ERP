const  pool  = require("../config/db");

async function criar({ nome }) {
    const { rows } = await pool.query(
        "INSERT INTO grupos (nome) VALUES ($1) RETURNING *",
        [nome]
    );
    return rows[0];
}

async function listar() {
    const { rows } = await pool.query("SELECT * FROM grupos WHERE status='ativo' ORDER BY id DESC");
    return rows;
}

async function buscarPorId(id) {
    const { rows } = await pool.query(
        "SELECT * FROM grupos WHERE id=$1 AND status='ativo'",
        [id]
    );
    return rows[0];
}

async function atualizar(id, { nome }) {
    const { rows } = await pool.query(
        "UPDATE grupos SET nome=$1 WHERE id=$2 RETURNING *",
        [nome, id]
    );
    return rows[0];
}

async function excluir(id) {
    const { rows } = await pool.query(
        "UPDATE grupos SET status='excluido' WHERE id=$1 RETURNING *",
        [id]
    );
    return rows[0];
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir };
