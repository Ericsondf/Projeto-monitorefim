# Arquitetura do Sistema — Indicação de Monitores

## Visão Geral

```
┌─────────────────────────────────────────────────────┐
│                   Docker Compose                    │
│                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌────────┐ │
│  │   Frontend   │───▶│   Backend    │───▶│  MySQL │ │
│  │  Nginx:80    │    │  Node:3001   │    │  :3306 │ │
│  └──────────────┘    └──────────────┘    └────────┘ │
│     :8080               :3001              :3306    │
└─────────────────────────────────────────────────────┘
```

## Serviços

### Frontend (Nginx + HTML/CSS/JS puro)
- Servido pelo Nginx na porta 80 (mapeada para 8080 no host)
- Interface SPA com navegação client-side
- Consome a API REST do backend via `fetch`
- Sem framework — HTML, CSS e JavaScript puro

### Backend (Node.js + Express)
- API REST na porta 3001
- Rotas: `GET /health`, `GET|POST|PUT|PATCH|DELETE /api/indicacoes`
- Conexão com MySQL via pool de conexões (`mysql2/promise`)
- CORS habilitado para comunicação com o frontend

### Banco de Dados (MySQL 8.0)
- Tabela única: `indicacoes`
- Dados persistidos em volume Docker (`db_data`)
- Acesso restrito à rede interna Docker (`monitores_net`)

## Decisões Técnicas

| Decisão | Justificativa |
|---|---|
| HTML/CSS/JS puro no frontend | Sem dependência de build tool; qualquer máquina executa |
| Node.js + Express no backend | Mesma linguagem no full stack; ecossistema maduro |
| MySQL 8.0 | Banco relacional robusto; suporte nativo no Node com mysql2 |
| Nginx para frontend | Servidor estático leve e rápido; ideal para produção |
| Volumes Docker | Persistência dos dados entre restarts dos containers |
| Healthchecks | Garante que backend só sobe após banco estar pronto |
| Rede interna (bridge) | Banco não exposto externamente; segurança por design |

## Fluxo de uma Requisição

```
Usuário → Nginx (8080) → index.html
       → fetch() → Backend (3001) → MySQL (3306)
       ← JSON ← Express ← mysql2
       ← renderização no DOM
```

## Variáveis de Ambiente

Todas as configurações sensíveis são injetadas via variáveis de ambiente.
O arquivo `.env.example` documenta o que é necessário, sem expor valores reais.

| Variável | Descrição |
|---|---|
| `DB_HOST` | Host do banco (padrão: `db`) |
| `DB_PORT` | Porta do MySQL (padrão: `3306`) |
| `DB_USER` | Usuário do banco |
| `DB_PASSWORD` | Senha do usuário |
| `DB_NAME` | Nome do banco de dados |
| `PORT` | Porta do backend (padrão: `3001`) |
