import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Grade } from '@/entities/Grade';
import { Exam } from '@/entities/Exam';
import { Course } from '@/entities/Course';
import { Student } from '@/entities/Student'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';

export default function MyGradesPage() {
    const [gradesData, setGradesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const user = await User.me();
                const studentProfile = await Student.filter({ email: user.email });

                if (studentProfile.length > 0) {
                    const myGrades = await Grade.filter({ student_id: studentProfile[0].id }, '-graded_date');

                    if (myGrades.length > 0) {
                        const examIds = [...new Set(myGrades.map(g => g.exam_id))];
                        const courseIds = [...new Set(myGrades.map(g => g.course_id))];

                        const [allExams, allCourses] = await Promise.all([
                            Exam.list(),
                            Course.list()
                        ]);
                        
                        const examsMap = new Map(allExams.map(e => [e.id, e]));
                        const coursesMap = new Map(allCourses.map(c => [c.id, c]));

                        const populatedGrades = myGrades.map(grade => ({
                            ...grade,
                            exam_title: examsMap.get(grade.exam_id)?.title || 'N/A',
                            course_name: coursesMap.get(grade.course_id)?.name || 'N/A',
                            course_code: coursesMap.get(grade.course_id)?.code || 'N/A',
                        }));
                        setGradesData(populatedGrades);
                    }
                }
            } catch (e) {
                console.error("Error fetching grades:", e);
            }
            setLoading(false);
        };
        fetchGrades();
    }, []);

    const getGradeColor = (grade) => {
        if (['A+', 'A', 'A-'].includes(grade)) return 'bg-green-100 text-green-800';
        if (['B+', 'B', 'B-'].includes(grade)) return 'bg-blue-100 text-blue-800';
        if (['C+', 'C', 'C-'].includes(grade)) return 'bg-yellow-100 text-yellow-800';
        if (['D+', 'D'].includes(grade)) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Grades</h1>
                    <p className="text-gray-600">View your academic performance and grades</p>
                </div>
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5"/>
                            Grade Report
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                         <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead>Course</TableHead>
                                        <TableHead>Exam</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Percentage</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Graded Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {gradesData.map(grade => (
                                        <TableRow key={grade.id} className="hover:bg-gray-50">
                                            <TableCell>
                                                <div className="font-medium">{grade.course_code}</div>
                                                <div className="text-sm text-gray-500">{grade.course_name}</div>
                                            </TableCell>
                                            <TableCell>{grade.exam_title}</TableCell>
                                            <TableCell className="font-medium">{grade.marks_obtained} / {grade.total_marks}</TableCell>
                                            <TableCell>{grade.percentage.toFixed(1)}%</TableCell>
                                            <TableCell>
                                                <Badge className={getGradeColor(grade.letter_grade)}>
                                                    {grade.letter_grade}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(grade.graded_date).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                    {gradesData.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan="6" className="text-center py-10 text-gray-500">
                                                No grades have been posted yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}