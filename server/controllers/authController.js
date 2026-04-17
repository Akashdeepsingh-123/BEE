import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/UserModel.js';

const JWT_SECRET = 'academiahub_secret_token_key_123';

export async function register(req, res) {
  try {
    const { email, password, full_name, role } = req.body;
    const profilePic = req.file ? `/uploads/${req.file.filename}` : null;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await UserModel.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (existingUser) {
      existingUser.password = hashedPassword;
      existingUser.firstLogin = true;
      if (full_name) existingUser.full_name = full_name;
      if (role) existingUser.role = role;
      if (profilePic) existingUser.profilePic = profilePic;
      await existingUser.save();
      user = existingUser;
    } else {
      user = new UserModel({
        email,
        password: hashedPassword,
        full_name: full_name || email.split('@')[0],
        role: role || 'student',
        profilePic,
        firstLogin: true
      });
      await user.save();
    }

    // Create JWT
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      id: user._id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      profilePic: user.profilePic,
      token
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await UserModel.findOne({ 
      $or: [{ email: email }, { studentId: email }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.password) {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } else if (!user.password && user.googleId) {
       return res.status(401).json({ message: 'Please login using Google Account' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      id: user._id,
      email: user.email,
      studentId: user.studentId,
      full_name: user.full_name,
      role: user.role,
      profilePic: user.profilePic,
      firstLogin: user.firstLogin,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { id } = req.params;
    const { full_name } = req.body;
    
    const updates = {};
    if (full_name) updates.full_name = full_name;
    if (req.file) updates.profilePic = `/uploads/${req.file.filename}`;

    const user = await UserModel.findByIdAndUpdate(id, updates, { new: true });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      id: user._id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      profilePic: user.profilePic,
      token
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function changePassword(req, res) {
  try {
    const { id } = req.user; // from JWT middleware
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await UserModel.findByIdAndUpdate(id, {
      password: hashedPassword,
      firstLogin: false
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
