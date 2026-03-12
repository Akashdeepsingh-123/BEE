import {
  users,
  generateUserId,
} from '../data/database.js';

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

export function register(req, res) {
  const { email, password, role = 'student', full_name } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const existing = users.find((u) => normalizeEmail(u.email) === normalizeEmail(email));
  if (existing) {
    return res.status(409).json({ message: 'User already exists with this email' });
  }

  const user = {
    id: generateUserId(),
    email,
    password,
    role,
    full_name: full_name || email.split('@')[0],
  };

  users.push(user);

  res.status(201).json({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  });
}

export function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = users.find((u) => normalizeEmail(u.email) === normalizeEmail(email));
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  });
}

