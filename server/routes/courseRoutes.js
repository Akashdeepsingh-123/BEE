import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  assignCourse,
  updateCourse,
  deleteCourse
} from '../controllers/courseController.js';

const router = Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', createCourse);
router.post('/assign', assignCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

export default router;

