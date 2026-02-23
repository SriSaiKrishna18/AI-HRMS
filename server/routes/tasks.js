const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

router.post('/', auth, taskController.create);
router.get('/', auth, taskController.getAll);
router.put('/:id/status', auth, taskController.updateStatus);
router.put('/:id/tx-hash', auth, taskController.storeTxHash);

module.exports = router;
