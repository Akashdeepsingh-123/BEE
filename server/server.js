import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import mongoose from 'mongoose';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import demoRoutes from './evaluation-demo.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = 5120;
const distPath = path.join(__dirname, '..', 'dist');

// Setup HTTP server and Socket.io for Full Duplex Communication
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  socket.on('sendMessage', (msg) => {
    // Broadcast message to all connected clients
    io.emit('receiveMessage', { id: socket.id, message: msg });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Setup EJS Template Engine for SSR
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Connect to MongoDB using Mongoose ODM
mongoose.connect('mongodb://127.0.0.1:27017/student-management', {
  serverSelectionTimeoutMS: 2000 // Timeout quickly if MongoDB is not running locally
}).then(() => {
  console.log("Connected to MongoDB successfully!");
}).catch(err => {
  console.log("MongoDB connection failed (it might not be running locally). Continuing anyway...");
});

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserModel } from './models/UserModel.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'academiahub_secret_token_key_123';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'DUMMY_CLIENT_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'DUMMY_CLIENT_SECRET',
    callbackURL: "http://localhost:5173/api/auth/google/callback", // Absolute URL for Vite proxy
    proxy: true
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      let user = await UserModel.findOne({ googleId: profile.id });
      if (!user) {
        user = await UserModel.findOne({ email: profile.emails[0].value });
        if (user) {
          user.googleId = profile.id;
          await user.save();
        } else {
          const email = profile.emails[0].value;
          // Automatically make deepakash1015@gmail.com an admin
          const userRole = email.toLowerCase() === 'deepakash1015@gmail.com' ? 'admin' : 'student';
          
          user = new UserModel({
            googleId: profile.id,
            email: email,
            full_name: profile.displayName,
            profilePic: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
            role: userRole
          });
          await user.save();
        }
      }
        
        // Force deepakash1015@gmail.com to always be an admin, even if previously saved as student
        if (user.email.toLowerCase() === 'deepakash1015@gmail.com' && user.role !== 'admin') {
          user.role = 'admin';
          await user.save();
        }

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
      return cb(null, { ...user.toObject(), token });
    } catch (error) {
      return cb(error, null);
    }
  }
));

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Body Parser for form data
app.use(cookieParser()); // Cookie parser middleware

// Session Management Middleware
app.use(session({
  secret: 'super_secret_session_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // false for localhost
}));

app.use(passport.initialize());
app.use(passport.session());

// App-level middleware
app.use((req, res, next) => {
  console.log(`[App Middleware] Time: ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))); // Serve profile pics

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/demo', demoRoutes); // Routes for evaluation

// SSR Route Example
app.get('/ssr-demo', (req, res) => {
  res.render('demo', {
    message: 'Hello from Express.js SSR!',
    time: new Date().toLocaleTimeString(),
    method: req.method
  });
});

app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next(err);
  });
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'Route not found' });
  }
  next();
});

// Error-Handling Middleware
app.use(errorHandler);
app.use((err, req, res, next) => {
  console.error('[Error Middleware]', err.message);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
