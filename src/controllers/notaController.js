// src/controllers/notaController.js
const fs = require("fs");
const xml2js = require("xml2js");
const db = require("../config/db");
const notaRepo = require("../repositories/notaRepo");
const nfeImportsRepo = require("../repositories/nfe_imports.repository");

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function sanitizeNumber(str = "") {
  return String(str || "").replace(/\D/g, "");
}

async function buscarFornecedorPorCnpj(empresa_id, cnpjLimpo) {
  if (!cnpjLimpo) return null;

  const result = await db
    .query(
      `
      SELECT *
      FROM fornecedores
      WHERE empresa_id = $1
        AND status = 'ativo'
        AND regexp_replace(coalesce(cnpj,''), '\\D', '', 'g') = $2
      LIMIT 1
    `,
      [empresa_id, cnpjLimpo]
    )
    .catch(() => null);

  return result?.rows?.[0] || null;
}

async function sugerirProduto(empresa_id, { codigo, ean, nome }) {
  if (!empresa_id) return null;

  const params = [empresa_id];
  let where = `empresa_id = $1 AND status = 'ativo'`;

  if (codigo) {
    params.push(codigo);
    where += ` AND (codigo = $${params.length}`;
  }
  if (ean) {
    params.push(ean);
    if (codigo) where += ` OR ean = $${params.length}`;
    else where += ` AND (ean = $${params.length}`;
  }
  if (codigo || ean) where += `)`;

  let result = await db.query(
    `
      SELECT id, nome, codigo, ean, unidade AS unidade_medida, valor_unitario
      FROM produtos
      WHERE ${where}
      LIMIT 1
    `,
    params
  );

  if (result.rows[0]) return result.rows[0];

  if (nome) {
    const res2 = await db.query(
      `
        SELECT id, nome, codigo, ean, unidade AS unidade_medida, valor_unitario
        FROM produtos
        WHERE empresa_id = $1
          AND status = 'ativo'
          AND unaccent(lower(nome)) LIKE unaccent(lower($2))
        ORDER BY nome
        LIMIT 1
      `,
      [empresa_id, `%${nome}%`]
    );
    return res2.rows[0] || null;
  }

  return null;
}

// -------------------------------------------------------------
// LISTAR NOTAS
// -------------------------------------------------------------
exports.listarNotas = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const { page, limit, q } = req.query;

    const notas = await notaRepo.buscarTodos(empresa_id, { page, limit, q });
    return res.json(notas);
  } catch (err) {
    console.error("Erro ao listar notas:", err);
    return res.status(500).json({ erro: "Erro ao listar notas." });
  }
};

// -------------------------------------------------------------
// BUSCAR NOTA (cabeçalho + itens)
// -------------------------------------------------------------
exports.buscarNota = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const id = req.params.id;

    const nota = await notaRepo.buscarPorId(id, empresa_id);
    if (!nota) {
      return res.status(404).json({ erro: "Nota não encontrada." });
    }

    const itensResult = await db.query(
      `
        SELECT
          ni.id,
          ni.nota_id,
          ni.produto_id,
          p.nome AS produto_nome,
          ni.quantidade,
          ni.unidade_medida,
          ni.valor_unitario,
          ni.valor_total,
          ni.status,
          ni.criado_em
        FROM nota_itens ni
        LEFT JOIN produtos p ON p.id = ni.produto_id
        WHERE ni.nota_id = $1
        ORDER BY ni.id
      `,
      [id]
    );

    nota.itens = itensResult.rows;
    return res.json(nota);
  } catch (err) {
    console.error("Erro ao buscar nota:", err);
    return res.status(500).json({ erro: "Erro ao buscar nota." });
  }
};

