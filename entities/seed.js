const keys = {
  Student: 'sms:Student',
  Faculty: 'sms:Faculty',
  Course: 'sms:Course',
}

function writeIfEmpty(key, items) {
  try {
    const existing = localStorage.getItem(key)
    if (!existing || existing === '[]') {
      localStorage.setItem(key, JSON.stringify(items))
    }
  } catch (_e) {}
}

export function seedIfEmpty() {
  const now = new Date().toISOString()
  const students = [
    { id: 'stu-1001', created_date: now, student_id: 'S1001', first_name: 'Akash', last_name: 'Singh', email: 'akash@example.com', major: 'Computer Science', year: 'Senior', gpa: 3.6, status: 'Active' },
    { id: 'stu-1002', created_date: now, student_id: 'S1002', first_name: 'John', last_name: 'Smith', email: 'john.smith@example.com', major: 'Electrical Engineering', year: 'Junior', gpa: 3.2, status: 'Active' },
    { id: 'stu-1003', created_date: now, student_id: 'S1003', first_name: 'Priya', last_name: 'Sharma', email: 'priya.sharma@example.com', major: 'Mechanical Engineering', year: 'Sophomore', gpa: 3.8, status: 'Active' },
    { id: 'stu-1004', created_date: now, student_id: 'S1004', first_name: 'Rohan', last_name: 'Mehta', email: 'rohan.mehta@example.com', major: 'Civil Engineering', year: 'Freshman', gpa: 3.4, status: 'Active' },
    { id: 'stu-1005', created_date: now, student_id: 'S1005', first_name: 'Sara', last_name: 'Khan', email: 'sara.khan@example.com', major: 'Information Technology', year: 'Senior', gpa: 3.7, status: 'Active' },
  ]
  const faculty = [
    { id: 'fac-2001', created_date: now, faculty_id: 'F2001', first_name: 'Neha', last_name: 'Verma', email: 'neha.verma@university.edu', department: 'Computer Science', position: 'Associate Professor' },
    { id: 'fac-2002', created_date: now, faculty_id: 'F2002', first_name: 'Amit', last_name: 'Gupta', email: 'amit.gupta@university.edu', department: 'Electrical Engineering', position: 'Assistant Professor' },
    { id: 'fac-2003', created_date: now, faculty_id: 'F2003', first_name: 'Shalini', last_name: 'Rao', email: 'shalini.rao@university.edu', department: 'Mechanical Engineering', position: 'Professor' },
  ]
  const courses = [
    { id: 'cou-3001', created_date: now, code: 'CS101', name: 'Introduction to Computer Science', department: 'Computer Science', credits: 4, semester: 'Fall', year: 2025, faculty_id: 'fac-2001' },
    { id: 'cou-3002', created_date: now, code: 'EE201', name: 'Circuits and Systems', department: 'Electrical Engineering', credits: 3, semester: 'Spring', year: 2025, faculty_id: 'fac-2002' },
    { id: 'cou-3003', created_date: now, code: 'ME210', name: 'Thermodynamics', department: 'Mechanical Engineering', credits: 3, semester: 'Fall', year: 2025, faculty_id: 'fac-2003' },
  ]

  writeIfEmpty(keys.Student, students)
  writeIfEmpty(keys.Faculty, faculty)
  writeIfEmpty(keys.Course, courses)
}


