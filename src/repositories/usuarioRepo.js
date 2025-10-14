const { pool } = require("../config/db");

// Criar usuário
async function criar({ nome, login, senha }) {
  const query = `
    INSERT INTO usuarios (nome, login, senha)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [nome, login, senha];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

// Listar
async function listar() {
  const { rows } = await pool.query("SELECT * FROM usuarios WHERE status='ativo'");
  return rows;
}

// Buscar por ID
async function buscarPorId(id) {
  const { rows } = await pool.query("SELECT * FROM usuarios WHERE id=$1 AND status='ativo'", [id]);
  return rows[0];
}

// Atualizar
async function atualizar(id, { nome, login, senha }) {
  const query = `
    UPDATE usuarios
    SET nome=$1, login=$2, senha=$3
    WHERE id=$4
    RETURNING *;
  `;
  const values = [nome, login, senha, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

// Exclusão lógica
async function excluir(id) {
  const { rows } = await pool.query("UPDATE usuarios SET status='excluido' WHERE id=$1 RETURNING *", [id]);
  return rows[0];
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir };
