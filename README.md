# ⚙️ Histerese ERP — Backend (Fase 2)

Este é o backend oficial do **Histerese ERP**, desenvolvido em **Node.js + Express + PostgreSQL**.  
A aplicação foi projetada para oferecer uma arquitetura modular, escalável e fácil de manter.

---

## 🧱 Estrutura do Projeto

```
📦 histerese-backend/
├── src/
│   ├── config/          # Configurações de banco e variáveis de ambiente
│   ├── controllers/     # Controladores HTTP (lógica das requisições)
│   ├── repositories/    # Acesso ao banco (queries SQL)
│   ├── routes/          # Rotas da API Express
│   ├── middlewares/     # Autenticação, erros, etc.
│   ├── uploads/         # Armazenamento de logos/imagens
│   └── database/        # Scripts SQL (init, reset e clean)
│
├── .env                 # Variáveis de ambiente
├── package.json         # Dependências e scripts npm
└── server.js            # Servidor principal Express
```

---

## 🚀 Tecnologias Principais

| Tecnologia | Função |
|-------------|--------|
| **Node.js / Express** | Servidor web principal |
| **PostgreSQL** | Banco de dados relacional |
| **pg** | Conexão com o PostgreSQL |
| **dotenv** | Variáveis de ambiente |
| **bcryptjs** | Criptografia de senhas |
| **jsonwebtoken (JWT)** | Autenticação e controle de acesso |
| **multer** | Upload de arquivos (logos e imagens) |
| **cors** | Permitir conexões entre domínios |
| **nodemon** | Reload automático no modo dev |

---

## 📦 Módulos Implementados

| Módulo | Descrição |
|--------|------------|
| **Empresa** | Cadastro de empresas e upload de logo |
| **Usuários** | Cadastro, login e autenticação JWT |
| **Clientes** | CRUD completo com busca, paginação e exclusão lógica |
| **Produtos** | Cadastro e controle de estoque básico |
| **Fornecedores** | Cadastro e manutenção de fornecedores (multiempresa) |
| **Equipamentos** | Vinculados a clientes, usados em ordens de serviço |
| **Serviços (OS)** | Controle de ordens de serviço e histórico |
| **Notas Fiscais** | Registro e controle de notas |
| **Uploads** | Upload de imagens/logos com Multer |

---

## 🔐 Autenticação Global (JWT)

- O middleware `authMiddleware.js` protege todas as rotas após login.  
- O login gera um token JWT que deve ser enviado no **header Authorization**:

  ```
  Authorization: Bearer <seu_token>
  ```

- As únicas rotas públicas são:
  - `/api/auth` (login e registro)
  - `/api/upload` (upload de imagens)

---

## 🧠 Scripts npm

Os comandos estão definidos no `package.json`:

| Comando | Descrição |
|----------|------------|
| `npm start` | Inicia o servidor normalmente |
| `npm run dev` | Inicia com nodemon (modo desenvolvimento) |
| `npm run init-db` | Cria toda a estrutura do banco (`init.sql`) |
| `npm run clean-db` | Limpa todos os dados (`clean.sql`) |
| `npm run reset-db` | Recria o banco do zero (`reset.sql`) |

---

## ⚙️ Variáveis de Ambiente (`.env`)

Crie um arquivo `.env` na raiz do projeto com o conteúdo:

```
PORT=4000
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
DB_NAME=histerese_db
JWT_SECRET=sua_chave_secreta
```

> ⚠️ **Nunca envie o `.env` para o GitHub.**  
> O arquivo já está listado no `.gitignore`.

---

## 🧩 Teste rápido de conexão

Para verificar se o backend conecta ao banco de dados, acesse:

```
GET http://localhost:4000/api/test-db
```

Retorno esperado:
```json
{
  "conectado": true,
  "hora_servidor": "2025-10-15T23:59:59.000Z"
}
```

---

## 🧰 Estrutura Padrão das Tabelas

Todas as tabelas seguem este modelo base:

```sql
id SERIAL PRIMARY KEY,
status VARCHAR DEFAULT 'ativo',
criado_em TIMESTAMP DEFAULT NOW(),
atualizado_em TIMESTAMP DEFAULT NOW()
```

E todas possuem relacionamento com `empresa_id` (multiempresa).

---

## 🧾 Banco de Dados

Scripts SQL localizados em `/src/database/`:

| Script | Função |
|---------|--------|
| `init.sql` | Cria todas as tabelas e relacionamentos |
| `reset.sql` | Apaga e recria o banco do zero |
| `clean.sql` | Limpa todos os dados (mantém estrutura) |

Comandos disponíveis:
```bash
npm run init-db
npm run reset-db
npm run clean-db
```

---

## 📦 Deploy Futuro (Fase 3)

Próximos passos planejados:

1. 🔑 Autenticação JWT completa com refresh token.  
2. ⚙️ Middleware global de erros centralizado.  
3. 🧮 Relatórios e dashboards de performance.  
4. 🧾 Emissão de notas fiscais e controle de estoque integrado.  
5. 🌐 Deploy em ambiente de produção (Render ou Railway).

---

## 👤 Autor

**Igor Henrique Moreira Lusquinho**  
📅 Atualizado em **Outubro de 2025**

---

## ✅ Status do Projeto

> 🚀 **Backend concluído ~90%**  
> Aguardando integração final de autenticação JWT e padronização de logs de erro.

---

**Histerese ERP — Organização, eficiência e controle para pequenas e médias empresas.**
