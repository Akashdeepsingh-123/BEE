import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentProfile,
  getStudentCourses,
} from '../controllers/studentController.js';
import { getStudentAttendance, markAttendance } from '../controllers/attendanceController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getStudents);
router.get('/profile', requireAuth, getStudentProfile);
router.get('/courses', requireAuth, getStudentCourses);
router.get('/attendance', requireAuth, getStudentAttendance);
router.post('/attendance/mark', markAttendance); // usually protected for admin/faculty, but sticking to basic implementation
router.get('/:id', getStudentById);
router.post('/create-student', createStudent); // Maps to /api/students/create-student OR /admin/create-student depending on mount
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;

