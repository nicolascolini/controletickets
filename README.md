# Task Manager API

API REST **rotineira** (CRUD) de gerenciamento de tarefas, construída com **Node.js + Express + SQLite**. Serve como projeto-base/costumeiro para qualquer aplicação de tarefas, agenda ou lista de afazeres — e também como referência de arquitetura em camadas para portfólio.

## Arquitetura e padrões de projeto

O projeto segue arquitetura em camadas (estilo MVC + Service Layer), com separação clara de responsabilidades:

```
Request → Route → Controller → Service → Repository → Database
```

| Padrão | Onde | Por quê |
|---|---|---|
| **Singleton** | `src/config/database.js` | Garante uma única conexão SQLite viva durante toda a aplicação. |
| **Repository** | `src/repositories/TaskRepository.js` | Isola todo o SQL; a Service não sabe (nem precisa saber) que o dado está em SQLite. |
| **Service Layer** | `src/services/TaskService.js` | Concentra as regras de negócio e validações, reutilizável fora do contexto HTTP. |
| **MVC (Controller)** | `src/controllers/TaskController.js` | Traduz requisição/resposta HTTP; nenhuma regra de negócio aqui. |
| **Observer** | `src/utils/EventBus.js` + `src/utils/taskEventLogger.js` | Emite eventos de domínio (`task:created`, `task:completed`) que podem ganhar novos "assinantes" (e-mail, webhook, métricas) sem alterar a Service. |

```
task-manager-api/
├── server.js                  # ponto de entrada
├── public/                    # frontend estático (tela do CRUD)
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── src/
│   ├── app.js                 # configuração do Express
│   ├── config/database.js     # Singleton + migrations SQLite
│   ├── models/Task.js         # entidade + validação de domínio
│   ├── repositories/          # acesso a dados (Repository)
│   ├── services/              # regras de negócio (Service Layer)
│   ├── controllers/           # handlers HTTP (MVC)
│   ├── routes/                # definição de rotas Express
│   ├── middlewares/           # tratamento central de erros
│   └── utils/                 # AppError, EventBus, logger de eventos
└── tests/                     # testes de integração (node:test)
```

## Requisitos

- Node.js >= 18 (usa `node:test`, `node:events` nativos)
- npm

## Instalação

```bash
npm install
cp .env.example .env
```

## Executando

```bash
npm start          # produção
npm run dev         # desenvolvimento, com reload automático (node --watch)
```

O servidor sobe em `http://localhost:3000` (porta configurável via `.env`). O banco SQLite é criado automaticamente em `./data/database.sqlite` na primeira execução.

## Tela do CRUD (DISPATCH — task control board)

Acesse **http://localhost:3000** no navegador para ver e usar o CRUD visualmente — sem precisar de curl ou Postman.

- Cada tarefa aparece como um "ticket" perfurado, com carimbo de prioridade (BAIXA/MÉDIA/ALTA).
- Clique no círculo (furo) do ticket para avançar o status: `pending → in_progress → done`.
- Botão **VOID** remove o ticket.
- **+ NOVO TICKET** abre o formulário de criação.
- Filtros por status e prioridade na barra lateral.
- O cabeçalho mostra contadores ao vivo (pendentes / em curso / concluídas) e um relógio.

É um frontend estático (`public/index.html`, `public/styles.css`, `public/app.js`) servido pelo próprio Express e consumindo a mesma API REST descrita abaixo — sem framework, sem build step.

## Testes

```bash
npm test
```

6 testes de integração cobrindo criação, listagem, busca por id, atualização, remoção e validação de erros — todos executados e passando durante a construção deste projeto.

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Healthcheck da aplicação |
| POST | `/api/tasks` | Cria uma tarefa |
| GET | `/api/tasks` | Lista tarefas (filtros e paginação) |
| GET | `/api/tasks/:id` | Busca uma tarefa por id |
| PUT | `/api/tasks/:id` | Atualiza uma tarefa (parcial) |
| DELETE | `/api/tasks/:id` | Remove uma tarefa |

### Query params de `GET /api/tasks`

- `status`: `pending` \| `in_progress` \| `done`
- `priority`: `low` \| `medium` \| `high`
- `page`, `limit`: paginação (padrão `page=1`, `limit=20`)

### Corpo de `POST /api/tasks` / `PUT /api/tasks/:id`

```json
{
  "title": "Estudar padrões de projeto",
  "description": "Repository, Service Layer, Observer",
  "status": "pending",
  "priority": "high",
  "due_date": "2026-08-10"
}
```

Apenas `title` é obrigatório na criação. Todos os campos aceitam atualização parcial no `PUT`.

### Exemplo de uso (curl)

```bash
# Criar tarefa
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Testar API","priority":"high"}'

# Listar tarefas pendentes
curl "http://localhost:3000/api/tasks?status=pending"

# Concluir tarefa
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"done"}'

# Remover tarefa
curl -X DELETE http://localhost:3000/api/tasks/1
```

### Tratamento de erros

Erros de validação retornam `422` com detalhes; recursos inexistentes retornam `404`; erros inesperados retornam `500`. Todo erro segue o formato:

```json
{ "error": "mensagem", "details": ["opcional"] }
```

## Possíveis evoluções

- Autenticação JWT por usuário (cada usuário só vê suas próprias tarefas)
- Migrar para PostgreSQL/MySQL em produção (a camada Repository facilita a troca)
- Paginação por cursor para grandes volumes
- Documentação OpenAPI/Swagger
