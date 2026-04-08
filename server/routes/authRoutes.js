import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import passport from 'passport';
import { login, register, updateProfile, changePassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

// Setup multer for profilePic upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const router = Router();

router.post('/login', login);
router.post('/register', upload.single('profilePic'), register);
router.put('/profile/:id', upload.single('profilePic'), updateProfile);
router.post('/change-password', requireAuth, changePassword);

import { UserModel } from '../models/UserModel.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'academiahub_secret_token_key_123';

// Google OAuth Routes (Real implementation for Account Chooser screen)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/?error=google_failed' }),
  function(req, res) {
    // Successful authentication, redirect to Vite frontend dashboard with token, email, and role
    res.redirect(`http://localhost:5173/?googleToken=${req.user.token}&email=${encodeURIComponent(req.user.email)}&role=${req.user.role}`);
  });

export default router;
