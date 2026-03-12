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

    // Try backend authentication first
    try {
      const res = await fetch(`${AUTH_API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Unable to sign in');
      }

      const user = await res.json();
      writeCurrent(user);
      return user;
    } catch (apiError) {
      console.warn('Auth API login failed, falling back to local auth:', apiError);
    }

    // Fallback to local, entity-based auth (existing behavior)
    await this.ensureDefaultAdmin();
    const user = await findByEmail(email);
    if (!user) throw new Error('Account not found for this email');
    if (user.password !== password) throw new Error('Invalid password. Please try again.');
    writeCurrent(user);
    return user;
  },
  async logout() {
    writeCurrent(null);
    return true;
  },
  async syncStudentAccount(student, options = {}) {
    if (!student || !student.email) return null;
    const normalizedEmail = normalizeEmail(student.email);
    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.email;
    let user = await findStudentAccount(student.id);
    const isNewAccount = !user;

    if (user) {
      const updates = {};
      if (normalizeEmail(user.email) !== normalizedEmail) updates.email = normalizedEmail;
      if (user.full_name !== fullName) updates.full_name = fullName;
      if (!user.password) {
        updates.password = generateTempPassword('student');
        if (options.sendEmail) {
          await notifyTempPassword(normalizedEmail, updates.password, fullName, 'student');
        }
      }
      if (Object.keys(updates).length > 0) {
        user = await base.update(user.id, updates);
      }
      return user;
    }

    const password = generateTempPassword('student');
    user = await base.create({
      email: normalizedEmail,
      full_name: fullName,
      role: 'student',
      password,
      profile_type: 'student',
      profile_id: student.id
    });

    if (options.sendEmail) {
      await notifyTempPassword(normalizedEmail, password, fullName, 'student');
    }

    // Also attempt to register in backend (non-blocking)
    try {
      await fetch(`${AUTH_API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          role: 'student',
          full_name: fullName,
        }),
      });
    } catch (e) {
      console.warn('Failed to register student in backend auth store', e);
    }

    return user;
  },
  async syncFacultyAccount(faculty, options = {}) {
    if (!faculty || !faculty.email) return null;
    const normalizedEmail = normalizeEmail(faculty.email);
    const fullName = `${faculty.first_name || ''} ${faculty.last_name || ''}`.trim() || faculty.email;
    let user = await findFacultyAccount(faculty.id);
    const isNewAccount = !user;

    if (user) {
      const updates = {};
      if (normalizeEmail(user.email) !== normalizedEmail) updates.email = normalizedEmail;
      if (user.full_name !== fullName) updates.full_name = fullName;
      if (!user.password) {
        updates.password = generateTempPassword('faculty');
        if (options.sendEmail) {
          await notifyTempPassword(normalizedEmail, updates.password, fullName, 'faculty');
        }
      }
      if (Object.keys(updates).length > 0) {
        user = await base.update(user.id, updates);
      }
      return user;
    }

    const password = generateTempPassword('faculty');
    user = await base.create({
      email: normalizedEmail,
      full_name: fullName,
      role: 'faculty',
      password,
      profile_type: 'faculty',
      profile_id: faculty.id
    });

    if (options.sendEmail) {
      await notifyTempPassword(normalizedEmail, password, fullName, 'faculty');
    }

    // Also attempt to register in backend (non-blocking)
    try {
      await fetch(`${AUTH_API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          role: 'faculty',
          full_name: fullName,
        }),
      });
    } catch (e) {
      console.warn('Failed to register faculty in backend auth store', e);
    }

    return user;
  }
};
