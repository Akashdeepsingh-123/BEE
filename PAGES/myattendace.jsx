import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Attendance } from '@/entities/Attendance';
import { Student } from '@/entities/Student';
import { Course } from '@/entities/Course';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, BookOpen, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function MyAttendancePage() {
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalClasses: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        percentage: 0
    });

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const user = await User.me();
                const studentProfile = await Student.filter({ email: user.email });
                if (studentProfile.length > 0) {
                    const records = await Attendance.filter({ student_id: studentProfile[0].id }, '-date');
                    
                    // Get course information
                    const courses = await Course.list();
                    const coursesMap = new Map(courses.map(c => [c.id, c]));

                    const enrichedRecords = records.map(record => ({
                        ...record,
                        course_name: coursesMap.get(record.course_id)?.name || 'Unknown Course',
                        course_code: coursesMap.get(record.course_id)?.code || 'N/A'
                    }));

                    setAttendanceData(enrichedRecords);

                    // Calculate statistics
                    const totalClasses = records.length;
                    const present = records.filter(r => r.status === 'Present').length;
                    const absent = records.filter(r => r.status === 'Absent').length;
                    const late = records.filter(r => r.status === 'Late').length;
                    const excused = records.filter(r => r.status === 'Excused').length;
                    const percentage = totalClasses > 0 ? ((present + late + excused) / totalClasses * 100) : 0;

                    setStats({
                        totalClasses,
                        present,
                        absent,
                        late,
                        excused,
                        percentage: percentage.toFixed(1)
                    });
                }
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        };
        fetchAttendance();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'bg-green-100 text-green-800';
            case 'Absent': return 'bg-red-100 text-red-800';
            case 'Late': return 'bg-yellow-100 text-yellow-800';
            case 'Excused': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPercentageColor = (percentage) => {
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 75) return 'text-blue-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) return (
        <div className="p-6 md:p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Attendance</h1>
                    <p className="text-gray-600">View your attendance records across all courses</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <Calendar className="h-8 w-8 text-blue-500 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Total Classes</p>
                                <p className="text-2xl font-bold">{stats.totalClasses}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <BookOpen className="h-8 w-8 text-green-500 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Present</p>
                                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <TrendingUp className={`h-8 w-8 mr-3 ${getPercentageColor(stats.percentage).replace('text-', 'text-')}`} />
                            <div>
                                <p className="text-sm text-gray-600">Attendance %</p>
                                <p className={`text-2xl font-bold ${getPercentageColor(stats.percentage)}`}>
                                    {stats.percentage}%
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm">A</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Absent</p>
                                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Attendance Records */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Attendance Records
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {attendanceData.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead>Date</TableHead>
                                            <TableHead>Course</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attendanceData.map(record => (
                                            <TableRow key={record.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    {format(new Date(record.date), 'MMM dd, yyyy')}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{record.course_code}</p>
                                                        <p className="text-sm text-gray-500">{record.course_name}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(record.status)}>
                                                        {record.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-gray-500">
                                                    {record.notes || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No attendance records found</p>
                                <p className="text-sm mt-1">Attendance will appear here once marked by instructors</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}