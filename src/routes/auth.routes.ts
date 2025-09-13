import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/auth.controller';
import { verifyEmail, resendVerificationEmail } from '../controllers/emailVerification.controller';

const router = Router();

// Validation rules
const registerValidation = [
  body('stage_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Stage name must be between 2 and 50 characters'),
  body('university_email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid university email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('university_email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const resendVerificationValidation = [
  body('university_email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationValidation, resendVerificationEmail);

export default router;
