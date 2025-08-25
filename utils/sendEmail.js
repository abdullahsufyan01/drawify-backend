const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // smtp.gmail.com
  port: Number(process.env.EMAIL_PORT), // 465
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_FROM, // Your Gmail address
    pass: process.env.EMAIL_PASS, // App Password, NOT Gmail login password
  },
});

exports.sendVerificationCode = async (to, code) => {
  console.log(`Sending verification code to ${to}: ${code}`);
  try {
    const info = await transporter.sendMail({
      from: `"Auth App" <${process.env.EMAIL_FROM}>`,
      to,
      subject: 'Your verification code',
      text: `Your verification code is: ${code}`,
    });

    console.log(`Verification code sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error('Email send failed:', error.message);
  }
};
