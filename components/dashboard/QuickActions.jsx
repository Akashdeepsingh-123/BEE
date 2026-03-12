import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, FileText, Users, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QuickActions({ role }) {
  const getActions = () => {
    switch (role) {
      case 'admin':
        return [
          {
            title: "Add New Student",
            description: "Register a new student",
            icon: Users,
            url: createPageUrl("Students"),
            color: "bg-blue-600 hover:bg-blue-700"
          },
          {
            title: "Create Course",
            description: "Add a new course offering",
            icon: Plus,
            url: createPageUrl("Courses"),
            color: "bg-green-600 hover:bg-green-700"
          },
          {
            title: "Schedule Exam",
            description: "Create new examination",
            icon: Calendar,
            url: createPageUrl("Exams"),
            color: "bg-purple-600 hover:bg-purple-700"
          },
          {
            title: "Manage Notifications",
            description: "Send announcements",
            icon: Bell,
            url: createPageUrl("Notifications"),
            color: "bg-orange-600 hover:bg-orange-700"
          }
        ];
      case 'faculty':
        return [
          {
            title: "Mark Attendance",
            description: "Record class attendance",
            icon: Calendar,
            url: createPageUrl("Attendance"),
            color: "bg-blue-600 hover:bg-blue-700"
          },
          {
            title: "Post Grades",
            description: "Enter student grades",
            icon: FileText,
            url: createPageUrl("Exams"),
            color: "bg-green-600 hover:bg-green-700"
          },
          {
            title: "View My Courses",
            description: "Manage your courses",
            icon: Users,
            url: createPageUrl("MyCourses"),
            color: "bg-purple-600 hover:bg-purple-700"
          },
          {
            title: "Send Notification",
            description: "Create announcement",
            icon: Bell,
            url: createPageUrl("Notifications"),
            color: "bg-orange-600 hover:bg-orange-700"
          }
        ];
      default:
        return [
          {
            title: "View Courses",
            description: "See your enrolled courses",
            icon: Users,
            url: createPageUrl("MyCourses"),
            color: "bg-blue-600 hover:bg-blue-700"
          },
          {
            title: "Check Attendance",
            description: "View attendance records",
            icon: Calendar,
            url: createPageUrl("MyAttendance"),
            color: "bg-green-600 hover:bg-green-700"
          },
          {
            title: "View Grades",
            description: "Check your grades",
            icon: FileText,
            url: createPageUrl("MyGrades"),
            color: "bg-purple-600 hover:bg-purple-700"
          },
          {
            title: "Notifications",
            description: "View announcements",
            icon: Bell,
            url: createPageUrl("Notifications"),
            color: "bg-orange-600 hover:bg-orange-700"
          }
        ];
    }
  };

  const actions = getActions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Link key={index} to={action.url}>
              <Button
                variant="outline"
                className={`w-full h-auto p-4 hover:shadow-md transition-all duration-200 border-2 hover:border-transparent ${action.color} hover:text-white group`}
              >
                <div className="flex items-start gap-3 text-left w-full">
                  <action.icon className="h-5 w-5 mt-0.5 group-hover:text-white" />
                  <div>
                    <p className="font-medium text-sm group-hover:text-white">{action.title}</p>
                    <p className="text-xs text-gray-500 group-hover:text-gray-100">{action.description}</p>
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}