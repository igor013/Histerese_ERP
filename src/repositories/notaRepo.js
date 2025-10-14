const { pool } = require("../config/db");

// Criar nota com itens
async function criar({ numero, fornecedor_id, data_emissao, valor_total, itens }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Inserir nota
    const notaQuery = `
      INSERT INTO notas_fiscais (numero, fornecedor_id, data_emissao, valor_total)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows: notaRows } = await client.query(notaQuery, [numero, fornecedor_id, data_emissao, valor_total]);
    const nota = notaRows[0];

    // Inserir itens e atualizar estoque
    for (const item of itens) {
      const itemQuery = `
        INSERT INTO nota_itens (nota_id, produto_id, quantidade, unidade_medida, valor_unitario)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      await client.query(itemQuery, [nota.id, item.produto_id, item.quantidade, item.unidade_medida, item.valor_unitario]);

      // Atualizar estoque
      await client.query(
        `UPDATE produtos SET quantidade = quantidade + $1 WHERE id = $2`,
        [item.quantidade, item.produto_id]
      );
    }

    await client.query("COMMIT");
    return nota;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Listar todas as notas
async function listar() {
  const { rows } = await pool.query(`
    SELECT n.*, f.nome AS fornecedor_nome
    FROM notas_fiscais n
    LEFT JOIN fornecedores f ON n.fornecedor_id = f.id
    WHERE n.status='ativo'
    ORDER BY n.id DESC
  `);
  return rows;
}

// Buscar nota + itens
async function buscarPorId(id) {
  const { rows: notaRows } = await pool.query(
    "SELECT * FROM notas_fiscais WHERE id=$1 AND status='ativo'",
    [id]
  );
  if (notaRows.length === 0) return null;

  const { rows: itens } = await pool.query(
    "SELECT * FROM nota_itens WHERE nota_id=$1 AND status='ativo'",
    [id]
  );

  return { ...notaRows[0], itens };
}

// Atualizar nota (só cabeçalho)
async function atualizar(id, { numero, fornecedor_id, data_emissao, valor_total }) {
  const query = `
    UPDATE notas_fiscais
    SET numero=$1, fornecedor_id=$2, data_emissao=$3, valor_total=$4
    WHERE id=$5
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [numero, fornecedor_id, data_emissao, valor_total, id]);
  return rows[0];
}

// Exclusão lógica de nota inteira + ajuste de estoque
async function excluir(id) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Buscar os itens da nota
    const { rows: itens } = await client.query(
      "SELECT produto_id, quantidade FROM nota_itens WHERE nota_id=$1 AND status='ativo'",
      [id]
    );

    // Subtrair do estoque cada item
    for (const item of itens) {
      await client.query(
        "UPDATE produtos SET quantidade = quantidade - $1 WHERE id = $2",
        [item.quantidade, item.produto_id]
      );
    }

    // Marcar itens e nota como excluídos
    await client.query("UPDATE nota_itens SET status='excluido' WHERE nota_id=$1", [id]);
    const { rows } = await client.query(
      "UPDATE notas_fiscais SET status='excluido' WHERE id=$1 RETURNING *",
      [id]
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Exclusão lógica de um item da nota + ajuste de estoque + exclusão automática da nota se esvaziar
async function excluirItem(itemId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Buscar item
    const { rows: itens } = await client.query(
      "SELECT nota_id, produto_id, quantidade FROM nota_itens WHERE id=$1 AND status='ativo'",
      [itemId]
    );

    if (itens.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const item = itens[0];

    // Ajustar estoque (remover quantidade)
    await client.query(
      "UPDATE produtos SET quantidade = quantidade - $1 WHERE id=$2",
      [item.quantidade, item.produto_id]
    );

    // Marcar item como excluído
    await client.query("UPDATE nota_itens SET status='excluido' WHERE id=$1", [itemId]);

    // Recalcular o total da nota
    const { rows: soma } = await client.query(
      `SELECT COALESCE(SUM(valor_total), 0) AS total
       FROM nota_itens
       WHERE nota_id=$1 AND status='ativo'`,
      [item.nota_id]
    );

    const novoTotal = parseFloat(soma[0].total || 0);

    await client.query("UPDATE notas_fiscais SET valor_total=$1 WHERE id=$2", [
      novoTotal,
      item.nota_id,
    ]);

    // Se não houver mais itens ativos, marcar a nota como excluída
    const { rows: itensAtivos } = await client.query(
      "SELECT COUNT(*) FROM nota_itens WHERE nota_id=$1 AND status='ativo'",
      [item.nota_id]
    );

    if (parseInt(itensAtivos[0].count) === 0) {
      await client.query("UPDATE notas_fiscais SET status='excluido' WHERE id=$1", [
        item.nota_id,
      ]);
    }

    await client.query("COMMIT");
    return { mensagem: "Item excluído e nota atualizada com sucesso" };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Reduzir quantidade de um item (qualquer valor positivo menor que a atual)
async function reduzirItem(itemId, qtdAReduzir) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Buscar o item atual
    const { rows: itens } = await client.query(
      "SELECT nota_id, produto_id, quantidade, valor_unitario FROM nota_itens WHERE id=$1 AND status='ativo'",
      [itemId]
    );

    if (itens.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const item = itens[0];
    const novaQtd = item.quantidade - qtdAReduzir;

    // Validações
    if (qtdAReduzir <= 0) throw new Error("A quantidade a reduzir deve ser maior que zero");
    if (novaQtd < 0) throw new Error("Não é possível reduzir além da quantidade existente");

    // Atualizar a quantidade e o valor_total do item
    await client.query(
      `UPDATE nota_itens
       SET quantidade=$1, valor_total=($1 * valor_unitario)
       WHERE id=$2`,
      [novaQtd, itemId]
    );

    // Ajustar o estoque do produto
    await client.query("UPDATE produtos SET quantidade = quantidade - $1 WHERE id=$2", [
      qtdAReduzir,
      item.produto_id,
    ]);

    // Recalcular o valor total da nota
    const { rows: soma } = await client.query(
      `SELECT COALESCE(SUM(valor_total), 0) AS total
       FROM nota_itens
       WHERE nota_id=$1 AND status='ativo'`,
      [item.nota_id]
    );

    const novoTotal = parseFloat(soma[0].total || 0);
    await client.query("UPDATE notas_fiscais SET valor_total=$1 WHERE id=$2", [
      novoTotal,
      item.nota_id,
    ]);

    await client.query("COMMIT");
    return {
      item_id: itemId,
      quantidade_reduzida: qtdAReduzir,
      nova_quantidade: novaQtd,
      novo_total_nota: novoTotal,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  criar,
  listar,
  buscarPorId,
  atualizar,
  excluir,
  excluirItem,
  reduzirItem,
};
