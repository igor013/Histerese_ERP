// src/repositories/usuarioRepo.js
const pool = require("../config/db");

// ====================================================
// ➕ Criar usuário
// ====================================================
async function criar({ nome, login, senha_hash, empresa_id }) {
  const query = `
        INSERT INTO usuarios (nome, login, senha, empresa_id, status, criado_em, atualizado_em)
        VALUES ($1, $2, $3, $4, 'ativo', NOW(), NOW())
        RETURNING *;
    `;
  const values = [nome, login, senha_hash, empresa_id];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

// ====================================================
// 🔍 Buscar por login (compatível com login antigo)
// ====================================================
async function buscarPorLogin(login, empresa_id) {
  let query = `
        SELECT id, nome, login, senha, empresa_id, status
        FROM usuarios
        WHERE UPPER(login) = UPPER($1)
    `;
  const params = [login];
  if (empresa_id) {
    query += " AND empresa_id = $2";
    params.push(empresa_id);
  }

  const { rows } = await pool.query(query, params);
  return rows[0];
}

// ====================================================
// 🔍 Buscar por ID
// ====================================================
async function buscarPorId(id) {
  const { rows } = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);
  return rows[0];
}

// ====================================================
// 📋 Listar usuários (com filtro e empresa)
// ====================================================
async function listar(empresa_id, filtro = "") {
  const search = `%${filtro}%`;
  const query = `
        SELECT id, nome, login, empresa_id, status, criado_em, atualizado_em
        FROM usuarios
        WHERE empresa_id = $1
        AND status = 'ativo'
        AND (unaccent(nome) ILIKE unaccent($2) OR unaccent(login) ILIKE unaccent($2))
        ORDER BY id DESC;
    `;
  const { rows } = await pool.query(query, [empresa_id, search]);
  return rows;
}

// ====================================================
// ✏️ Atualizar usuário
// ====================================================
async function atualizar(id, dados) {
  const campos = [];
  const valores = [];
  let i = 0;

  for (const [chave, valor] of Object.entries(dados)) {
    i++;
    campos.push(`${chave} = $${i}`);
    valores.push(valor);
  }

  valores.push(id);

  const sql = `
        UPDATE usuarios
        SET ${campos.join(", ")}, atualizado_em = NOW()
        WHERE id = $${i + 1}
        RETURNING *;
    `;

  const { rows } = await pool.query(sql, valores);
  return rows[0];
}

// ====================================================
// 🗑️ Exclusão lógica
// ====================================================
async function excluir(id) {
  const { rows } = await pool.query(
    `UPDATE usuarios SET status = 'inativo', atualizado_em = NOW() WHERE id = $1 RETURNING *;`,
    [id]
  );
  return rows[0];
}

module.exports = {
  criar,
  buscarPorLogin,
  buscarPorId,
  listar,
  atualizar,
  excluir,
};
