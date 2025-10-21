# 🧠 Histerese ERP - Backend (Node.js + Express + PostgreSQL)

> ✅ **Backend concluído (versão estável 2.0)**  
> 🚀 Projeto modular, seguro e otimizado para ambiente corporativo.  
> 💾 Desenvolvido em **Node.js + Express + PostgreSQL**, com autenticação JWT, upload de arquivos e backup automático.

---

## 📦 **Tecnologias Utilizadas**

- **Node.js** (v18+)
- **Express**
- **PostgreSQL**
- **JWT (Json Web Token)**
- **bcryptjs**
- **dotenv**
- **multer** (upload de arquivos)
- **pg** (driver PostgreSQL)
- **nodemon**
- **cors**
- **fs / path**
- **dotenvx** (para variáveis de ambiente seguras)

---

## 🧩 **Estrutura do Projeto**

```
histerese-backend/
│
├── src/
│   ├── config/              → Configurações do banco e ambiente
│   ├── controllers/         → Lógica principal de cada módulo
│   ├── middlewares/         → Autenticação, tratamento de erros e caixa alta
│   ├── repositories/        → Consultas SQL organizadas por módulo
│   ├── routes/              → Rotas Express
│   ├── uploads/             → Armazenamento de logos/imagens
│   └── database/            → Script init.sql e backups
│
├── .env                     → Configurações de ambiente (exemplo abaixo)
├── .gitignore               → Exclusão de arquivos sensíveis
├── package.json
└── server.js                → Ponto principal do servidor
```

---

## ⚙️ **.env (exemplo)**

```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=suasenha
DB_DATABASE=histerese_db
BACKUP_PATH=C:\Projetos\histerese-backend\src\database\backups
```

---

## 📥 **Instalação e Uso**

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/igor013/Histerese_ERP.git
   cd Histerese_ERP
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o arquivo `.env` conforme o exemplo acima.**

4. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

5. **Acesse no navegador:**
   ```
   http://localhost:4000
   ```

---

## 🧱 **Módulos Implementados**

| Módulo | Descrição |
|---------|------------|
| **Empresa** | Cadastro e gerenciamento de empresas |
| **Usuários** | Cadastro, login com JWT, e controle multiempresa |
| **Clientes** | CRUD completo com busca e paginação |
| **Produtos** | Gerenciamento de produtos e estoque |
| **Notas Fiscais** | Importação de XML, controle de itens e estoque |
| **Equipamentos** | Cadastro vinculado ao cliente, com status e histórico |
| **Serviços / OS** | Controle de ordens de serviço e status |
| **Fornecedores** | Cadastro de fornecedores com exclusão lógica |
| **Grupos** | Agrupamento de produtos e serviços |
| **Uploads** | Envio de logos com Multer |
| **Backup Automático** | Geração de arquivo `.sql` e download direto |
| **Logs do Sistema** | Registro automático de ações (CRUD, login, backup) |
| **Middleware de Caixa Alta** | Padroniza textos automaticamente em CAIXA ALTA |

---

## 🔐 **Autenticação e Segurança**

- Login protegido com **JWT**
- Hash de senhas com **bcryptjs**
- Middleware de autenticação global (`authMiddleware.js`)
- Exclusão lógica com campo `status` e registro em `logs`

---

## 🧾 **Módulo de Logs**

Endpoint:
```
GET /api/logs
```

Retorno:
```json
{
  "mensagem": "Foram encontrados 3 logs.",
  "total": 3,
  "logs": [
    {
      "id": 12,
      "usuario_nome": "ADMINISTRADOR",
      "empresa_nome": "EMPRESA DEMO LTDA",
      "acao": "CRIAR",
      "tabela": "CLIENTES",
      "descricao": "CLIENTE CRIADO COM SUCESSO.",
      "ip": "::1",
      "criado_em": "2025-10-22 00:28:03"
    }
  ]
}
```

---

## 🔠 **Middleware de Caixa Alta**

Arquivo: `src/middlewares/toUpperCaseMiddleware.js`

Converte automaticamente os campos de texto para **MAIÚSCULAS**,  
ignorando campos sensíveis como `senha`, `email`, `logo_url` etc.

Exemplo:
```js
app.use(require("./src/middlewares/toUpperCaseMiddleware"));
```

---

## 🗂️ **Banco de Dados**

- Todas as tabelas criadas via script `init.sql`
- Exclusão lógica por `status = 'inativo'` ou `status = 'excluido'`
- Campos padronizados:
  - `id` SERIAL PRIMARY KEY
  - `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `atualizado_em` TIMESTAMP

---

## 🧰 **Backup Automático**

Endpoint:
```
GET /api/backup
```

Cria e baixa automaticamente um arquivo `.sql` no diretório:
```
src/database/backups/
```

---

## 🧩 **Logs Automáticos**

Todas as operações CRUD geram log automaticamente:
- **CRIAR**
- **EDITAR**
- **EXCLUIR**
- **REATIVAR**

Cada log contém:
- Usuário responsável
- Empresa vinculada
- IP do cliente
- Tabela e registro alterado
- Data/hora formatada

---

## 📌 **Status Atual do Projeto**

| Componente | Status |
|-------------|--------|
| Backend (API + Banco) | ✅ Concluído — v2.0 |
| Middleware de Caixa Alta | ✅ Ativo |
| Logs de Sistema | ✅ Ativo |
| Backup Automático | ✅ Ativo |
| Frontend ERP | 🚧 Em desenvolvimento |
| Deploy | 🔜 Planejado |

---

## 👨‍💻 **Autor**

**Igor Henrique Moreira Lusquinho**  
📧 Contato: (adicione e-mail ou LinkedIn se desejar)  
💻 Projeto: [Histerese ERP](https://github.com/igor013/Histerese_ERP)

---

## 🏁 **Licença**

Este projeto é de uso interno e privado.  
Não é permitida a distribuição sem autorização do autor.
