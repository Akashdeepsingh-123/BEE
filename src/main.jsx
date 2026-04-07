import React from 'react'
import './index.css'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from '@/layout.jsx'
import Dashboard from '@/PAGES/dashboard.jsx'
import StudentsPage from '@/PAGES/student.jsx'
import FacultyPage from '@/PAGES/faculty.jsx'
import CoursesPage from '@/PAGES/course.jsx'
import EnrollmentsPage from '@/PAGES/enroll.jsx'
import AttendancePage from '@/PAGES/attendance.jsx'
import ExamsPage from '@/PAGES/exam.jsx'
import NotificationsPage from '@/PAGES/notification.jsx'
import MyGradesPage from '@/PAGES/mymarks.jsx'
import FeesPage from '@/PAGES/fees.jsx'
import MyFeesPage from '@/PAGES/Myfees.jsx'
import MyCoursesPage from '@/PAGES/mycorse.jsx'
import MyAttendancePage from '@/PAGES/myattendace.jsx'
import MyStudentsPage from '@/PAGES/mystudent.jsx'
import EvaluationDemo from '@/PAGES/evaluationDemo.jsx'
import ProfilePage from '@/PAGES/profile.jsx'
import ChangePassword from '@/PAGES/ChangePassword.jsx'
import { seedIfEmpty } from '@/entities/seed.js'
import { bootstrapUsers } from '@/entities/bootstrapUsers.js'

seedIfEmpty()
bootstrapUsers()

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Dashboard /></Layout>
  },
  {
    path: '/fees',
    element: <Layout><FeesPage /></Layout>
  },
  {
    path: '/dashboard',
    element: <Layout><Dashboard /></Layout>
  },
  {
    path: '/students',
    element: <Layout><StudentsPage /></Layout>
  },
  {
    path: '/faculty',
    element: <Layout><FacultyPage /></Layout>
  },
  {
    path: '/courses',
    element: <Layout><CoursesPage /></Layout>
  },
  {
    path: '/enrollments',
    element: <Layout><EnrollmentsPage /></Layout>
  },
  {
    path: '/attendance',
    element: <Layout><AttendancePage /></Layout>
  },
  {
    path: '/exams',
    element: <Layout><ExamsPage /></Layout>
  },
  {
    path: '/notifications',
    element: <Layout><NotificationsPage /></Layout>
  },
  {
    path: '/mygrades',
    element: <Layout><MyGradesPage /></Layout>
  },
  {
    path: '/myfees',
    element: <Layout><MyFeesPage /></Layout>
  },
  {
    path: '/mycourses',
    element: <Layout><MyCoursesPage /></Layout>
  },
  {
    path: '/myattendance',
    element: <Layout><MyAttendancePage /></Layout>
  },
  {
    path: '/mystudents',
    element: <Layout><MyStudentsPage /></Layout>
  },
  {
    path: '/evaluation-demo',
    element: <Layout><EvaluationDemo /></Layout>
  },
  {
    path: '/profile',
    element: <Layout><ProfilePage /></Layout>
  },
  {
    path: '/change-password',
    element: <ChangePassword />
  }
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)


