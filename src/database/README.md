# 🗄️ Histerese ERP — Banco de Dados

Esta pasta contém todos os scripts SQL de inicialização e manutenção do banco de dados **PostgreSQL** do projeto **Histerese ERP**.

---

## ⚙️ Estrutura de arquivos

| Arquivo | Função |
|----------|--------|
| `init.sql` | Cria toda a estrutura do banco (tabelas, índices e relacionamentos). |
| `reset.sql` | Apaga e recria o banco do zero (DROP + CREATE). **⚠️ Cuidado!** Apaga todos os dados e o próprio banco. |
| `clean.sql` | Limpa todas as tabelas (TRUNCATE), reinicia os IDs, mas mantém a estrutura. Ideal para testes. |

---

## 🧩 Comandos disponíveis via NPM

Os comandos abaixo foram adicionados no `package.json` para facilitar o uso dos scripts SQL.

### 🔹 Criar toda a estrutura
```bash
npm run init-db
