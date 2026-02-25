const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const auth = require('../middleware/auth');

router.get('/', auth, payrollController.getAll);
router.post('/', auth, payrollController.create);
router.get('/:employeeId', auth, payrollController.getByEmployee);
router.put('/:id/tx', auth, payrollController.storeTxHash);

module.exports = router;
