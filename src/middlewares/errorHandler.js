const AppError = require('../utils/AppError');

/**
 * errorHandler
 * Middleware final do Express: transforma qualquer erro lançado
 * nos controllers/serviços em uma resposta HTTP padronizada.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
  }

  console.error(err);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: `Rota ${req.method} ${req.originalUrl} não encontrada.` });
}

module.exports = { errorHandler, notFoundHandler };
