
import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Course } from '@/entities/Course';
import { Student } from '@/entities/Student';
import { Faculty } from '@/entities/Faculty';
import { Enrollment } from '@/entities/Enrollment';
import { Attendance } from '@/entities/Attendance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function AttendancePage() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState(''); // This state variable is not used in the provided code, but kept for consistency with original file
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        
        let userCourses = [];
        // Check if user is admin or faculty
        if (currentUser.role === 'admin') {
          userCourses = await Course.list();
        } else { // Assume 'faculty' role for now, as per the original logic intent
          const facultyProfile = await Faculty.filter({ email: currentUser.email });
          if (facultyProfile.length > 0) {
            userCourses = await Course.filter({ faculty_id: facultyProfile[0].id });
          }
        }
        setCourses(userCourses);

      } catch (e) { 
        console.error(e); 
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setStudents([]);
      return;
    }
    const fetchStudents = async () => {
      try {
        // Get enrollments for this course
        const enrollments = await Enrollment.filter({ 
          course_id: selectedCourseId, 
          status: 'Enrolled' 
        });
        
        if (enrollments.length > 0) {
          // Get student records based on enrollment student_ids
          const allStudents = await Student.list();
          const enrolledStudents = allStudents.filter(student => 
            enrollments.some(enrollment => enrollment.student_id === student.id)
          );
          
          setStudents(enrolledStudents);
          
          // Check if attendance already exists for this date
          const existingAttendance = await Attendance.filter({ 
            course_id: selectedCourseId, 
            date: selectedDate 
          });
          
          // Initialize attendance state
          const initialAttendance = {};
          enrolledStudents.forEach(student => {
            const existing = existingAttendance.find(a => a.student_id === student.id);
            initialAttendance[student.id] = existing ? existing.status : 'Present';
          });
          setAttendance(initialAttendance);
        } else {
          setStudents([]);
          setAttendance({});
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
        setAttendance({});
      }
    };
    fetchStudents();
  }, [selectedCourseId, selectedDate]);
  
  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    setSubmitting(true);
    const records = Object.entries(attendance).map(([student_id, status]) => ({
      student_id,
      course_id: selectedCourseId,
      date: selectedDate,
      status
    }));

    try {
      // Check if attendance already exists and update or create
      const existingAttendance = await Attendance.filter({ 
        course_id: selectedCourseId, 
        date: selectedDate 
      });

      if (existingAttendance.length > 0) {
        // Update existing records
        for (const record of records) {
          const existing = existingAttendance.find(a => a.student_id === record.student_id);
          if (existing) {
            await Attendance.update(existing.id, { status: record.status });
          } else {
            await Attendance.create(record);
          }
        }
        alert("Attendance updated successfully!");
      } else {
        // Create new records
        await Attendance.bulkCreate(records);
        alert("Attendance submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      alert("Failed to submit attendance. Please try again.");
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="p-6 md:p-8 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mark Attendance</h1>
          <p className="text-gray-600">Select a course and date to mark student attendance</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Select Course and Date</CardTitle>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Course</label>
                <Select onValueChange={setSelectedCourseId} value={selectedCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                />
              </div>
            </div>
          </CardHeader>
          
          {selectedCourseId && (
            <CardContent>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Attendance for {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h2>
                <p className="text-gray-600">
                  Course: {courses.find(c => c.id === selectedCourseId)?.name} | 
                  Enrolled Students: {students.length}
                </p>
              </div>

              {students.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Student ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map(student => (
                          <TableRow key={student.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{student.student_id}</TableCell>
                            <TableCell>{student.first_name} {student.last_name}</TableCell>
                            <TableCell>
                              <Select
                                value={attendance[student.id] || 'Present'}
                                onValueChange={(value) => handleAttendanceChange(student.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Present">
                                    <Badge className="bg-green-100 text-green-800">Present</Badge>
                                  </SelectItem>
                                  <SelectItem value="Absent">
                                    <Badge className="bg-red-100 text-red-800">Absent</Badge>
                                  </SelectItem>
                                  <SelectItem value="Late">
                                    <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>
                                  </SelectItem>
                                  <SelectItem value="Excused">
                                    <Badge className="bg-blue-100 text-blue-800">Excused</Badge>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button 
                      onClick={submitAttendance} 
                      disabled={submitting}
                      className="bg-blue-600 hover:bg-blue-700 px-8"
                    >
                      {submitting ? 'Saving...' : 'Save Attendance'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No students are enrolled in this course.</p>
                  <p className="text-sm mt-2">Use the Enrollments page to enroll students.</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
