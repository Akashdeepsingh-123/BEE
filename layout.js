
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { Student } from "@/entities/Student";
import { Faculty } from "@/entities/Faculty";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar,
  ClipboardList,
  BarChart3,
  
  Bell,
  LogOut,
  DollarSign
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // Added Card and CardContent

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      
      // Platform admin always has admin role in the app
      if (currentUser.role === 'admin') {
        currentUser.app_role = 'admin';
        setUser(currentUser);
        setLoading(false);
        return;
      }

      // For regular users, check if they are faculty or student
      // Get all faculty and student records to check against
      const [allFaculty, allStudents] = await Promise.all([
        Faculty.list(),
        Student.list()
      ]);

      // Check if user email matches any faculty member (case insensitive)
      const facultyProfile = allFaculty.find(faculty => 
        faculty.email.toLowerCase() === currentUser.email.toLowerCase()
      );

      if (facultyProfile) {
        currentUser.app_role = 'faculty';
        currentUser.profile = facultyProfile;
        setUser(currentUser);
        setLoading(false);
        return;
      }

      // Check if user email matches any student (case insensitive)
      const studentProfile = allStudents.find(student => 
        student.email.toLowerCase() === currentUser.email.toLowerCase()
      );

      if (studentProfile) {
        currentUser.app_role = 'student';
        currentUser.profile = studentProfile;
        setUser(currentUser);
        setLoading(false);
        return;
      }

      // If no matching profile found for faculty or student, set as unassigned
      setUser({ ...currentUser, app_role: 'unassigned' });

    } catch (error) {
      console.log("User not authenticated or error loading profiles:", error);
      setUser(null);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await User.logout();
    window.location.reload();
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!user || !user.app_role) return [];

    const dashboardItem = {
        title: "Dashboard",
        url: createPageUrl("Dashboard"),
        icon: BarChart3,
    };

    const notificationItem = {
      title: "Notifications",
      url: createPageUrl("Notifications"),
      icon: Bell
    };

    switch(user.app_role) {
        case 'admin':
            return [
                dashboardItem,
                { title: "Students", url: createPageUrl("Students"), icon: Users },
                { title: "Faculty", url: createPageUrl("Faculty"), icon: Users },
                { title: "Courses", url: createPageUrl("Courses"), icon: BookOpen },
                { title: "Enrollments", url: createPageUrl("Enrollments"), icon: ClipboardList },
                { title: "Fees", url: createPageUrl("Fees"), icon: DollarSign },
                { title: "Attendance", url: createPageUrl("Attendance"), icon: Calendar },
                { title: "Exams & Grades", url: createPageUrl("Exams"), icon: GraduationCap },
                notificationItem
            ];
        case 'faculty':
            return [
                dashboardItem,
                { title: "My Courses", url: createPageUrl("MyCourses"), icon: BookOpen },
                { title: "My Students", url: createPageUrl("MyStudents"), icon: Users },
                { title: "Attendance", url: createPageUrl("Attendance"), icon: Calendar },
                { title: "Exams & Grades", url: createPageUrl("Exams"), icon: GraduationCap },
                notificationItem
            ];
        case 'student':
            return [
                dashboardItem,
                { title: "My Courses", url: createPageUrl("MyCourses"), icon: BookOpen },
                { title: "My Attendance", url: createPageUrl("MyAttendance"), icon: Calendar },
                { title: "My Grades", url: createPageUrl("MyGrades"), icon: GraduationCap },
                { title: "My Fees", url: createPageUrl("MyFees"), icon: DollarSign },
                notificationItem
            ];
        default:
            return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Card className="rounded-2xl shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/89fb778eb_Chitkara_University_Punjab_logo.png" 
                alt="Chitkara University Logo" 
                className="w-48 mx-auto mb-6"
              />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">AcademiaHub</h1>
              <p className="text-gray-600 mb-8">Your portal to academic excellence.</p>
              <Button 
                onClick={() => User.login()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base rounded-lg font-semibold"
              >
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (user.app_role === 'unassigned') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/89fb778eb_Chitkara_University_Punjab_logo.png" 
              alt="Chitkara University Logo" 
              className="w-48 mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Chitkara University</h1>
            <p className="text-gray-600 mb-4">Please contact your administrator to get access to the system</p>
            <p className="text-sm text-gray-500 mb-6">
              Your email: {user?.email || 'Not found'}<br/>
              If you should have access, please ask your admin to add your email to the system.
            </p>
            <Button 
              onClick={() => User.logout()}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const navigationItems = getNavigationItems();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/89fb778eb_Chitkara_University_Punjab_logo.png" 
                alt="Chitkara University Logo" 
                className="h-10"
              />
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 rounded-lg mb-1 ${
                          location.pathname === item.url ? 'bg-blue-100 text-blue-700 font-medium' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">
                  {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {user.full_name || user.email.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 capitalize truncate">{user.app_role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-semibold text-gray-900">Chitkara University</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
