import { Router } from 'express';
import {
  getFaculty,
  getFacultyById,
  createFaculty,
} from '../controllers/facultyController.js';

const router = Router();

router.get('/', getFaculty);
router.get('/:id', getFacultyById);
router.post('/', createFaculty);

export default router;

