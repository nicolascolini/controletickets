const eventBus = require('./EventBus');

/**
 * Observador simples que reage a eventos de domínio emitidos pelo
 * TaskService. Demonstra o desacoplamento do padrão Observer: novos
 * "assinantes" (ex.: envio de e-mail, webhook, métrica) podem ser
 * adicionados aqui sem tocar em TaskService.
 */
eventBus.on('task:created', (task) => {
  console.log(`[evento] Tarefa criada: #${task.id} - "${task.title}"`);
});

eventBus.on('task:completed', (task) => {
  console.log(`[evento] Tarefa concluída: #${task.id} - "${task.title}"`);
});
