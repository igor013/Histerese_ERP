const fornecedorRepo = require("../repositories/fornecedorRepo");

exports.listarFornecedores = async (req, res, next) => {
    try {
        const empresa_id = req.user.empresa_id;
        const fornecedores = await fornecedorRepo.listar(empresa_id);
        res.json(fornecedores);
    } catch (err) {
        next(err);
    }
};

exports.buscarFornecedorPorId = async (req, res, next) => {
    try {
        const id = req.params.id;
        const empresa_id = req.user.empresa_id;
        const fornecedor = await fornecedorRepo.buscarPorId(id, empresa_id);
        if (!fornecedor)
            return res.status(404).json({ erro: "Fornecedor não encontrado." });
        res.json(fornecedor);
    } catch (err) {
        next(err);
    }
};

exports.criarFornecedor = async (req, res, next) => {
    try {
        const empresa_id = req.user.empresa_id;
        const dados = req.body;

        for (let campo in dados)
            if (dados[campo] === "" || dados[campo] === undefined)
                dados[campo] = null;

        if (!dados.data_abertura) dados.data_abertura = null;

        const novo = await fornecedorRepo.criar({ ...dados, empresa_id });
        res.status(201).json(novo);
    } catch (err) {
        next(err);
    }
};

exports.atualizarFornecedor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const empresa_id = req.user.empresa_id;
        const dados = req.body;

        for (let campo in dados)
            if (dados[campo] === "" || dados[campo] === undefined)
                dados[campo] = null;

        if (!dados.data_abertura) dados.data_abertura = null;

        const atualizado = await fornecedorRepo.atualizar(id, empresa_id, dados);
        res.json(atualizado);
    } catch (err) {
        next(err);
    }
};

exports.excluirFornecedor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const empresa_id = req.user.empresa_id;
        const fornecedor = await fornecedorRepo.excluir(id, empresa_id);

        if (!fornecedor)
            return res.status(404).json({ erro: "Fornecedor não encontrado." });

        res.json({ mensagem: "Fornecedor excluído com sucesso." });
    } catch (err) {
        next(err);
    }
};
