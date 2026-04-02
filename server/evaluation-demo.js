import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { requireAuth } from './middleware/authMiddleware.js';

const router = express.Router();

// 1. Mongoose Model Example
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true }
});
const DemoUser = mongoose.models.DemoUser || mongoose.model('DemoUser', UserSchema);

// 2. Middleware Demonstration
// Router-level middleware
router.use((req, res, next) => {
  console.log(`[Router Middleware] ${req.method} ${req.url}`);
  next();
});

// 3. Session & Cookies Demonstration
router.get('/set-session', (req, res) => {
  req.session.demoUser = 'test_user';
  res.cookie('demoCookie', 'hello world', { maxAge: 900000, httpOnly: true });
  res.json({ message: 'Session and Cookie set successfully' });
});

router.get('/get-session', (req, res) => {
  res.json({ 
    sessionData: req.session.demoUser || 'No session', 
    cookieData: req.cookies.demoCookie || 'No cookie' 
  });
});

// 4. Blocking vs Non-Blocking code
router.get('/blocking', (req, res) => {
  // Blocking code
  const start = Date.now();
  while (Date.now() - start < 2000) {
    // block thread for 2 seconds
  }
  res.json({ message: 'Blocking task finished after 2 seconds' });
});

router.get('/non-blocking', (req, res) => {
  // Non-blocking code
  setTimeout(() => {
    res.json({ message: 'Non-blocking task finished after 2 seconds' });
  }, 2000);
});

// 5. Authentication with Bcrypt and JWT
const JWT_SECRET = 'supersecretkey123';

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({message: "Email/password required"});
    
    // Bcrypt hashing
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Using MongoDB (Mongoose ODM)
    const newUser = new DemoUser({ email, password: hashedPassword });
    await newUser.save();
    
    res.json({ message: 'User registered via MongoDB and Bcrypt' });
  } catch (error) {
    next(error); // Error-handling middleware triggers
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await DemoUser.findOne({ email });
    if(!user) return res.status(404).json({ message: 'User not found' });
    
    const isValid = await bcrypt.compare(password, user.password);
    if(!isValid) return res.status(401).json({ message: 'Invalid credentials' });
    
    // JWT creation
    const token = jwt.sign({ id: user._id, email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    next(error);
  }
});

// 6. Error handling demonstration route
router.get('/error-test', (req, res, next) => {
  next(new Error('This is a simulated error for error-handling middleware'));
});

// 7. Static page handling using file stream
router.get('/stream-static', (req, res) => {
  const filePath = path.join(process.cwd(), 'views', 'static-demo.html');
  const stream = fs.createReadStream(filePath);
  
  stream.on('open', () => {
    res.setHeader('Content-Type', 'text/html');
    stream.pipe(res);
  });
  
  stream.on('error', (err) => {
    res.status(500).json({ error: 'Error streaming file' });
  });
});

// 8. Protected route using JWT middleware
router.get('/protected', requireAuth, (req, res) => {
  res.json({ 
    message: 'Success! You have accessed a protected route using a valid JWT.',
    user: req.user 
  });
});

export default router;
