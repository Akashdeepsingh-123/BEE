import {
  faculty,
  generateFacultyId,
} from '../data/database.js';

export function getFaculty(req, res) {
  res.json(faculty);
}

export function getFacultyById(req, res) {
  const id = Number(req.params.id);
  const member = faculty.find((f) => f.id === id);

  if (!member) {
    return res.status(404).json({ message: 'Faculty member not found' });
  }

  res.json(member);
}

export function createFaculty(req, res) {
  const data = req.body || {};

  const newFaculty = {
    id: generateFacultyId(),
    created_date: new Date().toISOString(),
    ...data,
  };

  faculty.push(newFaculty);
  res.status(201).json(newFaculty);
}

