// ======================================================
// 🧾 Repositório de Logs - Histerese ERP
// ======================================================
// Responsável por registrar ações do sistema no banco
// ======================================================

const db = require("../config/db");

/**
 * Registra uma ação no log do sistema
 * @param {Object} dados
 * @param {number} dados.usuario_id - ID do usuário
 * @param {number} dados.empresa_id - ID da empresa
 * @param {string} dados.acao - Tipo da ação (CRIAR, EDITAR, EXCLUIR, LOGIN, BACKUP, etc.)
 * @param {string} dados.tabela - Nome da tabela ou módulo
 * @param {number} [dados.registro_id] - ID do registro afetado
 * @param {string} [dados.descricao] - Texto descritivo da ação
 * @param {string} [dados.ip] - IP do usuário (opcional)
 */
async function registrarLog({ usuario_id, empresa_id, acao, tabela, registro_id = null, descricao = null, ip = null }) {
    const query = `
    INSERT INTO logs (usuario_id, empresa_id, acao, tabela, registro_id, descricao, ip)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
    const values = [usuario_id, empresa_id, acao, tabela, registro_id, descricao, ip];

    try {
        await db.query(query, values);
        console.log(`🧾 Log registrado: ${acao} em ${tabela}${registro_id ? ` (ID ${registro_id})` : ""}`);
    } catch (err) {
        console.error("❌ Erro ao registrar log:", err.message);
    }
}

module.exports = { registrarLog };
