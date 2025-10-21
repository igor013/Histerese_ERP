// ====================================================
// 🧾 Histerese ERP - Controller: Notas (com logs)
// ====================================================

const notaRepo = require("../repositories/notaRepo");
const { XMLParser } = require("fast-xml-parser");
const { registrarLog } = require("../repositories/logRepo");

// ============================================================
// CRUD DE NOTAS
// ============================================================

// Criar nota com itens
async function criar(req, res) {
  try {
    const nota = await notaRepo.criar(req.body);

    // 🧾 LOG DE CRIAÇÃO
    try {
      await registrarLog({
        usuario_id: req.user?.id,
        empresa_id: req.user?.empresa_id,
        acao: "CRIAR",
        tabela: "notas",
        registro_id: nota.id,
        descricao: `Nota fiscal nº ${nota.numero || nota.id} criada com sucesso.`,
        ip: req.ip,
      });
    } catch (logErr) {
      console.error("⚠️ Falha ao registrar log de criação de nota:", logErr.message);
    }

    res.status(201).json(nota);
  } catch (err) {
    console.error("Erro ao criar nota:", err);
    res.status(500).json({ erro: err.message });
  }
}

// Listar todas as notas
async function listar(req, res) {
  try {
    const notas = await notaRepo.listar();
    res.json(notas);
  } catch (err) {
    console.error("Erro ao listar notas:", err);
    res.status(500).json({ erro: err.message });
  }
}

// Buscar nota por ID
async function buscarPorId(req, res) {
  try {
    const id = req.params.id;
    const nota = await notaRepo.buscarPorId(id);
    if (!nota) return res.status(404).json({ erro: "Nota não encontrada" });
    res.json(nota);
  } catch (err) {
    console.error("Erro ao buscar nota:", err);
    res.status(500).json({ erro: err.message });
  }
}

// Atualizar cabeçalho da nota
async function atualizar(req, res) {
  try {
    const id = req.params.id;
    const dados = req.body;
    const nota = await notaRepo.atualizar(id, dados);
    if (!nota) return res.status(404).json({ erro: "Nota não encontrada" });

    // 🧾 LOG DE ATUALIZAÇÃO
    try {
      await registrarLog({
        usuario_id: req.user?.id,
        empresa_id: req.user?.empresa_id,
        acao: "EDITAR",
        tabela: "notas",
        registro_id: id,
        descricao: `Nota fiscal ${id} atualizada.`,
        ip: req.ip,
      });
    } catch (logErr) {
      console.error("⚠️ Falha ao registrar log de atualização de nota:", logErr.message);
    }

    res.json(nota);
  } catch (err) {
    console.error("Erro ao atualizar nota:", err);
    res.status(500).json({ erro: err.message });
  }
}

// Excluir nota inteira (ajusta estoque e marca como excluída)
async function excluir(req, res) {
  try {
    const id = req.params.id;
    const nota = await notaRepo.excluir(id);
    if (!nota) return res.status(404).json({ erro: "Nota não encontrada" });

    // 🧾 LOG DE EXCLUSÃO
    try {
      await registrarLog({
        usuario_id: req.user?.id,
        empresa_id: req.user?.empresa_id,
        acao: "EXCLUIR",
        tabela: "notas",
        registro_id: id,
        descricao: `Nota fiscal ${id} marcada como excluída.`,
        ip: req.ip,
      });
    } catch (logErr) {
      console.error("⚠️ Falha ao registrar log de exclusão de nota:", logErr.message);
    }

    res.json({ mensagem: "Nota excluída com sucesso", nota });
  } catch (err) {
    console.error("Erro ao excluir nota:", err);
    res.status(500).json({ erro: err.message });
  }
}

// Excluir item específico da nota
async function excluirItem(req, res) {
  try {
    const itemId = req.params.id;
    const resultado = await notaRepo.excluirItem(itemId);
    if (!resultado) return res.status(404).json({ erro: "Item não encontrado" });

    // 🧾 LOG DE EXCLUSÃO DE ITEM
    try {
      await registrarLog({
        usuario_id: req.user?.id,
        empresa_id: req.user?.empresa_id,
        acao: "EXCLUIR",
        tabela: "nota_itens",
        registro_id: itemId,
        descricao: `Item ${itemId} excluído da nota.`,
        ip: req.ip,
      });
    } catch (logErr) {
      console.error("⚠️ Falha ao registrar log de exclusão de item de nota:", logErr.message);
    }

    res.json(resultado);
  } catch (err) {
    console.error("Erro ao excluir item da nota:", err);
    res.status(500).json({ erro: err.message });
  }
}

// ============================================================
// IMPORTAÇÃO DE XML DE NF-e
// ============================================================
async function importarXml(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: 'Arquivo XML não enviado (campo "file").' });
    }

    const xmlRaw = req.file.buffer.toString("utf-8");
    const xmlSanitizado = xmlRaw
      .replace(/<\?xml.*?\?>/, "")
      .replace(/xmlns(:\w+)?="[^"]*"/g, "")
      .replace(/ns\d*:/g, "");

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      allowBooleanAttributes: true,
      parseAttributeValue: true,
      parseTagValue: true,
      trimValues: true,
    });

    const parsed = parser.parse(xmlSanitizado);
    const resultado = await notaRepo.importarXml(parsed, xmlRaw);

    // 🧾 LOG DE IMPORTAÇÃO XML
    try {
      await registrarLog({
        usuario_id: req.user?.id,
        empresa_id: req.user?.empresa_id,
        acao: "IMPORTAR",
        tabela: "notas",
        descricao: `XML de nota importado com sucesso (${req.file.originalname}).`,
        ip: req.ip,
      });
    } catch (logErr) {
      console.error("⚠️ Falha ao registrar log de importação XML:", logErr.message);
    }

    res.status(201).json(resultado);
  } catch (err) {
    console.error("Erro ao importar XML:", err);
    res.status(500).json({ erro: err.message });
  }
}

// ============================================================
// EXPORTAÇÃO
// ============================================================
module.exports = {
  criar,
  listar,
  buscarPorId,
  atualizar,
  excluir,
  excluirItem,
  importarXml,
};
