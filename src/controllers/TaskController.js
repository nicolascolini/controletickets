const TaskService = require('../services/TaskService');

/**
 * TaskController (MVC - Controller)
 * Responsável apenas por traduzir requisição HTTP <-> chamada de serviço.
 * Nenhuma regra de negócio deve viver aqui.
 */
class TaskController {
  constructor(service = new TaskService()) {
    this.service = service;

    // bind para uso direto como handlers de rota
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.getById = this.getById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  create(req, res, next) {
    try {
      const task = this.service.create(req.body);
      res.status(201).json(task.toJSON());
    } catch (err) {
      next(err);
    }
  }

  list(req, res, next) {
    try {
      const { status, priority, page, limit } = req.query;
      const result = this.service.list({
        status,
        priority,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      res.status(200).json({
        data: result.data.map((t) => t.toJSON()),
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  getById(req, res, next) {
    try {
      const task = this.service.getById(Number(req.params.id));
      res.status(200).json(task.toJSON());
    } catch (err) {
      next(err);
    }
  }

  update(req, res, next) {
    try {
      const task = this.service.update(Number(req.params.id), req.body);
      res.status(200).json(task.toJSON());
    } catch (err) {
      next(err);
    }
  }

  delete(req, res, next) {
    try {
      this.service.delete(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = TaskController;
