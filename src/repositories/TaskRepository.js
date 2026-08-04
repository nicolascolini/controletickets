const Database = require('../config/database');
const { Task } = require('../models/Task');

/**
 * TaskRepository (Repository Pattern)
 * Isola toda a lógica de acesso a dados (SQL) do restante da aplicação.
 * A camada de serviço não sabe (e não precisa saber) que o dado está em SQLite.
 */
class TaskRepository {
  constructor() {
    this.db = Database.getInstance().getConnection();
  }

  create(data) {
    const stmt = this.db.prepare(`
      INSERT INTO tasks (title, description, status, priority, due_date)
      VALUES (@title, @description, @status, @priority, @due_date)
    `);

    const info = stmt.run({
      title: data.title,
      description: data.description ?? '',
      status: data.status ?? 'pending',
      priority: data.priority ?? 'medium',
      due_date: data.due_date ?? null,
    });

    return this.findById(info.lastInsertRowid);
  }

  findById(id) {
    const row = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    return row ? new Task(row) : null;
  }

  findAll({ status, priority, page = 1, limit = 20 } = {}) {
    const conditions = [];
    const params = {};

    if (status) {
      conditions.push('status = @status');
      params.status = status;
    }
    if (priority) {
      conditions.push('priority = @priority');
      params.priority = priority;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const rows = this.db
      .prepare(`SELECT * FROM tasks ${where} ORDER BY created_at DESC LIMIT @limit OFFSET @offset`)
      .all({ ...params, limit, offset });

    const total = this.db
      .prepare(`SELECT COUNT(*) as count FROM tasks ${where}`)
      .get(params).count;

    return {
      data: rows.map((row) => new Task(row)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  update(id, data) {
    const existing = this.findById(id);
    if (!existing) return null;

    const merged = { ...existing.toJSON(), ...data };

    this.db.prepare(`
      UPDATE tasks
      SET title = @title, description = @description, status = @status,
          priority = @priority, due_date = @due_date
      WHERE id = @id
    `).run({ ...merged, id });

    return this.findById(id);
  }

  delete(id) {
    const info = this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return info.changes > 0;
  }
}

module.exports = TaskRepository;
