import {
  students,
  generateStudentId,
} from '../data/database.js';

export function getStudents(req, res) {
  res.json(students);
}

export function getStudentById(req, res) {
  const id = Number(req.params.id);
  const student = students.find((s) => s.id === id);

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.json(student);
}

export function createStudent(req, res) {
  const data = req.body || {};

  const newStudent = {
    id: generateStudentId(),
    created_date: new Date().toISOString(),
    ...data,
  };

  students.push(newStudent);
  res.status(201).json(newStudent);
}

export function updateStudent(req, res) {
  const id = Number(req.params.id);
  const data = req.body || {};

  const index = students.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const updated = {
    ...students[index],
    ...data,
    updated_date: new Date().toISOString(),
  };

  students[index] = updated;
  res.json(updated);
}

export function deleteStudent(req, res) {
  const id = Number(req.params.id);
  const index = students.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const [removed] = students.splice(index, 1);
  res.json({ id: removed.id });
}

