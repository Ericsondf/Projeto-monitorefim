# Pipeline CI/CD — Indicação de Monitores

## Ferramenta: GitHub Actions

## Gatilhos

| Evento | Branches |
|---|---|
| `push` | `main`, `develop` |
| `pull_request` | `main` |

## Jobs

### 1. `backend-test` — Lint + Testes
- Instala dependências (`npm ci`)
- Executa ESLint no código-fonte
- Roda testes automatizados com Jest + Supertest
- Banco mockado — não requer MySQL no CI

### 2. `docker-build` — Build das Imagens
- Constrói a imagem Docker do backend
- Constrói a imagem Docker do frontend
- Garante que os Dockerfiles estão válidos e funcionais

### 3. `compose-validate` — Validação do Compose
- Cria `.env` a partir do `.env.example`
- Executa `docker compose config` para validar a sintaxe
- Falha se o arquivo estiver incorreto

### 4. `integration` — Integração Completa
- Depende de todos os jobs anteriores passarem
- Sobe toda a stack com `docker compose up --build -d`
- Aguarda o backend ficar saudável (30 tentativas × 5s)
- Testa `GET /health` do backend (HTTP 200)
- Testa `GET /api/indicacoes` (HTTP 200)
- Testa o frontend via Nginx (HTTP 200)
- Em caso de falha, exibe logs dos containers

## Diagrama de Fluxo

```
push/PR
  │
  ├─▶ backend-test ──────┐
  │                      │
  ├─▶ docker-build ──────┤──▶ integration ──▶ ✅ CI Passou
  │                      │
  └─▶ compose-validate ──┘
```

## Proteção de Secrets

- Nenhuma senha real é armazenada no repositório
- CI usa apenas valores do `.env.example`
- Para deploy em produção, usar **GitHub Secrets** e injetar via `env:`

## Possíveis Evoluções

- Publicar imagens no Docker Hub ou GitHub Container Registry
- Deploy automático em staging após merge na `main`
- Notificação no Slack/Discord em caso de falha
- Scan de vulnerabilidades com `trivy` ou `snyk`
- Cobertura de testes com relatório de cobertura
