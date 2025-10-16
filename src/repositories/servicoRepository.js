const { pool } = require('../config/db');


const ServicoRepository = {
    async criarServico(dados) {
        const {
            empresa_id,
            cliente_id,
            equipamento_id,
            descricao,
            valor,
            status,
            observacoes
        } = dados;

        const query = `
            INSERT INTO servicos (
                empresa_id, cliente_id, equipamento_id,
                descricao, valor, status, observacoes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;

        const values = [
            empresa_id,
            cliente_id,
            equipamento_id || null,
            descricao,
            valor || null,
            status || 'pendente',
            observacoes || null
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    async listarServicos({ empresa_id, pagina = 1, limite = 10, busca = '' }) {
        const offset = (pagina - 1) * limite;

        const query = `
            SELECT s.*, c.nome AS cliente_nome, e.modelo AS equipamento_nome
            FROM servicos s
            LEFT JOIN clientes c ON s.cliente_id = c.id
            LEFT JOIN equipamentos e ON s.equipamento_id = e.id
            WHERE s.empresa_id = $1
              AND s.ativo = true
              AND (
                  unaccent(LOWER(c.nome)) LIKE unaccent(LOWER('%' || $2 || '%'))
                  OR unaccent(LOWER(s.descricao)) LIKE unaccent(LOWER('%' || $2 || '%'))
              )
            ORDER BY s.id DESC
            LIMIT $3 OFFSET $4;
        `;

        const countQuery = `
            SELECT COUNT(*) FROM servicos s
            LEFT JOIN clientes c ON s.cliente_id = c.id
            WHERE s.empresa_id = $1
              AND s.ativo = true
              AND (
                  unaccent(LOWER(c.nome)) LIKE unaccent(LOWER('%' || $2 || '%'))
                  OR unaccent(LOWER(s.descricao)) LIKE unaccent(LOWER('%' || $2 || '%'))
              );
        `;

        const [result, total] = await Promise.all([
            pool.query(query, [empresa_id, busca, limite, offset]),
            pool.query(countQuery, [empresa_id, busca])
        ]);

        return {
            dados: result.rows,
            total: parseInt(total.rows[0].count, 10),
            pagina: parseInt(pagina, 10),
            limite: parseInt(limite, 10)
        };
    },

    async buscarServicoPorId(id) {
        const query = `
            SELECT s.*, c.nome AS cliente_nome, e.modelo AS equipamento_nome
            FROM servicos s
            LEFT JOIN clientes c ON s.cliente_id = c.id
            LEFT JOIN equipamentos e ON s.equipamento_id = e.id
            WHERE s.id = $1 AND s.ativo = true;
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    async atualizarServico(id, dados) {
        const campos = [];
        const valores = [];
        let contador = 1;

        for (const [chave, valor] of Object.entries(dados)) {
            if (valor !== undefined) {
                campos.push(`${chave} = $${contador}`);
                valores.push(valor);
                contador++;
            }
        }

        if (campos.length === 0) return null;

        const query = `
            UPDATE servicos
            SET ${campos.join(', ')},
                atualizado_em = NOW()
            WHERE id = $${contador}
            RETURNING *;
        `;

        valores.push(id);
        const { rows } = await pool.query(query, valores);
        return rows[0];
    },

    async excluirServico(id) {
        const query = `
            UPDATE servicos
            SET ativo = false, atualizado_em = NOW()
            WHERE id = $1
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    async buscarPorStatus(empresa_id, status) {
        const query = `
            SELECT s.*, c.nome AS cliente_nome, e.modelo AS equipamento_nome
            FROM servicos s
            LEFT JOIN clientes c ON s.cliente_id = c.id
            LEFT JOIN equipamentos e ON s.equipamento_id = e.id
            WHERE s.empresa_id = $1
              AND s.status = $2
              AND s.ativo = true
            ORDER BY s.id DESC;
        `;
        const { rows } = await pool.query(query, [empresa_id, status]);
        return rows;
    },

    async buscarPorCliente(empresa_id, cliente_id) {
        const query = `
            SELECT s.*, e.modelo AS equipamento_nome
            FROM servicos s
            LEFT JOIN equipamentos e ON s.equipamento_id = e.id
            WHERE s.empresa_id = $1
              AND s.cliente_id = $2
              AND s.ativo = true
            ORDER BY s.id DESC;
        `;
        const { rows } = await pool.query(query, [empresa_id, cliente_id]);
        return rows;
    }
};

module.exports = ServicoRepository;
