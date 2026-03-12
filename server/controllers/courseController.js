import {
  courses,
  generateCourseId,
} from '../data/database.js';

export function getCourses(req, res) {
  res.json(courses);
}

export function getCourseById(req, res) {
  const id = Number(req.params.id);
  const course = courses.find((c) => c.id === id);

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  res.json(course);
}

export function createCourse(req, res) {
  const data = req.body || {};

  const newCourse = {
    id: generateCourseId(),
    created_date: new Date().toISOString(),
    ...data,
  };

  courses.push(newCourse);
  res.status(201).json(newCourse);
}

