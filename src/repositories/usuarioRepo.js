// src/repositories/usuarioRepo.js
const { pool } = require("../config/db");

// Criar usuário
async function criar({ nome, login, senha_hash }) {
  const loginMaiusculo = login.trim().toUpperCase();

  const query = `
    INSERT INTO usuarios (nome, login, senha, status, criado_em, atualizado_em)
    VALUES ($1, $2, $3, 'ativo', NOW(), NOW())
    RETURNING id, nome, login, status;
  `;
  const values = [nome, loginMaiusculo, senha_hash];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

// Listar todos os usuários ativos
async function listar() {
  const { rows } = await pool.query(`
    SELECT id, nome, login, status, criado_em, atualizado_em
    FROM usuarios
    WHERE status != 'excluido'
    ORDER BY id ASC
  `);
  return rows;
}

// Buscar por ID
async function buscarPorId(id) {
  const { rows } = await pool.query(
    "SELECT id, nome, login, status, criado_em, atualizado_em FROM usuarios WHERE id=$1",
    [id]
  );
  return rows[0];
}

// Buscar por login (qualquer status)
async function buscarPorLogin(login) {
  const loginMaiusculo = login.trim().toUpperCase();

  const { rows } = await pool.query("SELECT * FROM usuarios WHERE login=$1", [loginMaiusculo]);
  return rows[0];
}

// Atualizar dados do usuário
async function atualizar(id, { nome, login, senha_hash }) {
  const loginMaiusculo = login ? login.trim().toUpperCase() : null;

  const query = `
    UPDATE usuarios
    SET nome = $1,
        login = COALESCE($2, login),
        senha = COALESCE($3, senha),
        atualizado_em = NOW()
    WHERE id = $4
    RETURNING id, nome, login, status, atualizado_em;
  `;
  const values = [nome, loginMaiusculo, senha_hash, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

// Exclusão lógica (status = 'excluido')
async function excluir(id) {
  const { rows } = await pool.query(
    `UPDATE usuarios
     SET status='excluido', atualizado_em = NOW()
     WHERE id=$1
     RETURNING id, nome, login, status;`,
    [id]
  );
  return rows[0];
}

// Alterar status manualmente (ex: reativar)
async function atualizarStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE usuarios
     SET status=$1, atualizado_em = NOW()
     WHERE id=$2
     RETURNING id, nome, login, status, atualizado_em;`,
    [status, id]
  );
  return rows[0];
}

module.exports = {
  criar,
  listar,
  buscarPorId,
  buscarPorLogin,
  atualizar,
  excluir,
  atualizarStatus
};
