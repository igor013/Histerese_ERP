const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

pool.connect()
    .then(() => console.log("✅ Conectado ao PostgreSQL com sucesso"))
    .catch(err => console.error("❌ Erro ao conectar ao banco:", err));

module.exports = { pool };
