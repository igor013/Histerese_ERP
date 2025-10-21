const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const { registrarLog } = require("../repositories/logRepo"); // 🧾 Log integrado

// ====================================================
// 🧭 Funções auxiliares
// ====================================================

// Retorna o caminho absoluto da pasta de backups
function resolveBackupDir() {
    const fromEnv = process.env.BACKUP_DIR;
    if (fromEnv) {
        const root = path.resolve(__dirname, "..", "..");
        return path.isAbsolute(fromEnv) ? fromEnv : path.join(root, fromEnv);
    }
    return path.resolve(__dirname, "..", "database", "backups");
}

// Retorna o caminho do executável do pg_dump
function resolvePgDump() {
    return process.env.PG_DUMP_PATH && process.env.PG_DUMP_PATH.trim().length > 0
        ? process.env.PG_DUMP_PATH
        : "pg_dump";
}

// ====================================================
// 📦 GERAR BACKUP MANUAL (estrutura + dados)
// ====================================================
async function gerarBackup(req, res) {
    try {
        const {
            DB_HOST = "localhost",
            DB_PORT = "5432",
            DB_NAME,
            DB_USER,
            DB_PASSWORD,
        } = process.env;

        if (!DB_NAME || !DB_USER) {
            const msg = "Variáveis DB_NAME e DB_USER são obrigatórias no .env";
            if (res) return res.status(500).json({ erro: msg });
            else throw new Error(msg);
        }

        const backupDir = resolveBackupDir();
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:T]/g, "-").split(".")[0];
        const fileName = `${DB_NAME}_backup_${timestamp}.sql`;
        const filePath = path.join(backupDir, fileName);

        const pgDump = resolvePgDump();

        const args = [
            `-h ${DB_HOST}`,
            `-p ${DB_PORT}`,
            `-U ${DB_USER}`,
            `-d ${DB_NAME}`,
            `-F p`,
            `-f "${filePath}"`,
        ].join(" ");

        const command = `"${pgDump}" ${args}`;
        const childEnv = { ...process.env, PGPASSWORD: DB_PASSWORD || "" };

        return new Promise((resolve, reject) => {
            exec(command, { env: childEnv, shell: true }, async (error, stdout, stderr) => {
                if (error) {
                    console.error("❌ Erro ao gerar backup:", stderr || error.message);
                    if (res) {
                        return res.status(500).json({
                            erro: "Falha ao gerar backup",
                            detalhes: stderr || error.message,
                        });
                    } else return reject(error);
                }

                console.log(`✅ Backup criado: ${filePath}`);

                // 🧾 REGISTRO DE LOG (BACKUP)
                try {
                    const usuario_id = req?.user?.id || null;
                    const empresa_id = req?.user?.empresa_id || null;

                    await registrarLog({
                        usuario_id,
                        empresa_id,
                        acao: "BACKUP",
                        tabela: "backups",
                        descricao: `Backup criado com sucesso: ${fileName}`,
                        ip: req?.ip || null,
                    });
                } catch (logErr) {
                    console.error("⚠️ Falha ao registrar log de backup:", logErr.message);
                }

                if (res) {
                    return res.json({
                        mensagem: "Backup criado com sucesso!",
                        arquivo: fileName,
                        caminho_absoluto: filePath,
                        pasta_configurada: backupDir,
                    });
                } else {
                    resolve(filePath);
                }
            });
        });
    } catch (err) {
        console.error("Erro interno ao gerar backup:", err);
        if (res) return res.status(500).json({ erro: "Erro interno ao criar backup" });
        throw err;
    }
}

// ====================================================
// 📥 DOWNLOAD DO BACKUP MAIS RECENTE (gera antes)
// ====================================================
async function downloadBackup(req, res) {
    try {
        console.log("🛠️ Gerando novo backup antes do download...");
        await gerarBackup(req); // passa o req para manter usuário e IP no log

        const backupDir = resolveBackupDir();
        if (!fs.existsSync(backupDir)) {
            return res.status(404).json({ erro: "Nenhum backup encontrado (pasta inexistente)" });
        }

        const arquivos = fs
            .readdirSync(backupDir)
            .filter((f) => f.toLowerCase().endsWith(".sql"))
            .sort((a, b) => {
                const aTime = fs.statSync(path.join(backupDir, a)).mtime.getTime();
                const bTime = fs.statSync(path.join(backupDir, b)).mtime.getTime();
                return bTime - aTime;
            });

        if (arquivos.length === 0) {
            return res.status(404).json({ erro: "Nenhum backup .sql encontrado" });
        }

        const ultimo = arquivos[0];
        const filePath = path.join(backupDir, ultimo);

        console.log(`📤 Enviando backup mais recente: ${ultimo}`);

        res.download(filePath, ultimo, (err) => {
            if (err) {
                console.error("Erro ao enviar arquivo:", err);
                return res.status(500).json({ erro: "Falha ao baixar o backup" });
            }
        });
    } catch (err) {
        console.error("Erro ao gerar e baixar backup:", err);
        return res.status(500).json({
            erro: "Falha ao gerar e baixar backup",
            detalhes: err.message,
        });
    }
}

module.exports = { gerarBackup, downloadBackup };
