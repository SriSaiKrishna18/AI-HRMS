const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

router.get('/productivity/:employeeId', auth, aiController.getProductivityScore);
router.get('/skill-gap/:employeeId', auth, aiController.getSkillGap);
router.get('/suggest-assignment', auth, aiController.suggestAssignment);
router.get('/trend/:employeeId', auth, aiController.getPerformanceTrend);

module.exports = router;
