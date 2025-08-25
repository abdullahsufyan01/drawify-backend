require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const connectToMongoDB = require('./db/mongo_db');

const app = express();
app.use(express.json());

connectToMongoDB();

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

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
