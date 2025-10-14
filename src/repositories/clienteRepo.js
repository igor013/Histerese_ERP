// src/repositories/clienteRepo.js
const { pool } = require("../config/db");

// Criar cliente
async function criarCliente({ nome, empresa, rua, bairro, numero, cidade, complemento, telefone }) {
    const query = `
    INSERT INTO clientes (nome, empresa, rua, bairro, numero, cidade, complemento, telefone)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
  `;
    const values = [nome, empresa, rua, bairro, numero, cidade, complemento, telefone];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

// Listar clientes
async function listarClientes() {
    const { rows } = await pool.query("SELECT * FROM clientes WHERE status = 'ativo' ORDER BY id DESC");
    return rows;
}

// Atualizar cliente
async function atualizarCliente(id, dados) {
    const { nome, empresa, rua, bairro, numero, cidade, complemento, telefone } = dados;
    const query = `
    UPDATE clientes
    SET nome=$1, empresa=$2, rua=$3, bairro=$4, numero=$5, cidade=$6, complemento=$7, telefone=$8
    WHERE id=$9
    RETURNING *;
  `;
    const values = [nome, empresa, rua, bairro, numero, cidade, complemento, telefone, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

// Exclusão lógica
async function excluirCliente(id) {
    const { rows } = await pool.query("UPDATE clientes SET status='excluido' WHERE id=$1 RETURNING *", [id]);
    return rows[0];
}

module.exports = { criarCliente, listarClientes, atualizarCliente, excluirCliente };
