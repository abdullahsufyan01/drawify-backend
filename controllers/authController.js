const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationCode } = require('../utils/sendEmail');

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

exports.register = async (req, res) => {
  console.log('user hit')
  try {
    const { name, email, dob, phone, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const expireTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user = await User.create({
      name,
      email,
      dob,
      phone,
      password: hashedPassword,
      verificationCode: code,
      verificationCodeExpires: expireTime
    });

    await sendVerificationCode(email, code);

    const token = generateToken(user);
    res.status(201).json({ token, user: { ...user.toObject(), password: undefined } });
    console.log('User registered successfully:', user.email);
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  console.log('Login attempt');
  
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const safeUser = { ...user.toObject(), password: undefined };

    if (!user.isVerified) {
      // Resend new code if expired
      if (user.verificationCodeExpires < new Date()) {
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = newCode;
        user.verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();
        await sendVerificationCode(email, newCode);

        return res.status(403).json({
          message: 'Verification code expired. A new code has been sent to your email.',
          user: safeUser
        });
      }

      return res.status(403).json({
        message: 'Email not verified. Please enter the verification code sent to your email.',
        user: safeUser
      });
    }

    const token = generateToken(user);
    res.status(200).json({ token, user: safeUser });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.verifyCode = async (req, res) => {
  console.log('Verify code request');
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    console.log('User found:', user );
    

    if (!user || !user.verificationCode) {
      return res.status(400).json({ message: 'Verification failed' });
    }

    if (user.verificationCode !== code || user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    const token = generateToken(user);
    res.status(200).json({ message: 'Email verified', token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.resendCode = async (req, res) => {
  console.log('Resend verification code request');
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    console.log('User found:', user.email);

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newCode;
    user.verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendVerificationCode(email, newCode);

    res.status(200).json({ message: 'Verification code resent to your email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