// -------------------------------------------------------------
// CRIAR NOTA (cabeçalho + itens)
// -------------------------------------------------------------
exports.criarNota = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const dados = req.body || {};
    const itens = Array.isArray(dados.itens) ? dados.itens : [];

    const {
      numero_nota,
      serie,
      fornecedor_id,
      data_emissao,
      valor_total,
      chave_acesso,
      inscricao_estadual,
      cnpj_fornecedor,
      razao_social_fornecedor,
      endereco_fornecedor,
      cidade_fornecedor,
      uf_fornecedor,
      icms,
      ipi,
      pis,
      cofins,
      issqn,
    } = dados;

    const notaCriada = await db
      .query(
        `
        INSERT INTO notas (
          empresa_id,
          numero_nota,
          serie,
          fornecedor_id,
          data_emissao,
          valor_total,
          chave_acesso,
          inscricao_estadual,
          cnpj_fornecedor,
          razao_social_fornecedor,
          endereco_fornecedor,
          cidade_fornecedor,
          uf_fornecedor,
          icms,
          ipi,
          pis,
          cofins,
          issqn
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18
        )
        RETURNING *
      `,
        [
          empresa_id,
          numero_nota || null,
          serie || null,
          fornecedor_id || null,
          data_emissao || null,
          valor_total || null,
          chave_acesso || null,
          inscricao_estadual || null,
          cnpj_fornecedor || null,
          razao_social_fornecedor || null,
          endereco_fornecedor || null,
          cidade_fornecedor || null,
          uf_fornecedor || null,
          icms || 0,
          ipi || 0,
          pis || 0,
          cofins || 0,
          issqn || 0,
        ]
      )
      .then((r) => r.rows[0]);

    const itensInseridos = [];
    for (const item of itens) {
      const {
        produto_id,
        quantidade,
        unidade_medida,
        valor_unitario,
        status = "ativo",
      } = item;

      if (!produto_id) continue;

      const rItem = await db.query(
        `
          INSERT INTO nota_itens (
            nota_id,
            produto_id,
            quantidade,
            unidade_medida,
            valor_unitario,
            status
          ) VALUES ($1,$2,$3,$4,$5,$6)
          RETURNING *
        `,
        [
          notaCriada.id,
          produto_id,
          quantidade || 0,
          unidade_medida || "UN",
          valor_unitario || 0,
          status,
        ]
      );

      itensInseridos.push(rItem.rows[0]);

      // atualiza estoque
      await db.query(
        `
          UPDATE produtos
          SET quantidade = coalesce(quantidade,0) + $1,
              atualizado_em = NOW()
          WHERE id = $2
        `,
        [quantidade || 0, produto_id]
      );
    }

    notaCriada.itens = itensInseridos;
    return res.json(notaCriada);
  } catch (err) {
    console.error("Erro ao criar nota:", err);
    return res.status(500).json({ erro: "Erro ao criar nota." });
  }
};

// -------------------------------------------------------------
// ATUALIZAR NOTA (apenas cabeçalho)
// -------------------------------------------------------------
exports.atualizarNota = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const id = req.params.id;
    const dados = req.body || {};

    const {
      numero_nota,
      serie,
      fornecedor_id,
      data_emissao,
      valor_total,
      chave_acesso,
      inscricao_estadual,
      cnpj_fornecedor,
      razao_social_fornecedor,
      endereco_fornecedor,
      cidade_fornecedor,
      uf_fornecedor,
      icms,
      ipi,
      pis,
      cofins,
      issqn,
    } = dados;

    const result = await db.query(
      `
        UPDATE notas SET
          numero_nota = $1,
          serie = $2,
          fornecedor_id = $3,
          data_emissao = $4,
          valor_total = $5,
          chave_acesso = $6,
          inscricao_estadual = $7,
          cnpj_fornecedor = $8,
          razao_social_fornecedor = $9,
          endereco_fornecedor = $10,
          cidade_fornecedor = $11,
          uf_fornecedor = $12,
          icms = $13,
          ipi = $14,
          pis = $15,
          cofins = $16,
          issqn = $17,
          atualizado_em = NOW()
        WHERE id = $18 AND empresa_id = $19
        RETURNING *
      `,
      [
        numero_nota || null,
        serie || null,
        fornecedor_id || null,
        data_emissao || null,
        valor_total || null,
        chave_acesso || null,
        inscricao_estadual || null,
        cnpj_fornecedor || null,
        razao_social_fornecedor || null,
        endereco_fornecedor || null,
        cidade_fornecedor || null,
        uf_fornecedor || null,
        icms || 0,
        ipi || 0,
        pis || 0,
        cofins || 0,
        issqn || 0,
        id,
        empresa_id,
      ]
    );

    const notaAtualizada = result.rows[0];
    if (!notaAtualizada) {
      return res.status(404).json({ erro: "Nota não encontrada." });
    }

    return res.json(notaAtualizada);
  } catch (err) {
    console.error("Erro ao atualizar nota:", err);
    return res.status(500).json({ erro: "Erro ao atualizar nota." });
  }
};

