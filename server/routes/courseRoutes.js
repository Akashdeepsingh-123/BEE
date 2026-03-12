import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
} from '../controllers/courseController.js';

const router = Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', createCourse);

export default router;

