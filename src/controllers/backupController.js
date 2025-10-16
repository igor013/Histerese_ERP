const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

// ======================================================
// 📦 GERAR BACKUP COMPLETO DO BANCO (estrutura + dados)
// ======================================================
async function gerarBackup(req, res) {
    try {
        // 🔒 Opcional: restringir somente a usuários admin
        // if (req.user?.perfil !== "admin") {
        //   return res.status(403).json({ erro: "Acesso negado — apenas administradores podem gerar backups." });
        // }

        // Diretório onde os backups serão armazenados
        const backupDir = path.join(__dirname, "..", "database", "backups");

        // Garante que a pasta exista
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        // Nome do arquivo: ex. histerese_backup_2025-10-16-02-34-16.sql
        const dataAtual = new Date().toISOString().replace(/[:T]/g, "-").split(".")[0];
        const fileName = `histerese_backup_${dataAtual}.sql`;
        const filePath = path.join(backupDir, fileName);

        // Comando pg_dump (usando DATABASE_URL do .env)
        const command = `pg_dump "${process.env.DATABASE_URL}" -F p -f "${filePath}"`;

        // Executa o comando
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("❌ Erro ao gerar backup:", stderr);
                return res.status(500).json({ erro: "Falha ao gerar backup", detalhes: stderr });
            }

            console.log(`✅ Backup criado: ${filePath}`);
            res.json({
                mensagem: "Backup criado com sucesso!",
                arquivo: fileName,
                caminho: filePath,
                usuario: req.user?.login || "desconhecido",
            });
        });
    } catch (err) {
        console.error("Erro interno ao gerar backup:", err);
        res.status(500).json({ erro: "Erro interno ao criar backup" });
    }
}

// ======================================================
// 💾 DOWNLOAD DO BACKUP MAIS RECENTE
// ======================================================
async function downloadBackup(req, res) {
    try {
        // 🔒 Opcional: restringir somente a usuários admin
        // if (req.user?.perfil !== "admin") {
        //   return res.status(403).json({ erro: "Acesso negado — apenas administradores podem baixar backups." });
        // }

        const backupDir = path.join(__dirname, "..", "database", "backups");

        // Verifica se a pasta existe
        if (!fs.existsSync(backupDir)) {
            return res.status(404).json({ erro: "Nenhum backup encontrado (pasta inexistente)" });
        }

        // Lista e ordena os arquivos .sql por data de modificação
        const arquivos = fs.readdirSync(backupDir)
            .filter((file) => file.endsWith(".sql"))
            .sort((a, b) => {
                const aTime = fs.statSync(path.join(backupDir, a)).mtime.getTime();
                const bTime = fs.statSync(path.join(backupDir, b)).mtime.getTime();
                return bTime - aTime; // mais recente primeiro
            });

        if (arquivos.length === 0) {
            return res.status(404).json({ erro: "Nenhum backup .sql encontrado" });
        }

        const ultimoBackup = arquivos[0];
        const filePath = path.join(backupDir, ultimoBackup);

        console.log(`📤 Usuário ${req.user?.login || "desconhecido"} baixou o backup: ${ultimoBackup}`);

        // Envia o arquivo como download
        res.download(filePath, ultimoBackup, (err) => {
            if (err) {
                console.error("Erro ao enviar arquivo:", err);
                res.status(500).json({ erro: "Falha ao baixar o backup" });
            }
        });
    } catch (err) {
        console.error("Erro interno ao buscar backups:", err);
        res.status(500).json({ erro: "Erro interno ao buscar backups" });
    }
}

module.exports = { gerarBackup, downloadBackup };
