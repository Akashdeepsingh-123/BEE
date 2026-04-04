import {
  students,
  generateStudentId,
} from '../data/database.js';
import { UserModel } from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import { sendTempPasswordEmail } from '../utils/emailService.js';
import crypto from 'crypto';

export async function getStudents(req, res) {
  try {
    const studentsList = await UserModel.find({ role: 'student' }).select('-password');
    // Map backend fields to frontend expected fields
    const mapped = studentsList.map(s => {
      const doc = s.toObject();
      return {
        ...doc,
        id: doc._id,
        student_id: doc.studentId || doc.student_id,
        first_name: doc.first_name || doc.full_name?.split(' ')[0] || '',
        last_name: doc.last_name || doc.full_name?.split(' ').slice(1).join(' ') || '',
      };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students' });
  }
}

export async function getStudentById(req, res) {
  try {
    const student = await UserModel.findById(req.params.id).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student' });
  }
}

export async function createStudent(req, res) {
  try {
    // Frontend sends: student_id, first_name, last_name, email, major, etc.
    const data = req.body;
    const email = data.email;
    const studentId = data.student_id || data.studentId;
    const full_name = data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim();

    if (!email || !studentId) {
      return res.status(400).json({ message: 'Email and Student ID are required' });
    }

    const existingUser = await UserModel.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email or Student ID already exists' });
    }

    const segments = [
      Math.random().toString(36).slice(-3).toUpperCase(),
      Math.random().toString(10).slice(-3),
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ];
    const tempPassword = `Stu-${segments.join('')}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = new UserModel({
      ...data,
      full_name: full_name || email.split('@')[0],
      email,
      studentId,
      student_id: studentId,
      password: hashedPassword,
      role: 'student',
      firstLogin: true,
      courses: data.courses || []
    });

    await newUser.save();

    // Send email with temp password
    await sendTempPasswordEmail(email, studentId, tempPassword, newUser.full_name);

    res.status(201).json({ 
      ...newUser.toObject(), 
      id: newUser._id 
    });
  } catch (error) {
    console.error('Create Student Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateStudent(req, res) {
  try {
    const updated = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');

    if (!updated) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating student' });
  }
}

export async function deleteStudent(req, res) {
  try {
    const removed = await UserModel.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ id: removed._id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student' });
  }
}

export async function getStudentProfile(req, res) {
  try {
    const { id } = req.user; // from JWT
    const student = await UserModel.findById(id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getStudentCourses(req, res) {
  try {
    const { id } = req.user; // from JWT
    const student = await UserModel.findById(id).populate('courses', 'courseName');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student.courses);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

