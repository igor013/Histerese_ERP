const notaRepo = require("../repositories/notaRepo");

// Criar nota com itens
async function criar(req, res) {
  try {
    const nota = await notaRepo.criar(req.body);
    res.status(201).json(nota);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

// Listar todas as notas
async function listar(req, res) {
  try {
    const notas = await notaRepo.listar();
    res.json(notas);
  } catch (err) {
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
    res.status(500).json({ erro: err.message });
  }
}

module.exports = { criar, listar, buscarPorId, atualizar, excluir, excluirItem };
