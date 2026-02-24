const { body, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed.',
            details: errors.array().map(e => ({ field: e.path, message: e.msg }))
        });
    }
    next();
};

// Employee validation rules
const employeeRules = [
    body('name').trim().escape().notEmpty().withMessage('Name is required.')
        .isLength({ max: 100 }).withMessage('Name must be under 100 characters.'),
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('role').trim().escape().notEmpty().withMessage('Role is required.'),
    body('department').trim().escape().notEmpty().withMessage('Department is required.'),
    body('skills').optional().isArray().withMessage('Skills must be an array.'),
    body('wallet_address').optional({ nullable: true }).trim()
];

// Task validation rules
const taskRules = [
    body('employee_id').isInt({ min: 1 }).withMessage('Valid employee ID is required.'),
    body('title').trim().escape().notEmpty().withMessage('Title is required.')
        .isLength({ max: 200 }).withMessage('Title must be under 200 characters.'),
    body('description').optional({ nullable: true }).trim().escape()
        .isLength({ max: 1000 }).withMessage('Description must be under 1000 characters.'),
    body('deadline').optional({ nullable: true }).isISO8601().withMessage('Deadline must be a valid date.')
];

// Auth validation rules
const loginRules = [
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.')
];

const registerRules = [
    body('name').trim().escape().notEmpty().withMessage('Organization name is required.')
        .isLength({ max: 100 }).withMessage('Name must be under 100 characters.'),
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
];

module.exports = {
    validate,
    employeeRules,
    taskRules,
    loginRules,
    registerRules
};
