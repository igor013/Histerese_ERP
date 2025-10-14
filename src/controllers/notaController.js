const notaRepo = require("../repositories/notaRepo");
const { XMLParser } = require("fast-xml-parser");

// ============================================================
// CRUD DE NOTAS
// ============================================================

// Criar nota com itens
async function criar(req, res) {
  try {
    const nota = await notaRepo.criar(req.body);
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
    res.json(resultado);
  } catch (err) {
    console.error("Erro ao excluir item da nota:", err);
    res.status(500).json({ erro: err.message });
  }
}

// ============================================================
// IMPORTAÇÃO DE XML DE NF-e (corrigido com namespaces)
// ============================================================
async function importarXml(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: 'Arquivo XML não enviado (campo "file").' });
    }

    const xmlRaw = req.file.buffer.toString("utf-8");

    // Corrige namespaces problemáticos antes de parsear
    const xmlSanitizado = xmlRaw
      .replace(/<\?xml.*?\?>/, "") // remove cabeçalho XML
      .replace(/xmlns(:\w+)?="[^"]*"/g, "") // remove namespaces
      .replace(/ns\d*:/g, ""); // remove prefixos tipo ns2:, ns3:

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      allowBooleanAttributes: true,
      parseAttributeValue: true,
      parseTagValue: true,
      trimValues: true,
    });

    const parsed = parser.parse(xmlSanitizado);

    // Passa XML para o repositório
    const resultado = await notaRepo.importarXml(parsed, xmlRaw);

    res.status(201).json(resultado);
  } catch (err) {
    console.error("Erro ao importar XML:", err);
    res.status(500).json({ erro: err.message });
  }
}


// ============================================================
// EXPORTAÇÃO DAS FUNÇÕES
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
