import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Course } from '@/entities/Course';
import { Exam } from '@/entities/Exam';
import { Grade } from '@/entities/Grade';
import { Student } from '@/entities/Student';
import { Faculty } from '@/entities/Faculty';
import { Enrollment } from '@/entities/Enrollment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ExamForm from '../components/exams/ExamForm';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function ExamsAndGradesPage() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        let courseList = [];
        if (currentUser.role === 'faculty') {
          const facultyProfile = await Faculty.filter({ email: currentUser.email });
          if (facultyProfile.length > 0) {
            courseList = await Course.filter({ faculty_id: facultyProfile[0].id });
          }
        } else { // Admin
          courseList = await Course.list();
        }
        setCourses(courseList);
      } catch (error) {
        console.error('Error initializing:', error);
      }
    };
    init();
    const onChanged = (e) => {
      const name = e.detail?.name;
      if (!name || ['Course','Exam','Grade','Enrollment','Student'].includes(name)) {
        if (selectedCourseId) {
          fetchExams(selectedCourseId);
          setSelectedExamId((prev) => prev);
        }
      }
    };
    window.addEventListener('sms:entity-changed', onChanged);
    return () => window.removeEventListener('sms:entity-changed', onChanged);
  }, []);

  const fetchExams = async (courseId) => {
    if (!courseId) {
      setExams([]);
      return;
    }
    try {
      const courseExams = await Exam.filter({ course_id: courseId }, '-date');
      setExams(courseExams);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  useEffect(() => {
    fetchExams(selectedCourseId);
  }, [selectedCourseId]);
  
  useEffect(() => {
    if (!selectedExamId || !selectedCourseId) {
      setStudents([]);
      return;
    }
    const fetchStudentsAndGrades = async () => {
      try {
        const enrollments = await Enrollment.filter({ 
          course_id: selectedCourseId, 
          status: 'Enrolled' 
        });
        
        if (enrollments.length > 0) {
          const allStudents = await Student.list();
          const enrolledStudents = allStudents.filter(student => 
            enrollments.some(enrollment => enrollment.student_id === student.id)
          );
          setStudents(enrolledStudents);

          const existingGrades = await Grade.filter({ exam_id: selectedExamId });
          const initialGrades = {};
          enrolledStudents.forEach(student => {
            const existingGrade = existingGrades.find(g => g.student_id === student.id);
            initialGrades[student.id] = existingGrade ? existingGrade.marks_obtained : '';
          });
          setGrades(initialGrades);
        } else {
          setStudents([]);
          setGrades({});
        }
      } catch (error) {
        console.error('Error fetching students and grades:', error);
      }
    };
    fetchStudentsAndGrades();
  }, [selectedExamId, selectedCourseId]);

  const handleGradeChange = (studentId, marks) => {
    setGrades(prev => ({ ...prev, [studentId]: marks }));
  };

  const calculateLetterGrade = (percentage) => {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 60) return 'D';
    return 'F';
  };
  
  const submitGrades = async () => {
    const selectedExam = exams.find(e => e.id === selectedExamId);
    if (!selectedExam) return;

    setSubmitting(true);
    try {
      for (const [student_id, marks_obtained] of Object.entries(grades)) {
        if (marks_obtained !== '' && marks_obtained !== null && !isNaN(marks_obtained)) {
          const percentage = (Number(marks_obtained) / selectedExam.total_marks) * 100;
          const gradeData = {
            student_id,
            exam_id: selectedExamId,
            course_id: selectedCourseId,
            marks_obtained: Number(marks_obtained),
            total_marks: selectedExam.total_marks,
            percentage,
            letter_grade: calculateLetterGrade(percentage),
            graded_date: new Date().toISOString().split('T')[0]
          };

          const existingGrades = await Grade.filter({ exam_id: selectedExamId, student_id });
          
          if (existingGrades.length > 0) {
            await Grade.update(existingGrades[0].id, gradeData);
          } else {
            await Grade.create(gradeData);
          }
        }
      }
      alert('Grades submitted successfully!');
    } catch (error) {
      console.error("Error submitting grades:", error);
      alert("Failed to submit grades. Please try again.");
    }
    setSubmitting(false);
  };

  const handleExamSubmit = async (examData) => {
    try {
      if (editingExam) {
        await Exam.update(editingExam.id, examData);
      } else {
        await Exam.create(examData);
      }
      setShowExamForm(false);
      setEditingExam(null);
      fetchExams(selectedCourseId);
    } catch (error) {
      console.error('Error saving exam:', error);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (confirm('Are you sure you want to delete this exam and all associated grades?')) {
      try {
        // First delete associated grades
        const gradesToDelete = await Grade.filter({ exam_id: examId });
        for (const grade of gradesToDelete) {
          await Grade.delete(grade.id);
        }
        // Then delete the exam
        await Exam.delete(examId);
        alert('Exam deleted successfully');
        fetchExams(selectedCourseId);
        if (selectedExamId === examId) {
          setSelectedExamId('');
        }
      } catch (error) {
        console.error('Error deleting exam:', error);
        alert('Failed to delete exam.');
      }
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exams & Grades</h1>
          <p className="text-gray-600">Manage exams and enter student grades</p>
        </div>

        {showExamForm ? (
          <ExamForm
            exam={editingExam}
            courseId={selectedCourseId}
            onSubmit={handleExamSubmit}
            onCancel={() => { setShowExamForm(false); setEditingExam(null); }}
          />
        ) : (
          <>
            <Card className="shadow-lg mb-8">
              <CardHeader>
                <CardTitle>Select Course</CardTitle>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Course</label>
                  <Select onValueChange={(value) => { setSelectedCourseId(value); setSelectedExamId(''); }} value={selectedCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course..." />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            </Card>

            {selectedCourseId && (
              <Card className="shadow-lg mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Exams for {courses.find(c => c.id === selectedCourseId)?.name}</CardTitle>
                  <Button onClick={() => { setEditingExam(null); setShowExamForm(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Exam
                  </Button>
                </CardHeader>
                <CardContent>
                  {exams.length > 0 ? (
                    <div className="space-y-2">
                      {exams.map(exam => (
                        <div key={exam.id}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${selectedExamId === exam.id ? 'bg-blue-100 shadow-md' : 'hover:bg-gray-100'}`}
                          onClick={() => setSelectedExamId(exam.id)}
                        >
                          <div>
                            <p className="font-medium">{exam.title}</p>
                            <p className="text-sm text-gray-500">
                              {exam.type} - {new Date(exam.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{exam.total_marks} Marks</Badge>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingExam(exam); setShowExamForm(true); }}>
                              <Edit className="w-4 h-4"/>
                            </Button>
                             <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={(e) => { e.stopPropagation(); handleDeleteExam(exam.id); }}>
                              <Trash2 className="w-4 h-4"/>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-gray-500 text-center py-4">No exams found for this course.</p>}
                </CardContent>
              </Card>
            )}
            
            {selectedExamId && (
              <Card className="shadow-lg">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Enter Marks for "{exams.find(e => e.id === selectedExamId)?.title}"
                  </h2>
                </CardHeader>
                <CardContent>
                  {students.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader><TableRow className="bg-gray-50"><TableHead>Student ID</TableHead><TableHead>Name</TableHead><TableHead>Marks Obtained</TableHead><TableHead>Percentage</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
                          <TableBody>
                            {students.map(student => {
                              const marks = grades[student.id] || '';
                              const totalMarks = exams.find(e => e.id === selectedExamId)?.total_marks || 100;
                              const percentage = marks !== '' && !isNaN(marks) ? ((Number(marks) / totalMarks) * 100) : null;
                              const letterGrade = percentage !== null ? calculateLetterGrade(percentage) : '';
                              
                              return (
                                <TableRow key={student.id} className="hover:bg-gray-50">
                                  <TableCell className="font-medium">{student.student_id}</TableCell>
                                  <TableCell>{student.first_name} {student.last_name}</TableCell>
                                  <TableCell>
                                    <Input
                                      type="number" min="0" max={totalMarks}
                                      placeholder={`0 - ${totalMarks}`}
                                      value={marks}
                                      onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                      className="w-32"
                                    />
                                  </TableCell>
                                  <TableCell>{percentage !== null && `${percentage.toFixed(1)}%`}</TableCell>
                                  <TableCell>{letterGrade && <Badge className={getGradeColor(percentage)}>{letterGrade}</Badge>}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <Button onClick={submitGrades} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 px-8">
                          {submitting ? 'Saving...' : 'Save Grades'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No students are enrolled in this course to grade.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}