API REST de gerenciamento de tarefas construída com Node.js, Express e SQLite, com arquitetura em camadas e padrões de projeto. Acompanha um frontend simples (HTML, CSS e JavaScript puros) para visualizar e operar o CRUD pelo navegador.

Funcionalidades:

CRUD completo de tarefas (criar, listar, consultar, atualizar e excluir)

Filtros por status e priority e paginação na listagem

Validação de dados no modelo, com respostas de erro padronizadas

Eventos de domínio (task:created e task:completed) tratados por observadores

Banco SQLite criado automaticamente na primeira execução

Endpoint de health check

Testes automatizados com o test runner nativo do Node.js
