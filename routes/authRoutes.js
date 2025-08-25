const express = require('express');
const router = express.Router();
const { register, login, verifyCode,resendCode } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verify', verifyCode);
router.post('/resend-code', resendCode); 

module.exports = router;
