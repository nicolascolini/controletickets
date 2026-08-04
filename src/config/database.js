const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

/**
 * Database (Singleton)
 * Garante uma única instância de conexão com o banco durante todo o
 * ciclo de vida da aplicação, evitando múltiplas conexões concorrentes
 * desnecessárias e centralizando a criação do schema.
 */
class Database_ {
  static #instance = null;
  #connection;

  constructor() {
    if (Database_.#instance) {
      throw new Error('Use Database.getInstance() em vez de "new".');
    }

    const dbPath = process.env.DB_PATH || './data/database.sqlite';
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.#connection = new Database(dbPath);
    this.#connection.pragma('journal_mode = WAL');
    this.#connection.pragma('foreign_keys = ON');

    this.#runMigrations();
  }

  static getInstance() {
    if (!Database_.#instance) {
      Database_.#instance = new Database_();
    }
    return Database_.#instance;
  }

  getConnection() {
    return this.#connection;
  }

  #runMigrations() {
    this.#connection.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'in_progress', 'done')),
        priority TEXT NOT NULL DEFAULT 'medium'
          CHECK (priority IN ('low', 'medium', 'high')),
        due_date TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TRIGGER IF NOT EXISTS trg_tasks_updated_at
      AFTER UPDATE ON tasks
      FOR EACH ROW
      BEGIN
        UPDATE tasks SET updated_at = datetime('now') WHERE id = OLD.id;
      END;
    `);
  }

  close() {
    this.#connection.close();
    Database_.#instance = null;
  }
}

module.exports = Database_;
