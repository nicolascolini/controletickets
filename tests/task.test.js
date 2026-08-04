const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

process.env.DB_PATH = path.join(__dirname, 'test-database.sqlite');

const app = require('../src/app');

// Utilitário mínimo para chamar o app Express sem subir uma porta real
async function request(app, method, url, body) {
  const http = require('node:http');
  const server = app.listen(0);
  const { port } = server.address();

  const res = await fetch(`http://localhost:${port}${url}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  server.close();

  return { status: res.status, body: text ? JSON.parse(text) : null };
}

test.after(() => {
  const dbFile = process.env.DB_PATH;
  ['', '-wal', '-shm'].forEach((suffix) => {
    const file = dbFile + suffix;
    if (fs.existsSync(file)) fs.unlinkSync(file);
  });
});

test('GET /health retorna status ok', async () => {
  const res = await request(app, 'GET', '/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'ok');
});

test('POST /api/tasks cria uma tarefa válida', async () => {
  const res = await request(app, 'POST', '/api/tasks', { title: 'Estudar Node.js' });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.title, 'Estudar Node.js');
  assert.strictEqual(res.body.status, 'pending');
});

test('POST /api/tasks rejeita tarefa sem título', async () => {
  const res = await request(app, 'POST', '/api/tasks', {});
  assert.strictEqual(res.status, 422);
});

test('GET /api/tasks/:id retorna 404 para id inexistente', async () => {
  const res = await request(app, 'GET', '/api/tasks/99999');
  assert.strictEqual(res.status, 404);
});

test('PUT /api/tasks/:id atualiza status da tarefa', async () => {
  const created = await request(app, 'POST', '/api/tasks', { title: 'Revisar PR' });
  const updated = await request(app, 'PUT', `/api/tasks/${created.body.id}`, { status: 'done' });
  assert.strictEqual(updated.status, 200);
  assert.strictEqual(updated.body.status, 'done');
});

test('DELETE /api/tasks/:id remove a tarefa', async () => {
  const created = await request(app, 'POST', '/api/tasks', { title: 'Tarefa temporária' });
  const deleted = await request(app, 'DELETE', `/api/tasks/${created.body.id}`);
  assert.strictEqual(deleted.status, 204);

  const check = await request(app, 'GET', `/api/tasks/${created.body.id}`);
  assert.strictEqual(check.status, 404);
});
