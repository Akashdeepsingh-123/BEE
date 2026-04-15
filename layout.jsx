
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
  DollarSign,
  Eye,
  EyeOff
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
import { Input } from "@/components/ui/input";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginConfirmPassword, setLoginConfirmPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSignUp, setIsSignUp] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  useEffect(() => {
    // Handle Google OAuth token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const googleToken = urlParams.get('googleToken');
    const email = urlParams.get('email');
    const role = urlParams.get('role');
    
    if (googleToken && email && role) {
      const userObj = { email: email, role: role, token: googleToken };
      localStorage.setItem('sms:currentUser', JSON.stringify(userObj));
      window.history.replaceState({}, document.title, "/");
    }
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

      // If no matching profile found for faculty or student, fallback to the role from the token or set as unassigned
      setUser({ ...currentUser, app_role: currentUser.role || 'unassigned' });

    } catch (error) {
      console.log("User not authenticated or error loading profiles:", error);
      setUser(null);
    }
    setLoading(false);
  };

  const getLandingPath = (role) => {
    switch ((role || '').toLowerCase()) {
      case 'student':
        return createPageUrl("MyCourses");
      case 'faculty':
        return createPageUrl("Dashboard");
      default:
        return createPageUrl("Dashboard");
    }
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoginError('');
    setLoginSubmitting(true);
    try {
      if (isSignUp) {
        if (!loginName.trim()) throw new Error('Full Name is required');
        if (loginPassword !== loginConfirmPassword) throw new Error('Passwords do not match');
        if (!profilePic) throw new Error('Profile Picture is required');
        
        const formData = new FormData();
        formData.append('email', loginEmail);
        formData.append('password', loginPassword);
        formData.append('full_name', loginName);
        formData.append('role', 'student');
        formData.append('profilePic', profilePic);
        
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          body: formData,
        });
        
        if (!res.ok) {
          const text = await res.json();
          throw new Error(text.message || 'Registration failed');
        }
        
        const data = await res.json();
        localStorage.setItem('sms:currentUser', JSON.stringify(data));
        window.location.href = createPageUrl('Dashboard');
      } else {
        const loggedIn = await User.loginWithCredentials(loginEmail, loginPassword);
        if (loggedIn.firstLogin) {
          window.location.href = '/change-password';
        } else {
          const target = getLandingPath(loggedIn.role);
          window.location.href = target;
        }
      }
    } catch (error) {
      setLoginError(error.message || 'Unable to authenticate');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
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

    const profileItem = {
        title: "My Profile",
        url: "/profile",
        icon: Users,
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
                profileItem,
                { title: "Students", url: createPageUrl("Students"), icon: Users },
                { title: "Faculty", url: createPageUrl("Faculty"), icon: Users },
                { title: "Courses", url: createPageUrl("Courses"), icon: BookOpen },
                { title: "Enrollments", url: createPageUrl("Enrollments"), icon: ClipboardList },
                { title: "Fees", url: createPageUrl("Fees"), icon: DollarSign },
                { title: "Attendance", url: createPageUrl("Attendance"), icon: Calendar },
                { title: "Exams & Grades", url: createPageUrl("Exams"), icon: GraduationCap },
                notificationItem,
                { title: "Evaluation Demo", url: "/evaluation-demo", icon: ClipboardList }
            ];
        case 'faculty':
            return [
                dashboardItem,
                profileItem,
                { title: "My Courses", url: createPageUrl("MyCourses"), icon: BookOpen },
                { title: "My Students", url: createPageUrl("MyStudents"), icon: Users },
                { title: "Attendance", url: createPageUrl("Attendance"), icon: Calendar },
                { title: "Exams & Grades", url: createPageUrl("Exams"), icon: GraduationCap },
                notificationItem,
                { title: "Evaluation Demo", url: "/evaluation-demo", icon: ClipboardList }
            ];
        case 'student':
            return [
                dashboardItem,
                profileItem,
                { title: "My Courses", url: createPageUrl("MyCourses"), icon: BookOpen },
                { title: "My Attendance", url: createPageUrl("MyAttendance"), icon: Calendar },
                { title: "My Grades", url: createPageUrl("MyGrades"), icon: GraduationCap },
                { title: "My Fees", url: createPageUrl("MyFees"), icon: DollarSign },
                notificationItem,
                { title: "Evaluation Demo", url: "/evaluation-demo", icon: ClipboardList }
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
              <p className="text-gray-600 mb-6">Use your university email and temporary password.</p>
              <form className="space-y-4 text-left" onSubmit={handleLoginSubmit}>
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <Input 
                      type="text"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      placeholder="John Doe"
                      required={isSignUp}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input 
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g., john@university.edu"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder={isSignUp ? "e.g., Str0ngP@ssw0rd!" : "Enter your password"}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <Input 
                        type={showConfirmPassword ? "text" : "password"}
                        value={loginConfirmPassword}
                        onChange={(e) => setLoginConfirmPassword(e.target.value)}
                        placeholder="e.g., Str0ngP@ssw0rd!"
                        required={isSignUp}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture (Required)</label>
                    <Input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setProfilePic(file);
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfilePicPreview(reader.result);
                          };
                          reader.readAsDataURL(file);
                        } else {
                          setProfilePicPreview(null);
                        }
                      }}
                      required={isSignUp}
                    />
                    {profilePicPreview && (
                      <div className="mt-3 flex flex-col items-center border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <span className="text-xs text-gray-500 mb-2">Preview (Auto-centered & cropped)</span>
                        <img 
                          src={profilePicPreview} 
                          alt="Preview" 
                          className="w-20 h-20 rounded-full object-cover object-center shadow-md border-2 border-white"
                        />
                      </div>
                    )}
                  </div>
                )}
                {loginError && (
                  <p className="text-sm text-red-600">{loginError}</p>
                )}
                <Button 
                  type="submit"
                  disabled={loginSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base rounded-lg font-semibold"
                >
                  {loginSubmitting ? 'Authenticating...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </Button>
                
                <Button 
                  type="button"
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full py-3 text-base rounded-lg font-semibold flex gap-2 items-center justify-center"
                >
                  <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5" />
                  Sign in with Google
                </Button>
                
                <div className="text-sm text-center mt-2">
                  <button type="button" className="text-blue-600 hover:underline" onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  Admin login reference: admin@academiahub.com / Admin@123
                </p>
              </form>
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
              {user.profilePic ? (
                <img src={user.profilePic} alt="Profile" className="w-10 h-10 rounded-full object-cover object-center border border-gray-200" />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  <span className="text-gray-600 font-medium text-sm">
                    {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
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
