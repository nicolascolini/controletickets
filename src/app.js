const express = require('express');
const path = require('node:path');
const cors = require('cors');

require('./utils/taskEventLogger'); // registra os observadores de eventos

const taskRoutes = require('./routes/taskRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/tasks', taskRoutes);

// Frontend estático (tela de visualização do CRUD)
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', notFoundHandler);
app.use(errorHandler);

module.exports = app;
