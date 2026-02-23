const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const auth = require('../middleware/auth');

router.post('/', auth, employeeController.create);
router.get('/', auth, employeeController.getAll);
router.get('/:id', auth, employeeController.getOne);
router.put('/:id', auth, employeeController.update);
router.delete('/:id', auth, employeeController.remove);

module.exports = router;
