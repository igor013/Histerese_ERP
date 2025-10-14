// src/repositories/nfe_imports.repository.js
const db = require("../config/db");

module.exports = {
    // Busca importação pelo código da chave de acesso
    async findByAccessKey(accessKey) {
        const result = await db.query(
            "SELECT * FROM nfe_imports WHERE access_key = $1 LIMIT 1",
            [accessKey]
        );
        return result.rows[0] || null;
    },

    // Insere um registro de importação (log)
    async insert(t, { access_key, direction, xml_raw, status, message, nota_id }) {
        const query = `
      INSERT INTO nfe_imports (access_key, direction, xml_raw, status, message, nota_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (access_key) DO NOTHING
      RETURNING *;
    `;
        const values = [
            access_key,
            direction,
            xml_raw,
            status,
            message || null,
            nota_id || null,
        ];

        // Permite usar dentro ou fora de transação
        const executor = t || db;
        const result = await executor.query(query, values);
        return result.rows[0] || null;
    },
};
