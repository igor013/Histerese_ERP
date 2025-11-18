// ====================================================
// 🧾 Histerese ERP - Controller: Produtos (com logs e multi-empresa)
// ====================================================

const produtoRepo = require("../repositories/produtoRepo");
const { registrarLog } = require("../repositories/logRepo");

// ====================================================
// ➕ Criar produto
// ====================================================
async function criar(req, res) {
  try {
    const empresa_id = req.user?.empresa_id;
    if (!empresa_id)
      return res.status(401).json({ erro: "Empresa não identificada." });

    const payload = { ...req.body, empresa_id };

    const produto = await produtoRepo.criar(payload);

    // 🧾 LOG DE CRIAÇÃO
    try {
      await registrarLog({
        usuario_id: req.user?.id,
        empresa_id,
        acao: "CRIAR",
        tabela: "produtos",
        registro_id: produto.id,
        descricao: `Produto '${produto.nome}' criado com sucesso.`,
        ip: req.ip,
      });
    } catch (logErr) {
      console.error("⚠️ Falha ao registrar log de criação de produto:", logErr.message);
    }

    res.status(201).json(produto);
  } catch (err) {
    console.error("❌ ERRO EM /api/produtos (CRIAR):", err);
    res.status(500).json({ erro: err.message });
  }
}

// ====================================================
// 📋 Listar produtos com busca e paginação
// ====================================================
async function listar(req, res) {
  try {
    const empresa_id = req.user?.empresa_id;
    if (!empresa_id)
      return res.status(401).json({ erro: "Empresa não identificada." });

    const q = req.query.q || null;
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const offset = (page - 1) * limit;
    const status = (req.query.status || 'ativo').toLowerCase(); // 'ativo' | 'inativo' | 'todos'

    const [items, total] = await Promise.all([
      produtoRepo.listar({ empresa_id, q, limit, offset, status }),
      produtoRepo.contar({ empresa_id, q, status }),
    ]);

    res.json({
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("❌ ERRO EM /api/produtos (LISTAR):", err);
    res.status(500).json({ erro: err.message });
  }
}

// ====================================================
// 🔍 Buscar produto por ID
// ====================================================
async function buscarPorId(req, res) {
  try {
    const empresa_id = req.user?.empresa_id;
    if (!empresa_id)
      return res.status(401).json({ erro: "Empresa não identificada." });

    const produto = await produtoRepo.buscarPorId(req.params.id, empresa_id);
    if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });

    res.json(produto);
  } catch (err) {
    console.error("❌ ERRO EM /api/produtos/:id (BUSCAR):", err);
    res.status(500).json({ erro: err.message });
  }
}

// ====================================================
// ✏️ Atualizar produto
// ====================================================
async function atualizar(req, res) {
  try {
    const empresa_id = req.user?.empresa_id;
    if (!empresa_id)
      return res.status(401).json({ erro: "Empresa não identificada." });

    const produto = await produtoRepo.atualizar(req.params.id, empresa_id, req.body);
    if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });

    // 🧾 LOG DE ATUALIZAÇÃO
    try {
      await registrarLog({
        usuario_id: req.user?.id,
        empresa_id,
        acao: "EDITAR",
        tabela: "produtos",
        registro_id: req.params.id,
        descricao: `Produto '${produto.nome}' atualizado.`,
        ip: req.ip,
      });
    } catch (logErr) {
      console.error("⚠️ Falha ao registrar log de atualização de produto:", logErr.message);
    }

    res.json(produto);
  } catch (err) {
    console.error("❌ ERRO EM /api/produtos/:id (ATUALIZAR):", err);
    res.status(500).json({ erro: err.message });
  }
}

// ====================================================
// 🗑️ Exclusão lógica de produto
// ====================================================
async function excluir(req, res) {
  try {
    const empresa_id = req.user?.empresa_id;
    if (!empresa_id)
      return res.status(401).json({ erro: "Empresa não identificada." });

    const produto = await produtoRepo.excluir(req.params.id, empresa_id);
    if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });

    // 🧾 LOG DE EXCLUSÃO
    try {
      await registrarLog({
        usuario_id: req.user?.id,
        empresa_id,
        acao: "EXCLUIR",
        tabela: "produtos",
        registro_id: req.params.id,
        descricao: `Produto '${produto.nome}' marcado como inativo.`,
        ip: req.ip,
      });
    } catch (logErr) {
      console.error("⚠️ Falha ao registrar log de exclusão de produto:", logErr.message);
    }

    res.json(produto);
  } catch (err) {
    console.error("❌ ERRO EM /api/produtos/:id (EXCLUIR):", err);
    res.status(500).json({ erro: err.message });
  }
}

module.exports = {
  criar,
  listar,
  buscarPorId,
  atualizar,
  excluir,
  async restaurar(req, res) {
    try {
      const empresa_id = req.user?.empresa_id;
      if (!empresa_id)
        return res.status(401).json({ erro: "Empresa nǜo identificada." });

      const produto = await produtoRepo.restaurar(req.params.id, empresa_id);
      if (!produto) return res.status(404).json({ erro: "Produto nǜo encontrado" });

      try {
        await registrarLog({
          usuario_id: req.user?.id,
          empresa_id,
          acao: "RESTAURAR",
          tabela: "produtos",
          registro_id: req.params.id,
          descricao: `Produto '${produto.nome}' restaurado para ativo.`,
          ip: req.ip,
        });
      } catch (logErr) {
        console.error("Falha ao registrar log de restauração de produto:", logErr.message);
      }

      res.json(produto);
    } catch (err) {
      console.error("ERRO EM /api/produtos/:id/restaurar:", err);
      res.status(500).json({ erro: err.message });
    }
  },
};
