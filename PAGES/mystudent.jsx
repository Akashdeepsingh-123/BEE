
import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Faculty } from '@/entities/Faculty';
import { Course } from '@/entities/Course';
import { Enrollment } from '@/entities/Enrollment';
import { Student } from '@/entities/Student';
import { Attendance } from '@/entities/Attendance';
import { Grade } from '@/entities/Grade';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Users, Search, BookOpen, Calendar, GraduationCap } from 'lucide-react';

export default function MyStudentsPage() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await User.me();
        const facultyProfile = await Faculty.filter({ email: currentUser.email });
        
        if (facultyProfile.length > 0) {
          setUser({ ...currentUser, profile: facultyProfile[0] });
          
          // Get faculty's courses
          const facultyCourses = await Course.filter({ faculty_id: facultyProfile[0].id });
          setCourses(facultyCourses);
          
          // Get all students enrolled in faculty's courses
          if (facultyCourses.length > 0) {
            const courseIds = facultyCourses.map(c => c.id);
            const [allEnrollments, allStudents, allAttendance, allGrades] = await Promise.all([
              Enrollment.list(),
              Student.list(),
              Attendance.list(),
              Grade.list()
            ]);
            
            // Filter enrollments for faculty's courses
            const facultyEnrollments = allEnrollments.filter(e => 
              courseIds.includes(e.course_id) && e.status === 'Enrolled'
            );
            
            // Get unique student IDs from these enrollments
            const studentIds = [...new Set(facultyEnrollments.map(e => e.student_id))];

            // Get students with performance data
            const studentsWithData = studentIds.map(studentId => {
              const student = allStudents.find(s => s.id === studentId);
              if (!student) return null;

              // Find all courses this student is enrolled in with this faculty
              const relevantEnrollments = facultyEnrollments.filter(e => e.student_id === studentId);
              
              // For simplicity in this view, we'll just show the first course, but this could be expanded
              // const primaryEnrollment = relevantEnrollments[0];
              // const course = facultyCourses.find(c => c.id === primaryEnrollment.course_id);

              // Calculate overall attendance for this student across all their courses with this faculty
              const studentAllCourseAttendances = allAttendance.filter(a => 
                a.student_id === student.id && courseIds.includes(a.course_id)
              );
              
              let attendancePercentage = 'N/A';
              if (studentAllCourseAttendances.length > 0) {
                const presentCount = studentAllCourseAttendances.filter(a => 
                  a.status === 'Present' || a.status === 'Late'
                ).length;
                attendancePercentage = Math.round((presentCount / studentAllCourseAttendances.length) * 100) + '%';
              }
              
              // Get latest grade for this student across all courses with this faculty
              const studentAllCourseGrades = allGrades.filter(g => 
                g.student_id === student.id && courseIds.includes(g.course_id)
              );
              
              const latestGrade = studentAllCourseGrades.length > 0 ? 
                studentAllCourseGrades.reduce((latest, grade) => 
                  new Date(grade.created_date) > new Date(latest.created_date) ? grade : latest
                ) : null;
              
              return {
                ...student,
                // We pass all enrollments for this student with this faculty
                enrollments: relevantEnrollments.map(e => ({...e, course: facultyCourses.find(c => c.id === e.course_id)})),
                attendancePercentage,
                latestGrade: latestGrade?.letter_grade || 'N/A'
              };
            }).filter(Boolean);
            
            setStudents(studentsWithData);
          }
        }
      } catch (error) {
        console.error('Error loading student data:', error);
      }
      setLoading(false);
    };
    
    init();
  }, []);

  const filteredStudents = students.filter(student => {
    const courseMatch = selectedCourseId === 'all' || student.enrollments.some(e => e.course_id === selectedCourseId);
    const searchMatch = 
      student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return courseMatch && searchMatch;
  });

  if (loading) return (
    <div className="p-6 md:p-8 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Students</h1>
          <p className="text-gray-600">Students enrolled in your courses</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-white">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="w-5 h-5" />
                Students ({filteredStudents.length})
              </CardTitle>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="w-full md:w-48">
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Courses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Latest Grade</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{student.student_id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.first_name} {student.last_name}</p>
                            <p className="text-sm text-gray-500">{student.major}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex flex-col gap-1">
                            {student.enrollments.map(enroll => (
                                <Badge key={enroll.id} variant="outline">{enroll.course.code}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.year}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className={`font-medium ${
                              student.attendancePercentage === 'N/A' ? 'text-gray-500' :
                              parseInt(student.attendancePercentage) >= 75 ? 'text-green-600' :
                              parseInt(student.attendancePercentage) >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {student.attendancePercentage}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-gray-400" />
                            {student.latestGrade !== 'N/A' ? (
                              <Badge variant="secondary">{student.latestGrade}</Badge>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{student.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No Students Found</h3>
                <p>No students are enrolled in the selected course(s) or match your search criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
