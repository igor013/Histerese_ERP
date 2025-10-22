// ====================================================
// 👤 Histerese ERP - Repository: Usuários (versão final estável)
// ====================================================

const db = require("../config/db");

// ====================================================
// ➕ Criar novo usuário
// ====================================================
async function criar({ nome, login, senha_hash, empresa_id }) {
  const query = `
        INSERT INTO usuarios (nome, login, senha, empresa_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, nome, login, empresa_id, status, criado_em;
    `;
  const values = [nome, login, senha_hash, empresa_id];
  const { rows } = await db.query(query, values);
  return rows[0];
}

// ====================================================
// 🔍 Buscar usuário por login (dentro da mesma empresa)
// ====================================================
async function buscarPorLogin(login, empresa_id) {
  const query = `
        SELECT * FROM usuarios
        WHERE login = $1 AND empresa_id = $2
        LIMIT 1;
    `;
  const values = [login, empresa_id];
  const { rows } = await db.query(query, values);
  return rows[0];
}

// ====================================================
// 📋 Listar usuários (filtrados por empresa)
// ====================================================
async function listar(empresa_id) {
  const query = `
        SELECT id, nome, login, empresa_id, status, criado_em, atualizado_em
        FROM usuarios
        WHERE empresa_id = $1 AND status != 'excluido'
        ORDER BY id ASC;
    `;
  const { rows } = await db.query(query, [empresa_id]);
  return rows;
}

// ====================================================
// 🔍 Buscar usuário por ID
// ====================================================
async function buscarPorId(id) {
  const query = `
        SELECT id, nome, login, empresa_id, status, criado_em, atualizado_em
        FROM usuarios
        WHERE id = $1;
    `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
}

// ====================================================
// ✏️ Atualizar usuário
// ====================================================
async function atualizar(id, { nome, login, senha_hash }) {
  const campos = [];
  const valores = [];
  let i = 1;

  if (nome) {
    campos.push(`nome = $${i++}`);
    valores.push(nome);
  }
  if (login) {
    campos.push(`login = $${i++}`);
    valores.push(login);
  }
  if (senha_hash) {
    campos.push(`senha = $${i++}`);
    valores.push(senha_hash);
  }

  if (campos.length === 0) return null;

  const query = `
        UPDATE usuarios
        SET ${campos.join(", ")}, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $${i}
        RETURNING id, nome, login, empresa_id, status, atualizado_em;
    `;
  valores.push(id);

  const { rows } = await db.query(query, valores);
  return rows[0];
}

// ====================================================
// 🗑️ Exclusão lógica
// ====================================================
async function excluir(id) {
  const query = `
        UPDATE usuarios
        SET status = 'excluido', atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, nome, login, empresa_id, status;
    `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
}

// ====================================================
// 🔁 Atualizar status
// ====================================================
async function atualizarStatus(id, status) {
  const query = `
        UPDATE usuarios
        SET status = $1, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, nome, login, empresa_id, status;
    `;
  const { rows } = await db.query(query, [status, id]);
  return rows[0];
}

// ====================================================
// 📦 Exportação
// ====================================================
module.exports = {
  criar,
  buscarPorLogin,
  listar,
  buscarPorId,
  atualizar,
  excluir,
  atualizarStatus
};
