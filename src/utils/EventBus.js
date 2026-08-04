const { EventEmitter } = require('node:events');

/**
 * EventBus (Observer Pattern)
 * Permite que partes do sistema "assinem" eventos de domínio
 * (ex.: tarefa criada, tarefa concluída) sem acoplar a camada de
 * serviço a quem consome esses eventos (logs, notificações, etc.).
 */
class EventBus extends EventEmitter {}

module.exports = new EventBus();
