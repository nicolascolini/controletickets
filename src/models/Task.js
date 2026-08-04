const VALID_STATUSES = ['pending', 'in_progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

/**
 * Task (Model)
 * Representa a entidade de domínio e centraliza suas regras de validação,
 * independente de como os dados serão persistidos ou expostos.
 */
class Task {
  constructor({ id, title, description = '', status = 'pending', priority = 'medium', due_date = null, created_at, updated_at }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
    this.priority = priority;
    this.due_date = due_date;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static validate(data, { partial = false } = {}) {
    const errors = [];

    if (!partial || data.title !== undefined) {
      if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
        errors.push('O campo "title" é obrigatório e deve ser uma string não vazia.');
      } else if (data.title.length > 150) {
        errors.push('O campo "title" deve ter no máximo 150 caracteres.');
      }
    }

    if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
      errors.push(`O campo "status" deve ser um dos valores: ${VALID_STATUSES.join(', ')}.`);
    }

    if (data.priority !== undefined && !VALID_PRIORITIES.includes(data.priority)) {
      errors.push(`O campo "priority" deve ser um dos valores: ${VALID_PRIORITIES.join(', ')}.`);
    }

    if (data.due_date !== undefined && data.due_date !== null) {
      const parsed = new Date(data.due_date);
      if (Number.isNaN(parsed.getTime())) {
        errors.push('O campo "due_date" deve ser uma data válida (ISO 8601).');
      }
    }

    return errors;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      due_date: this.due_date,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = { Task, VALID_STATUSES, VALID_PRIORITIES };
