/**
 * AppError
 * Erro de aplicação com status HTTP associado, permitindo que o
 * middleware de tratamento de erros responda de forma padronizada.
 */
class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = AppError;
