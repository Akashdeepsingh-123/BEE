import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      action: "New student enrolled",
      details: "John Smith enrolled in Computer Science 101",
      time: "2 hours ago",
      type: "enrollment"
    },
    {
      id: 2,
      action: "Exam scheduled",
      details: "Midterm exam for Mathematics 201",
      time: "4 hours ago",
      type: "exam"
    },
    {
      id: 3,
      action: "Grades posted",
      details: "Physics 301 assignment grades published",
      time: "1 day ago",
      type: "grade"
    },
    {
      id: 4,
      action: "New course created",
      details: "Advanced Database Systems added",
      time: "2 days ago",
      type: "course"
    }
  ];

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
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}