// -------------------------------------------------------------
// EXCLUIR NOTA
// -------------------------------------------------------------
exports.excluirNota = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;
    const id = req.params.id;

    const result = await db.query(
      `
        DELETE FROM notas
        WHERE id = $1 AND empresa_id = $2
        RETURNING *
      `,
      [id, empresa_id]
    );

    const deletada = result.rows[0];
    if (!deletada) {
      return res.status(404).json({ erro: "Nota não encontrada." });
    }

    return res.json(deletada);
  } catch (err) {
    console.error("Erro ao excluir nota:", err);
    return res.status(500).json({ erro: "Erro ao excluir nota." });
  }
};

// -------------------------------------------------------------
// IMPORTAÇÃO DE XML
// -------------------------------------------------------------
exports.importarXml = async (req, res) => {
  try {
    const empresa_id = req.user.empresa_id;

    if (!req.file) {
      return res.status(400).json({ erro: "Nenhum XML enviado." });
    }

    let xml;
    if (req.file.buffer) xml = req.file.buffer.toString("utf8");
    else if (req.file.path) xml = fs.readFileSync(req.file.path, "utf8");
    else return res.status(400).json({ erro: "Não foi possível ler o XML." });

    const parsed = await xml2js.parseStringPromise(xml, {
      explicitArray: false,
      ignoreAttrs: false,
    });

    const nfe = parsed.nfeProc?.NFe?.infNFe || parsed.NFe?.infNFe;
    if (!nfe) return res.status(400).json({ erro: "XML de NF-e inválido." });

    // -------- Cabeçalho --------
    const ide = nfe.ide || {};
    const numero_nota = ide.nNF || "";
    const serie = ide.serie || "";
    const data_emissao = (ide.dhEmi || ide.dEmi || "").substring(0, 10) || null;

    const chave_acesso =
      parsed.nfeProc?.protNFe?.infProt?.chNFe ||
      nfe?.["$"]?.Id?.replace("NFe", "") ||
      "";

    const total = nfe.total?.ICMSTot || {};
    const valor_total = total.vNF || 0;
    const icms = total.vICMS || 0;
    const ipi = total.vIPI || 0;
    const pis = total.vPIS || 0;
    const cofins = total.vCOFINS || 0;
    const issqn = nfe.total?.ISSQNtot?.vISS || 0;

    // -------- Fornecedor (emitente) --------
    const emit = nfe.emit || {};
    const end = emit.enderEmit || {};

    const cnpj_fornecedor = emit.CNPJ || emit.CPF || "";
    const cnpjLimpo = sanitizeNumber(cnpj_fornecedor);

    const razao_social_fornecedor = emit.xNome || "";
    const inscricao_estadual = emit.IE || "";

    const rua_fornecedor = end.xLgr || "";
    const numero_fornecedor = end.nro || "";
    const bairro_fornecedor = end.xBairro || "";
    const cidade_fornecedor = end.xMun || "";
    const uf_fornecedor = end.UF || "";

    let cep_fornecedor = end.CEP || "";
    if (cep_fornecedor && cep_fornecedor.length === 8) {
      cep_fornecedor =
        cep_fornecedor.slice(0, 5) + "-" + cep_fornecedor.slice(5);
    }

    const telefone_fornecedor = end.fone || "";

    const email_fornecedor =
      emit.email ||
      emit.Email ||
      emit.emailEmit ||
      emit.contato?.email ||
      "";

    const endereco_fornecedor = numero_fornecedor
      ? `${rua_fornecedor}, ${numero_fornecedor}`
      : rua_fornecedor;

    const fornecedorExistente = await buscarFornecedorPorCnpj(
      empresa_id,
      cnpjLimpo
    );

    // -------- Itens --------
    const detalhes = Array.isArray(nfe.det) ? nfe.det : [nfe.det];
    const itens = [];

    for (const det of detalhes) {
      const p = det.prod || {};
      const nomeProduto = p.xProd || "";

      const sugestao = await sugerirProduto(empresa_id, {
        codigo: p.cProd,
        ean: p.cEAN || p.cEANTrib,
        nome: nomeProduto,
      });

      itens.push({
        descricao: nomeProduto,
        quantidade: p.qCom || 0,
        unidade_medida: p.uCom || p.uTrib || "UN",
        valor_unitario: p.vUnCom || p.vUnTrib || 0,
        ncm: p.NCM || "",
        cfop: p.CFOP || "",
        ean: p.cEAN || p.cEANTrib || "",
        codigo: p.cProd || "",
        produto_id: sugestao?.id || null,
      });
    }

    // -------- Log de importação (se desejar) --------
    if (chave_acesso) {
      try {
        await nfeImportsRepo.insert(null, {
          access_key: chave_acesso,
          direction: "in",
          xml_raw: xml,
          status: "parsed",
          message: null,
          nota_id: null,
        });
      } catch (e) {
        console.warn("Aviso ao registrar nfe_imports:", e.message);
      }
    }

    const nota = {
      numero_nota,
      serie,
      data_emissao,
      valor_total,
      chave_acesso,
      icms,
      ipi,
      pis,
      cofins,
      issqn,
      razao_social_fornecedor,
      cnpj_fornecedor,
      inscricao_estadual,
      endereco_fornecedor,
      cidade_fornecedor,
      uf_fornecedor,
      rua_fornecedor,
      numero_fornecedor,
      bairro_fornecedor,
      cep_fornecedor,
      telefone_fornecedor,
      email_fornecedor,
    };

    return res.json({
      nota,
      fornecedor: {
        existe: !!fornecedorExistente,
        id: fornecedorExistente?.id || null,
      },
      itens,
    });
  } catch (err) {
    console.error("Erro ao importar XML:", err);
    return res.status(500).json({ erro: "Erro ao importar XML." });
  }
};

