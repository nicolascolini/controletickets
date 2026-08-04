const TaskRepository = require('../repositories/TaskRepository');
const { Task } = require('../models/Task');
const AppError = require('../utils/AppError');
const eventBus = require('../utils/EventBus');

/**
 * TaskService (Service Layer)
 * Concentra as regras de negócio da aplicação. Os controllers não falam
 * diretamente com o repository — tudo passa por aqui, o que facilita
 * testes unitários e reuso da lógica (ex.: numa fila, num job agendado etc.).
 */
class TaskService {
  constructor(repository = new TaskRepository()) {
    this.repository = repository;
  }

  create(payload) {
    const errors = Task.validate(payload);
    if (errors.length) {
      throw new AppError('Dados inválidos para criação da tarefa.', 422, errors);
    }

    const task = this.repository.create(payload);
    eventBus.emit('task:created', task);
    return task;
  }

  list(filters) {
    return this.repository.findAll(filters);
  }

  getById(id) {
    const task = this.repository.findById(id);
    if (!task) {
      throw new AppError(`Tarefa com id ${id} não encontrada.`, 404);
    }
    return task;
  }

  update(id, payload) {
    const errors = Task.validate(payload, { partial: true });
    if (errors.length) {
      throw new AppError('Dados inválidos para atualização da tarefa.', 422, errors);
    }

    this.getById(id); // garante 404 se não existir
    const updated = this.repository.update(id, payload);

    if (payload.status === 'done') {
      eventBus.emit('task:completed', updated);
    }

    return updated;
  }

  delete(id) {
    this.getById(id); // garante 404 se não existir
    this.repository.delete(id);
  }
}

module.exports = TaskService;
