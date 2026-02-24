const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginRules, registerRules, validate } = require('../middleware/validate');

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);

module.exports = router;
