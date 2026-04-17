import { makeEntity } from './model';
import { sendTempPasswordEmail } from '@/utils/emailService';

const CURRENT_KEY = 'sms:currentUser';
const AUTH_API_BASE = '/api/auth';

function readCurrent() {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_e) {
    return null;
  }
}

function writeCurrent(user) {
  if (user) localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
  else localStorage.removeItem(CURRENT_KEY);
}

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

function generateTempPassword(role = 'student') {
  const prefix = role === 'faculty' ? 'Fac' : 'Stu';
  const segments = [
    Math.random().toString(36).slice(-3).toUpperCase(),
    Math.random().toString(10).slice(-3),
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ];
  return `${prefix}-${segments.join('')}`;
}

async function notifyTempPassword(email, password, fullName, role = 'student') {
  try {
    await sendTempPasswordEmail(email, password, fullName, role);
  } catch (error) {
    console.error('Error sending email notification:', error);
    // Fallback alert
    alert(
      `📧 Temporary Password Generated\n\n` +
      `Email: ${email}\n` +
      `Password: ${password}\n\n` +
      `Please save these credentials securely.`
    );
  }
}

const base = makeEntity('User');

async function findByEmail(email) {
  if (!email) return null;
  const normalized = normalizeEmail(email);
  const all = await base.list();
  return all.find((user) => normalizeEmail(user.email) === normalized) || null;
}

async function findStudentAccount(studentId) {
  if (!studentId) return null;
  const all = await base.list();
  return all.find(
    (user) =>
      user.profile_type === 'student' &&
      user.profile_id === studentId
  ) || null;
}

async function findFacultyAccount(facultyId) {
  if (!facultyId) return null;
  const all = await base.list();
  return all.find(
    (user) =>
      user.profile_type === 'faculty' &&
      user.profile_id === facultyId
  ) || null;
}

const DEFAULT_ADMIN = {
  email: 'admin@academiahub.com',
  full_name: 'Administrator',
  role: 'admin',
  password: 'Admin@123'
};

export const User = {
  ...base,
  async me() {
    const user = readCurrent();
    if (!user) throw new Error('Not authenticated');
    return user;
  },
  async ensureDefaultAdmin() {
    const all = await base.list();
    let admin = all.find((u) => u.role === 'admin');
    if (!admin) {
      admin = await base.create(DEFAULT_ADMIN);
      return admin;
    }

    const updates = {};
    if (normalizeEmail(admin.email) !== normalizeEmail(DEFAULT_ADMIN.email)) {
      updates.email = DEFAULT_ADMIN.email;
    }
    if (!admin.full_name) {
      updates.full_name = DEFAULT_ADMIN.full_name;
    }
    if (!admin.password || admin.password !== DEFAULT_ADMIN.password) {
      updates.password = DEFAULT_ADMIN.password;
    }

    if (Object.keys(updates).length > 0) {
      admin = await base.update(admin.id, updates);
    }

    return admin;
  },
  async loginWithCredentials(email, password) {
    if (!email || !password) throw new Error('Email and password are required');

    const res = await fetch(`${AUTH_API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let errorMessage = 'Unable to sign in';
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Fallback if not JSON
      }
      throw new Error(errorMessage);
    }

    const user = await res.json();
    writeCurrent(user);
    return user;
  },
  async logout() {
    writeCurrent(null);
    return true;
  },
  async syncStudentAccount(student, options = {}) {
    // Handled entirely by backend controllers now
    return null;
  },
  async syncFacultyAccount(faculty, options = {}) {
    // Handled entirely by backend controllers now
    return null;
  },
  async updateProfile(id, formData) {
    const res = await fetch(`${AUTH_API_BASE}/profile/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!res.ok) {
      let errorMessage = 'Unable to update profile';
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }

    const updatedUser = await res.json();
    
    // Update current user if this is the logged in user
    const current = readCurrent();
    if (current && (current.id === updatedUser.id || current._id === updatedUser.id)) {
      writeCurrent({ ...current, ...updatedUser });
    }

    // Attempt to update local base entity as well
    try {
      await base.update(id, updatedUser);
    } catch (e) {
      // Ignore if not found in local db, since MongoDB might be the primary
    }

    return updatedUser;
  }
};
