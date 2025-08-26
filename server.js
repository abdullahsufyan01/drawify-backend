require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const connectToMongoDB = require('./db/mongo_db');
const crypto = require("crypto");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());

connectToMongoDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3200",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// JazzCash credentials
// Use environment variables
const merchantId = process.env.JAZZCASH_MERCHANT_ID;
const password = process.env.JAZZCASH_PASSWORD;
const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
const returnUrl = process.env.JAZZCASH_RETURN_URL;

// Helper function to create secure hash
// A correct implementation would look something like this:
function generateSecureHash(data, integritySalt) {
  const hashString =
    (data.pp_TxnType || "") +
    "&" +
    (data.pp_ExpiryDateTime || "") +
    "&" +
    (data.pp_BillReference || "") +
    "&" +
    (data.pp_TxnCurrency || "") +
    "&" +
    (data.pp_Language || "") +
    "&" +
    (data.pp_Password || "") +
    "&" +
    (data.pp_MerchantID || "") +
    "&" +
    (data.pp_ReturnURL || "") +
    "&" +
    (data.pp_TxnRefNo || "") +
    "&" +
    (data.pp_Amount || "") +
    "&" +
    (data.pp_Version || "") +
    "&" +
    (data.pp_Description || "") +
    "&" +
    (data.pp_TxnDateTime || "");

  return crypto
    .createHmac("sha256", integritySalt)
    .update(hashString)
    .digest("hex");
}

// Create payment request API
app.post("/api/payment/jazzcash/create", (req, res) => {
  const { amount, description } = req.body;

  const amountInPaisa = (amount * 100).toString();
  const transactionDateTime = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const expiryDateTime = new Date(Date.now() + 60 * 60 * 1000)
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  const orderId = "T" + Date.now();

  let data = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_Password: password,
    pp_TxnRefNo: orderId,
    pp_Amount: amountInPaisa,
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: transactionDateTime,
    pp_BillReference: "billRef",
    pp_Description: description || "Test Transaction",
    pp_TxnExpiryDateTime: expiryDateTime,
    pp_ReturnURL: returnUrl,
  };

  data.pp_SecureHash = generateSecureHash(data, integritySalt);
  // Add the password back to the payload sent to the client
  data.pp_Password = password;

  return res.json({
    paymentUrl: "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/",
    payload: data,
  });
});

// Callback API
app.post("/api/payment/jazzcash/callback", (req, res) => {
  console.log("JazzCash Callback:", req.body);
  res.send("Callback received ✅");
});

// Easypaisa callback
app.post("/api/payment/easypaisa/callback", (req, res) => {
  console.log("Easypaisa Callback:", req.body);
  res.status(200).send("Callback received");
});

// Root GET API for testing
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Backend Test</title></head>
      <body>
        <h1>Server is running!</h1>
        <pre>${JSON.stringify({ status: 'ok', message: 'Server is running!' }, null, 2)}</pre>
      </body>
    </html>
  `);
});
app.post('/test', (req, res) => res.json({ ok: true }));
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;






