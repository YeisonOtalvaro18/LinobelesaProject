const express = require('express');
const router = express.Router();
const connectDB = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


router.post('/register', async (req, res) => {
  const db = await connectDB();
  const users = db.collection('users');
  const { name, email, password } = req.body;

  if (!name || !email || !password) return res.status(400).json({ error: "Campos obligatorios" });

  const exists = await users.findOne({ email });
  if (exists) return res.status(409).json({ error: "Correo ya registrado" });

  const hashed = await bcrypt.hash(password, 10);
  await users.insertOne({ name, email, password: hashed, createdAt: new Date() });

  res.json({ success: true });
});


router.post('/login', async (req, res) => {
  const db = await connectDB();
  const users = db.collection('users');
  const { email, password } = req.body;

  const user = await users.findOne({ email });
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Credenciales inválidas" });

  const token = jwt.sign({ userId: user._id, name: user.name }, "linobelesa_secret", { expiresIn: "2h" });
  res.json({ success: true, token });
});

module.exports = router;
