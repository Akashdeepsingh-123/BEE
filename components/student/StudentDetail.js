import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Calendar, MapPin, GraduationCap } from "lucide-react";
import { Attendance } from "@/entities/Attendance";
import { Grade } from "@/entities/Grade";
import { Enrollment } from "@/entities/Enrollment";
import { Course } from "@/entities/Course";
import { format } from "date-fns";

export default function StudentDetails({ student, onBack }) {
  const [studentStats, setStudentStats] = useState({
    enrolledCourses: 0,
    averageAttendance: 0,
    completedCredits: 0,
    currentGPA: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Get enrollments
        const enrollments = await Enrollment.filter({ student_id: student.id, status: 'Enrolled' });
        
        // Get attendance records
        const attendanceRecords = await Attendance.filter({ student_id: student.id });
        
        // Get grades
        const grades = await Grade.filter({ student_id: student.id });
        
        // Get courses for credit calculation
        const allCourses = await Course.list();
        const coursesMap = new Map(allCourses.map(c => [c.id, c]));

        // Calculate stats
        const enrolledCoursesCount = enrollments.length;
        
        // Calculate average attendance percentage
        let attendancePercentage = 0;
        if (attendanceRecords.length > 0) {
          const presentCount = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
          attendancePercentage = (presentCount / attendanceRecords.length) * 100;
        }

        // Calculate completed credits and GPA
        let totalCredits = 0;
        let totalGradePoints = 0;
        let completedCourses = 0;

        grades.forEach(grade => {
          const course = coursesMap.get(grade.course_id);
          if (course && grade.letter_grade) {
            const gradePoints = getGradePoints(grade.letter_grade);
            totalGradePoints += gradePoints * course.credits;
            totalCredits += course.credits;
            completedCourses++;
          }
        });

        const currentGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

        setStudentStats({
          enrolledCourses: enrolledCoursesCount,
          averageAttendance: Math.round(attendancePercentage),
          completedCredits: totalCredits,
          currentGPA: currentGPA.toFixed(2)
        });

      } catch (error) {
        console.error('Error fetching student data:', error);
      }
      setLoading(false);
    };

    fetchStudentData();
  }, [student.id]);

  const getGradePoints = (letterGrade) => {
    const gradeMap = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    return gradeMap[letterGrade] || 0.0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Graduated': return 'bg-blue-100 text-blue-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
            <p className="text-gray-600">Complete student information and academic progress</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {student.first_name?.[0]}{student.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {student.first_name} {student.last_name}
                  </CardTitle>
                  <p className="text-blue-100">Student ID: {student.student_id}</p>
                </div>
                <div className="ml-auto">
                  <Badge className={getStatusColor(student.status)}>
                    {student.status || 'Active'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{student.email}</p>
                    </div>
                  </div>
                  
                  {student.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{student.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Major</p>
                      <p className="font-medium">{student.major}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Academic Year</p>
                      <p className="font-medium">{student.year}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current GPA</p>
                      <p className="font-medium">
                        {loading ? 'Loading...' : studentStats.currentGPA || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Enrollment Date</p>
                      <p className="font-medium">
                        {student.enrollment_date 
                          ? format(new Date(student.enrollment_date), 'MMMM d, yyyy')
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {student.address && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-700">
                  {student.address.street && <p>{student.address.street}</p>}
                  <p>
                    {[student.address.city, student.address.state, student.address.zip_code]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Academic Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading academic data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{studentStats.enrolledCourses}</p>
                    <p className="text-sm text-gray-600">Enrolled Courses</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{studentStats.averageAttendance}%</p>
                    <p className="text-sm text-gray-600">Average Attendance</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{studentStats.completedCredits}</p>
                    <p className="text-sm text-gray-600">Completed Credits</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{studentStats.currentGPA}</p>
                    <p className="text-sm text-gray-600">Current GPA</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}