import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
};

export default function StatsCard({ title, value, icon: Icon, color, trend }) {
  const bgColor = colorMap[color] || 'bg-gray-500';

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 ${bgColor} opacity-10 rounded-full`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2.5 rounded-lg ${bgColor} bg-opacity-10`}>
          <Icon className={`h-4 w-4 ${bgColor.replace('bg-', 'text-')}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {value}
        </div>
        {trend && (
          <div className="flex items-center text-xs text-gray-500">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}