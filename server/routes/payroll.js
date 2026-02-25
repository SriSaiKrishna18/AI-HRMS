const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const auth = require('../middleware/auth');

router.post('/', auth, payrollController.create);
router.get('/:employeeId', auth, payrollController.getByEmployee);
router.put('/:id/tx', auth, payrollController.storeTxHash);

module.exports = router;
