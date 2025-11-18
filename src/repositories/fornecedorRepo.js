const pool = require("../config/db");

// Criar fornecedor
async function criar(dados) {
  const query = `
    INSERT INTO fornecedores (
      empresa_id, tipo_pessoa, razao_social, nome_fantasia, cnpj_cpf,
      inscricao_estadual, inscricao_municipal, data_abertura, contato_responsavel,
      cep, rua, numero, complemento, bairro, cidade, estado, pais,
      telefone, celular, email, email_nfe, site, observacoes, status, criado_em, atualizado_em
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,
      $10,$11,$12,$13,$14,$15,$16,$17,
      $18,$19,$20,$21,$22,$23,'ativo',NOW(),NOW()
    )
    RETURNING *;
  `;

  const values = [
    dados.empresa_id,
    dados.tipo_pessoa,
    dados.razao_social,
    dados.nome_fantasia,
    dados.cnpj_cpf,
    dados.inscricao_estadual,
    dados.inscricao_municipal,
    dados.data_abertura,
    dados.contato_responsavel,
    dados.cep,
    dados.rua,
    dados.numero,
    dados.complemento,
    dados.bairro,
    dados.cidade,
    dados.estado,
    dados.pais,
    dados.telefone,
    dados.celular,
    dados.email,
    dados.email_nfe,
    dados.site,
    dados.observacoes,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

// Listar fornecedores ativos
async function listar(empresa_id) {
  const { rows } = await pool.query(
    `SELECT * FROM fornecedores WHERE empresa_id = $1 AND status = 'ativo' ORDER BY razao_social ASC`,
    [empresa_id]
  );
  return rows;
}

// Buscar por ID
async function buscarPorId(id, empresa_id) {
  const { rows } = await pool.query(
    `SELECT * FROM fornecedores WHERE id = $1 AND empresa_id = $2 AND status = 'ativo'`,
    [id, empresa_id]
  );
  return rows[0];
}

// Atualizar fornecedor
async function atualizar(id, empresa_id, dados) {
  // 🔧 Garante que 'atualizado_em' não cause conflito
  delete dados.atualizado_em;
  delete dados.criado_em;
  delete dados.empresa_id;
  delete dados.status;
  delete dados.id;

  const campos = Object.keys(dados);
  const valores = Object.values(dados);

  if (campos.length === 0) {
    throw new Error("Nenhum campo para atualizar.");
  }

  const set = campos.map((campo, i) => `${campo} = $${i + 1}`).join(", ");
  const query = `
    UPDATE fornecedores 
    SET ${set}, atualizado_em = NOW()
    WHERE id = $${campos.length + 1} AND empresa_id = $${campos.length + 2}
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [...valores, id, empresa_id]);
  return rows[0];
}

// Exclusão lógica
async function excluir(id, empresa_id) {
  const { rows } = await pool.query(
    `UPDATE fornecedores SET status = 'excluido', atualizado_em = NOW() WHERE id = $1 AND empresa_id = $2 RETURNING *`,
    [id, empresa_id]
  );
  return rows[0];
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir };
