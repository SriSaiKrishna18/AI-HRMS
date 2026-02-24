const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const auth = require('../middleware/auth');
const { employeeRules, validate } = require('../middleware/validate');

router.post('/', auth, employeeRules, validate, employeeController.create);
router.get('/', auth, employeeController.getAll);
router.get('/:id', auth, employeeController.getOne);
router.put('/:id', auth, employeeRules, validate, employeeController.update);
router.delete('/:id', auth, employeeController.remove);

module.exports = router;
