import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Course } from '@/entities/Course';
import { Enrollment } from '@/entities/Enrollment';
import { Student } from '@/entities/Student';
import { Faculty } from '@/entities/Faculty';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Calendar, Clock, GraduationCap } from 'lucide-react';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const currentUser = await User.me();
        console.log('Current user in MyCourses:', currentUser);
        setUser(currentUser);
        
        let myCourses = [];
        
        if (currentUser.role === 'admin') {
          // Admin sees all courses
          myCourses = await Course.list();
          console.log('Admin courses:', myCourses);
        } else {
          // Get user profile first
          const [allFaculty, allStudents] = await Promise.all([
            Faculty.list(),
            Student.list()
          ]);
          
          console.log('All faculty:', allFaculty);
          console.log('All students:', allStudents);
          console.log('Looking for email:', currentUser.email);
          
          const facultyProfile = allFaculty.find(f => 
            f.email.toLowerCase() === currentUser.email.toLowerCase()
          );
          
          if (facultyProfile) {
            console.log('Found faculty profile:', facultyProfile);
            // Faculty sees their assigned courses
            const allCourses = await Course.list();
            console.log('All courses:', allCourses);
            
            myCourses = allCourses.filter(course => course.faculty_id === facultyProfile.id);
            console.log('Faculty courses:', myCourses);
            
            // Add enrollment count to each course
            const allEnrollments = await Enrollment.list();
            myCourses = await Promise.all(myCourses.map(async course => {
              const enrollmentCount = allEnrollments.filter(e => 
                e.course_id === course.id && e.status === 'Enrolled'
              ).length;
              
              return {
                ...course,
                enrollment_count: enrollmentCount
              };
            }));
            
            console.log('Faculty courses with enrollment count:', myCourses);
          } else {
            const studentProfile = allStudents.find(s => 
              s.email.toLowerCase() === currentUser.email.toLowerCase()
            );
            
            if (studentProfile) {
              console.log('Found student profile:', studentProfile);
              // Student sees enrolled courses
              const enrollments = await Enrollment.filter({ 
                student_id: studentProfile.id, 
                status: 'Enrolled' 
              });
              console.log('Student enrollments:', enrollments);
              
              if (enrollments.length > 0) {
                const allCourses = await Course.list();
                const courseIds = enrollments.map(e => e.course_id);
                myCourses = allCourses.filter(c => courseIds.includes(c.id));
                console.log('Student courses:', myCourses);
              }
            }
          }
        }
        
        setCourses(myCourses);
      } catch (e) { 
        console.error('Error in MyCourses:', e); 
      }
      setLoading(false);
    };
    fetchMyCourses();
  }, []);

  if (loading) return (
    <div className="p-6 md:p-8 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'admin' ? 'All university courses' : 
             courses.length > 0 ? `You have ${courses.length} courses` : 'No courses found'}
          </p>
        </div>

        {courses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-blue-500">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <p className="font-mono text-sm text-blue-600 mt-1">{course.code}</p>
                  </div>
                  <BookOpen className="w-6 h-6 text-gray-400" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{course.credits} Credits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{course.semester} {course.year}</span>
                    </div>
                  </div>

                  {course.enrollment_count !== undefined && (
                    <div className="flex items-center gap-2 text-sm bg-blue-50 rounded p-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-700 font-medium">
                        {course.enrollment_count} Students Enrolled
                      </span>
                    </div>
                  )}

                  {course.schedule && (
                    <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">Schedule:</span>
                      </div>
                      {course.schedule.days && (
                        <p>Days: {course.schedule.days.join(', ')}</p>
                      )}
                      {course.schedule.time && (
                        <p>Time: {course.schedule.time}</p>
                      )}
                      {course.schedule.room && (
                        <p>Room: {course.schedule.room}</p>
                      )}
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Department:</span> {course.department}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
            <p className="text-gray-500">
              {user?.role === 'admin' ? 'No courses have been created yet.' :
               'You are not assigned to any courses for the current semester.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}