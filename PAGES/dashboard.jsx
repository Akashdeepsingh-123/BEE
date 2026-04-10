
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Student } from "@/entities/Student";
import { Faculty } from "@/entities/Faculty";
import { Course } from "@/entities/Course";
import { Enrollment } from "@/entities/Enrollment";
import { Attendance } from "@/entities/Attendance";
import { Grade } from "@/entities/Grade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, GraduationCap, Calendar, TrendingUp, ClipboardList } from "lucide-react";
import StatsCard from "../components/dashboard/StatsCard";
import RecentActivity from "../components/dashboard/RecentActivity";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        console.log('Current user in dashboard:', currentUser);
        
        if (currentUser.role === 'admin') {
          currentUser.app_role = 'admin';
        } else {
          const [allFaculty, allStudents] = await Promise.all([Faculty.list(), Student.list()]);
          console.log('All faculty in dashboard:', allFaculty);
          console.log('All students in dashboard:', allStudents);
          console.log('Looking for email:', currentUser.email);
          
          const facultyProfile = allFaculty.find(f => f.email.toLowerCase() === currentUser.email.toLowerCase());
          console.log('Found faculty profile:', facultyProfile);
          
          if (facultyProfile) {
            currentUser.app_role = 'faculty';
            currentUser.profile = facultyProfile;
          } else {
            const studentProfile = allStudents.find(s => s.email.toLowerCase() === currentUser.email.toLowerCase());
            if (studentProfile) {
              currentUser.app_role = 'student';
              currentUser.profile = studentProfile;
            } else {
              // Fallback to the role provided by the authentication token
              currentUser.app_role = currentUser.role || 'unassigned';
              currentUser.profile = { id: currentUser.id || 'google_user' };
            }
          }
        }
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user in dashboard:", error);
      }
      setLoading(false);
    };
    fetchUser();
    const onChanged = () => fetchUser();
    window.addEventListener('sms:entity-changed', onChanged);
    return () => window.removeEventListener('sms:entity-changed', onChanged);
  }, []);

  const getWelcomeMessage = () => {
    if (!user) return "Welcome!";
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const name = user.full_name || user.email.split('@')[0];
    return `${greeting}, ${name}!`;
  };

  const getRoleDashboard = () => {
    if (!user) return null;
    switch (user.app_role) {
      case 'admin':
        return <AdminDashboard />;
      case 'faculty':
        return <FacultyDashboard user={user} />;
      case 'student':
        return <StudentDashboard user={user} />;
      default:
        return <p>Your role has not been assigned. Please contact an administrator.</p>;
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getWelcomeMessage()}
          </h1>
          <p className="text-gray-600">
            Welcome to your {user?.app_role} dashboard.
          </p>
        </div>
        {getRoleDashboard()}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, faculty: 0, courses: 0, enrollments: 0 });

  useEffect(() => {
    const getStats = async () => {
      const [students, faculty, courses, enrollments] = await Promise.all([
        Student.list(),
        Faculty.list(),
        Course.list(),
        Enrollment.list()
      ]);
      setStats({
        students: students.length,
        faculty: faculty.length,
        courses: courses.length,
        enrollments: enrollments.length
      });
    };
    getStats();
    const onChanged = () => getStats();
    window.addEventListener('sms:entity-changed', onChanged);
    return () => window.removeEventListener('sms:entity-changed', onChanged);
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Students" value={stats.students} icon={Users} color="blue" />
        <StatsCard title="Faculty Members" value={stats.faculty} icon={GraduationCap} color="green" />
        <StatsCard title="Active Courses" value={stats.courses} icon={BookOpen} color="purple" />
        <StatsCard title="Total Enrollments" value={stats.enrollments} icon={ClipboardList} color="orange" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <RecentActivity />
        <QuickActions role="admin" />
      </div>
    </>
  );
}