// -------------------------------------------------------------
// ITENS DA NOTA
// -------------------------------------------------------------
exports.adicionarItem = async (req, res) => {
  try {
    const notaId = req.params.id;
    const { produto_id, quantidade, unidade_medida, valor_unitario } =
      req.body || {};

    if (!produto_id) {
      return res.status(400).json({ erro: "produto_id é obrigatório." });
    }

    const result = await db.query(
      `
        INSERT INTO nota_itens (
          nota_id,
          produto_id,
          quantidade,
          unidade_medida,
          valor_unitario,
          status
        ) VALUES ($1,$2,$3,$4,$5,'ativo')
        RETURNING *
      `,
      [
        notaId,
        produto_id,
        quantidade || 0,
        unidade_medida || "UN",
        valor_unitario || 0,
      ]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao adicionar item da nota:", err);
    return res.status(500).json({ erro: "Erro ao adicionar item da nota." });
  }
};

exports.atualizarItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { quantidade, unidade_medida, valor_unitario } = req.body || {};

    const result = await db.query(
      `
        UPDATE nota_itens SET
          quantidade = COALESCE($1, quantidade),
          unidade_medida = COALESCE($2, unidade_medida),
          valor_unitario = COALESCE($3, valor_unitario)
        WHERE id = $4
        RETURNING *
      `,
      [quantidade, unidade_medida, valor_unitario, itemId]
    );

    const itemAtualizado = result.rows[0];
    if (!itemAtualizado) {
      return res.status(404).json({ erro: "Item da nota não encontrado." });
    }

    return res.json(itemAtualizado);
  } catch (err) {
    console.error("Erro ao atualizar item da nota:", err);
    return res.status(500).json({ erro: "Erro ao atualizar item da nota." });
  }
};

exports.excluirItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;

    const result = await db.query(
      `
        DELETE FROM nota_itens
        WHERE id = $1
        RETURNING *
      `,
      [itemId]
    );

    const item = result.rows[0];
    if (!item) {
      return res.status(404).json({ erro: "Item da nota não encontrado." });
    }

    return res.json(item);
  } catch (err) {
    console.error("Erro ao excluir item da nota:", err);
    return res.status(500).json({ erro: "Erro ao excluir item da nota." });
  }
};
