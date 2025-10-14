const { pool } = require("../config/db");

// ============================================================
// FUNÇÕES ORIGINAIS
// ============================================================

// Criar nota com itens
async function criar({ numero, fornecedor_id, data_emissao, valor_total, itens }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Inserir nota
    const notaQuery = `
      INSERT INTO notas_fiscais (numero, fornecedor_id, data_emissao, valor_total, status)
      VALUES ($1, $2, $3, $4, 'ativo')
      RETURNING *;
    `;
    const { rows: notaRows } = await client.query(notaQuery, [
      numero,
      fornecedor_id,
      data_emissao,
      valor_total,
    ]);
    const nota = notaRows[0];

    // Inserir itens e atualizar estoque
    for (const item of itens) {
      const itemQuery = `
        INSERT INTO nota_itens (nota_id, produto_id, quantidade, unidade_medida, valor_unitario, status)
        VALUES ($1, $2, $3, $4, $5, 'ativo')
        RETURNING *;
      `;
      await client.query(itemQuery, [
        nota.id,
        item.produto_id,
        item.quantidade,
        item.unidade_medida,
        item.valor_unitario,
      ]);

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
  const { rows } = await pool.query(query, [
    numero,
    fornecedor_id,
    data_emissao,
    valor_total,
    id,
  ]);
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

    if (qtdAReduzir <= 0) throw new Error("A quantidade a reduzir deve ser maior que zero");
    if (novaQtd < 0) throw new Error("Não é possível reduzir além da quantidade existente");

    await client.query(
      `UPDATE nota_itens
       SET quantidade=$1, valor_total=($1 * valor_unitario)
       WHERE id=$2`,
      [novaQtd, itemId]
    );

    await client.query("UPDATE produtos SET quantidade = quantidade - $1 WHERE id=$2", [
      qtdAReduzir,
      item.produto_id,
    ]);

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

// ============================================================
// IMPORTAR XML DE NF-e
// ============================================================
async function importarXml(parsedXml, xmlRaw) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const nfe = parsedXml?.nfeProc?.NFe || parsedXml?.NFe;
    if (!nfe) throw new Error("XML inválido: estrutura <NFe> não encontrada.");

    const infNFe = nfe.infNFe || nfe["infNFe"];
    const ide = infNFe.ide;
    const emit = infNFe.emit;
    const dest = infNFe.dest;
    const itens = Array.isArray(infNFe.det) ? infNFe.det : [infNFe.det];
    const total = infNFe.total?.ICMSTot;

    // Chave da nota
    const chave = infNFe["@_Id"]?.replace(/^NFe/, "") || "sem_chave";

    // Verifica duplicidade
    const existe = await client.query(
      "SELECT id FROM notas_fiscais WHERE chave_acesso=$1",
      [chave]
    );
    if (existe.rows.length > 0) {
      await client.query("ROLLBACK");
      return { status: "skipped", access_key: chave };
    }

    // Cria fornecedor se necessário
    let fornecedor_id = null;
    if (emit?.CNPJ) {
      const { rows } = await client.query(
        "SELECT id FROM fornecedores WHERE cnpj=$1",
        [emit.CNPJ]
      );
      if (rows.length > 0) {
        fornecedor_id = rows[0].id;
      } else {
        const insertFornecedor = await client.query(
          "INSERT INTO fornecedores (nome, cnpj, status) VALUES ($1, $2, 'ativo') RETURNING id",
          [emit.xNome, emit.CNPJ]
        );
        fornecedor_id = insertFornecedor.rows[0].id;
      }
    }

    // Insere nota
    const insertNota = await client.query(
      `INSERT INTO notas_fiscais 
        (chave_acesso, modelo, serie, numero, fornecedor_id, data_emissao, tipo_operacao, cnpj_emitente, cnpj_destinatario, valor_total, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'ativo')
       RETURNING id`,
      [
        chave,
        ide.mod,
        ide.serie,
        ide.nNF,
        fornecedor_id,
        ide.dhEmi,
        ide.tpNF === "0" ? 0 : 1, // 0=entrada, 1=saída
        emit.CNPJ,
        dest?.CNPJ || dest?.CPF || null,
        parseFloat(total?.vNF || 0),
      ]
    );

    const nota_id = insertNota.rows[0].id;

    // Insere itens da nota
    for (const det of itens) {
      const prod = det.prod;
      if (!prod?.cProd) continue;

      // Garante produto no banco
      let produto_id;
      const busca = await client.query("SELECT id FROM produtos WHERE codigo=$1", [prod.cProd]);
      if (busca.rows.length > 0) {
        produto_id = busca.rows[0].id;
      } else {
        // --- GARANTE EXISTÊNCIA DO GRUPO PADRÃO "Importados NF-e" ---
        let grupo_id;
        const grupo = await client.query("SELECT id FROM grupos WHERE nome = 'Importados NF-e'");
        if (grupo.rows.length > 0) {
          grupo_id = grupo.rows[0].id;
        } else {
          const novoGrupo = await client.query(
            "INSERT INTO grupos (nome, status) VALUES ('Importados NF-e', 'ativo') RETURNING id"
          );
          grupo_id = novoGrupo.rows[0].id;
        }

        // --- INSERE PRODUTO (com grupo_id garantido) ---
        const insertProd = await client.query(
          `INSERT INTO produtos (codigo, nome, ncm, unidade, quantidade, valor_unitario, grupo_id, status)
   VALUES ($1,$2,$3,$4,$5,$6,$7,'ativo') RETURNING id`,
          [
            prod.cProd,
            prod.xProd,
            prod.NCM,
            prod.uCom,
            parseFloat(prod.qCom || 0),
            parseFloat(prod.vUnCom || 0),
            grupo_id, // <-- aqui está o segredo
          ]
        );

        produto_id = insertProd.rows[0].id;
      }

      // Cria item da nota
      await client.query(
        `INSERT INTO nota_itens (nota_id, produto_id, quantidade, unidade_medida, valor_unitario, status)
         VALUES ($1,$2,$3,$4,$5,'ativo')`,
        [
          nota_id,
          produto_id,
          parseFloat(prod.qCom || 0),
          prod.uCom,
          parseFloat(prod.vUnCom || 0),
        ]
      );

      // Atualiza estoque
      await client.query(
        "UPDATE produtos SET quantidade = quantidade + $1 WHERE id=$2",
        [parseFloat(prod.qCom || 0), produto_id]
      );
    }

    await client.query("COMMIT");
    return { status: "imported", access_key: chave };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro em importarXml:", err);
    throw err;
  } finally {
    client.release();
  }
}


// ============================================================
// EXPORTA TUDO
// ============================================================
module.exports = {
  criar,
  listar,
  buscarPorId,
  atualizar,
  excluir,
  excluirItem,
  reduzirItem,
  importarXml,
};
