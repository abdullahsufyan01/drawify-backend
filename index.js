require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const connectToMongoDB = require('./db/mongo_db');

const app = express();
app.use(express.json());

connectToMongoDB();
// Middleware
app.use(cors({
  origin: "http://localhost:3200", // Use specific origin in production like "https://yourfrontend.com"
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// JazzCash callback
app.post("/api/payment/jazzcash/callback", (req, res) => {
  console.log("JazzCash Callback:", req.body);
  res.status(200).send("Callback received");
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


const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
