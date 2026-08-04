const { Router } = require('express');
const TaskController = require('../controllers/TaskController');

const router = Router();
const controller = new TaskController();

router.post('/', controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
