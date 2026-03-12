// Simple in-memory database for demo purposes only.
// This models Students, Faculty, Courses, and Users.

export const users = [
  {
    id: 1,
    email: 'admin@academiahub.com',
    full_name: 'Administrator',
    role: 'admin',
    password: 'Admin@123',
  },
];

export const students = [
  {
    id: 101,
    name: 'Akash',
    course: 'BTech',
    student_id: 'S1001',
    first_name: 'Akash',
    last_name: 'Singh',
    email: 'akash@example.com',
    major: 'Computer Science',
    year: 'Senior',
    gpa: 3.6,
    status: 'Active',
    created_date: new Date().toISOString(),
  },
];

export const faculty = [
  {
    id: 201,
    faculty_id: 'F2001',
    first_name: 'Neha',
    last_name: 'Verma',
    email: 'neha.verma@university.edu',
    department: 'Computer Science',
    position: 'Associate Professor',
    created_date: new Date().toISOString(),
  },
];

export const courses = [
  {
    id: 301,
    code: 'CS101',
    name: 'Introduction to Computer Science',
    department: 'Computer Science',
    credits: 4,
    semester: 'Fall',
    year: 2025,
    faculty_id: 201,
    created_date: new Date().toISOString(),
  },
];

let nextStudentId = 102;
let nextFacultyId = 202;
let nextCourseId = 302;
let nextUserId = 2;

export function generateStudentId() {
  return nextStudentId++;
}

export function generateFacultyId() {
  return nextFacultyId++;
}

export function generateCourseId() {
  return nextCourseId++;
}

export function generateUserId() {
  return nextUserId++;
}

