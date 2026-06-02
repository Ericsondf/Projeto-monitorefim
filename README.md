# 📋 MonitorIA — Sistema de Indicação de Monitores

> **Caso PBL 5 — DevOps | PBL Full Stack**
> Backend: Node.js + Express | Frontend: HTML/CSS/JS puro | Banco: MySQL | CI/CD: GitHub Actions

---

## 🚀 Executar em 3 comandos

```bash
git clone <url-do-repositorio>
cd projeto-monitores
cp .env.example .env
docker compose up --build
```

Acesse:
- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3001
- **Health check:** http://localhost:3001/health

---

## 📁 Estrutura do Repositório

```
projeto-monitores/
├── backend/
│   ├── src/
│   │   ├── config/database.js       # Conexão com MySQL
│   │   ├── controllers/
│   │   │   └── indicacaoController.js
│   │   ├── models/
│   │   │   └── Indicacao.js         # Queries SQL
│   │   ├── routes/
│   │   │   └── indicacoes.js        # Rotas REST
│   │   └── server.js                # Entrada do servidor
│   ├── tests/
│   │   └── indicacoes.test.js       # Testes com Jest + Supertest
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .eslintrc.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api.js                   # Comunicação com API
│   │   ├── app.js                   # Lógica da aplicação
│   │   └── style.css                # Estilos
│   ├── index.html
│   ├── Dockerfile
│   └── .dockerignore
├── docs/
│   ├── arquitetura.md               # Decisões técnicas e diagrama
│   └── pipeline.md                  # Documentação completa do CI/CD
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions — 4 jobs em cascata
├── docker-compose.yml
├── .env.example                     # Variáveis de ambiente (modelo seguro)
├── .gitignore
└── README.md
```

---

## ⚙️ Rotas da API

| Método   | Rota                            | Descrição                          |
|----------|---------------------------------|------------------------------------|
| `GET`    | `/health`                       | Health check da API                |
| `GET`    | `/api/indicacoes`               | Listar todas as indicações         |
| `GET`    | `/api/indicacoes?status=pendente` | Filtrar por status               |
| `GET`    | `/api/indicacoes/stats`         | Estatísticas (totais por status)   |
| `GET`    | `/api/indicacoes/:id`           | Buscar indicação por ID            |
| `POST`   | `/api/indicacoes`               | Criar nova indicação               |
| `PUT`    | `/api/indicacoes/:id`           | Atualizar indicação completa       |
| `PATCH`  | `/api/indicacoes/:id/status`    | Atualizar apenas o status          |
| `DELETE` | `/api/indicacoes/:id`           | Remover indicação                  |

### Status válidos

| Status     | Descrição                         |
|------------|-----------------------------------|
| `pendente` | Indicação recém-criada (padrão)   |
| `aprovado` | Indicação aprovada pela coordenação |
| `recusado` | Indicação recusada                |

### Exemplo de payload para `POST /api/indicacoes`

```json
{
  "professor": "Prof. João Silva",
  "aluno": "Maria Oliveira",
  "disciplina": "Algoritmos e Estruturas de Dados",
  "justificativa": "Excelente desempenho e habilidade de comunicação."
}
```

---

## 🧪 Rodar Testes Localmente

```bash
cd backend
npm install
npm test
```

### Rodar Lint

```bash
cd backend
npm run lint
```

> ⚠️ O lint **bloqueia** a pipeline CI/CD quando há erros. Corrija antes de fazer push.

---

## 🐳 Docker — Comandos Úteis

```bash
# Subir toda a stack (modo detached)
docker compose up --build -d

# Ver logs em tempo real
docker compose logs -f

# Verificar status e healthchecks dos containers
docker compose ps

# Parar e remover containers
docker compose down

# Parar e remover containers + volumes (apaga dados do banco)
docker compose down -v

# Rebuild de um serviço específico
docker compose build backend
docker compose up -d backend
```

---

## 🔧 Variáveis de Ambiente

Copie `.env.example` para `.env` e ajuste se necessário:

```env
DB_HOST=db
DB_PORT=3306
DB_ROOT_PASSWORD=root
DB_USER=monitores_user
DB_PASSWORD=monitores_pass
DB_NAME=monitores_db
PORT=3001
```

> ⚠️ **NUNCA** faça commit do arquivo `.env` com senhas reais. O `.gitignore` já o ignora automaticamente.

---

## 🩺 Troubleshooting

**Backend não conecta ao banco:**
```bash
# Verifique se o container do banco está saudável
docker compose ps
# Aguarde o healthcheck do serviço db passar (pode levar até 30s)
docker compose logs db
```

**Porta já em uso:**
```bash
# Verificar qual processo usa a porta
lsof -i :3001
lsof -i :8080
```

**Reconstruir do zero (limpar dados e imagens):**
```bash
docker compose down -v
docker compose up --build
```

**Testar a API manualmente:**
```bash
# Health check
curl http://localhost:3001/health

# Listar indicações
curl http://localhost:3001/api/indicacoes

# Criar indicação
curl -X POST http://localhost:3001/api/indicacoes \
  -H "Content-Type: application/json" \
  -d '{"professor":"Prof. Ana","aluno":"Carlos","disciplina":"DevOps"}'
```

---

## 📊 Pipeline CI/CD

O pipeline GitHub Actions executa automaticamente em todo `push` e `pull_request`:

1. **Lint + Testes** — ESLint (bloqueia em erros) e Jest no backend
2. **Build Docker** — Constrói imagens de backend e frontend
3. **Valida Compose** — Verifica sintaxe do `docker-compose.yml`
4. **Integração** — Sobe a stack completa e testa todas as rotas principais

```
push/PR
  │
  ├─▶ backend-test ──────┐
  │                      │
  ├─▶ docker-build ──────┼──▶ integration ──▶ ✅ CI passou
  │                      │
  └─▶ compose-validate ──┘
```

Veja detalhes: [docs/pipeline.md](docs/pipeline.md)

---

## 👥 Equipe

| Nome | Responsabilidade |
|------|-----------------|
| — | Backend — rotas e controller |
| — | Backend — model e banco de dados |
| — | Frontend — HTML e CSS |
| — | Frontend — JavaScript e API |
| — | Docker e Docker Compose |
| — | CI/CD e documentação |

> ✏️ Preencha os nomes reais da equipe antes da entrega final.

---

## 📄 Decisões Técnicas

Veja: [docs/arquitetura.md](docs/arquitetura.md)