function FacultyDashboard({ user }) {
  const [stats, setStats] = useState({ 
    courses: 0, 
    students: 0, 
    avgAttendance: 'N/A',
    recentGrades: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.profile?.id) {
      console.log('No faculty profile found for user:', user);
      setLoading(false);
      return;
    }
    
    const getStats = async () => {
      try {
        console.log('Fetching data for faculty ID:', user.profile.id);
        
        // Get courses taught by this faculty using the faculty record ID
        const allCourses = await Course.list();
        console.log('All courses:', allCourses);
        
        const myCourses = allCourses.filter(course => course.faculty_id === user.profile.id);
        console.log('My courses:', myCourses);

        let totalStudents = 0;
        let attendanceCount = 0;
        let presentCount = 0;

        if (myCourses.length > 0) {
          // Get all enrollments for faculty's courses
          const allEnrollments = await Enrollment.list();
          console.log('All enrollments:', allEnrollments);
          
          const courseIds = myCourses.map(c => c.id);
          console.log('Course IDs:', courseIds);
          
          const courseEnrollments = allEnrollments.filter(e => 
            courseIds.includes(e.course_id) && e.status === 'Enrolled'
          );
          console.log('Course enrollments:', courseEnrollments);
          
          totalStudents = new Set(courseEnrollments.map(e => e.student_id)).size;
          console.log('Total unique students:', totalStudents);

          // Calculate average attendance across all faculty courses
          const allAttendance = await Attendance.list();
          const facultyAttendance = allAttendance.filter(a => courseIds.includes(a.course_id));
          
          if (facultyAttendance.length > 0) {
            attendanceCount = facultyAttendance.length;
            presentCount = facultyAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
          }
        }

        const avgAttendancePercent = attendanceCount > 0 ? Math.round((presentCount / attendanceCount) * 100) : 0;

        const finalStats = {
          courses: myCourses.length,
          students: totalStudents,
          avgAttendance: attendanceCount > 0 ? `${avgAttendancePercent}%` : 'N/A',
          recentGrades: 0
        };

        console.log('Final faculty stats:', finalStats);
        setStats(finalStats);

      } catch (error) {
        console.error('Error fetching faculty stats:', error);
      }
      setLoading(false);
    };
    
    getStats();
    const onChanged = () => getStats();
    window.addEventListener('sms:entity-changed', onChanged);
    return () => window.removeEventListener('sms:entity-changed', onChanged);
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your dashboard data...</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="My Courses" value={stats.courses} icon={BookOpen} color="blue" />
        <StatsCard title="Total Students" value={stats.students} icon={Users} color="green" />
        <StatsCard title="Avg. Attendance" value={stats.avgAttendance} icon={Calendar} color="orange" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <FacultyRecentActivity user={user} />
        <QuickActions role="faculty" />
      </div>
    </>
  );
}

function StudentDashboard({ user }) {
  const [stats, setStats] = useState({ courses: 0, attendance: 'N/A', gpa: 'N/A' });
  
  useEffect(() => {
    if (!user?.profile?.id) return;
    const getStats = async () => {
      const myEnrollments = await Enrollment.filter({ student_id: user.profile.id, status: 'Enrolled' });
      
      const attendanceRecords = await Attendance.filter({ student_id: user.profile.id });
      let attendancePercent = 'N/A';
      if (attendanceRecords.length > 0) {
        const presentCount = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
        attendancePercent = `${Math.round((presentCount / attendanceRecords.length) * 100)}%`;
      }

      setStats({
        courses: myEnrollments.length,
        attendance: attendancePercent,
        gpa: user.profile.gpa ? user.profile.gpa.toFixed(2) : 'N/A'
      });
    };
    getStats();
    const onChanged = () => getStats();
    window.addEventListener('sms:entity-changed', onChanged);
    return () => window.removeEventListener('sms:entity-changed', onChanged);
  }, [user]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Enrolled Courses" value={stats.courses} icon={BookOpen} color="blue" />
        <StatsCard title="My Attendance" value={stats.attendance} icon={Calendar} color="green" />
        <StatsCard title="Current GPA" value={stats.gpa} icon={TrendingUp} color="purple" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <RecentActivity />
        <QuickActions role="student" />
      </div>
    </>
  );
}

function FacultyRecentActivity({ user }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!user?.profile?.id) return;
    
    const fetchActivities = async () => {
      try {
        // Get faculty's courses
        const allCourses = await Course.list();
        const myCourses = allCourses.filter(course => course.faculty_id === user.profile.id);
        const courseIds = myCourses.map(c => c.id);
        
        if (courseIds.length === 0) {
          setActivities([]);
          return;
        }

        // Get recent enrollments in faculty's courses
        const allEnrollments = await Enrollment.list('-created_date', 5);
        const recentEnrollments = allEnrollments.filter(e => courseIds.includes(e.course_id));

        // Get recent grades given by this faculty
        const allGrades = await Grade.list('-created_date', 5);
        const recentGrades = allGrades.filter(g => courseIds.includes(g.course_id));

        // Create activity feed
        const activityList = [];

        recentEnrollments.forEach(enrollment => {
          const course = myCourses.find(c => c.id === enrollment.course_id);
          if (course) {
            activityList.push({
              id: `enrollment-${enrollment.id}`,
              action: "New student enrolled",
              details: `Student enrolled in ${course.name}`,
              time: new Date(enrollment.created_date).toLocaleDateString(),
              type: "enrollment"
            });
          }
        });

        recentGrades.forEach(grade => {
          const course = myCourses.find(c => c.id === grade.course_id);
          if (course) {
            activityList.push({
              id: `grade-${grade.id}`,
              action: "Grade posted",
              details: `Grade ${grade.letter_grade} posted for ${course.name}`,
              time: new Date(grade.created_date).toLocaleDateString(),
              type: "grade"
            });
          }
        });

        // Sort by date and limit to 4 items
        activityList.sort((a, b) => new Date(b.time) - new Date(a.time));
        setActivities(activityList.slice(0, 4));

      } catch (error) {
        console.error('Error fetching faculty activities:', error);
        setActivities([]);
      }
    };

    fetchActivities();
  }, [user]);

  const getActivityColor = (type) => {
    switch (type) {
      case 'enrollment': return 'bg-blue-100 text-blue-800';
      case 'exam': return 'bg-orange-100 text-orange-800';
      case 'grade': return 'bg-green-100 text-green-800';
      case 'course': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Badge variant="secondary" className={getActivityColor(activity.type)}>
                  {activity.type}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity in your courses</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
