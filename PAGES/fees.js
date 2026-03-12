import React, { useState, useEffect } from 'react';
import { Fee } from '@/entities/Fee';
import { Student } from '@/entities/Student';
import { Course } from '@/entities/Course';
import { Enrollment } from '@/entities/Enrollment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, DollarSign, Users, Trash2 } from 'lucide-react';
import FeeForm from '../components/fees/FeeForm';
import BulkFeeForm from '../components/fees/BulkFeeForm';

export default function FeesPage() {
    const [fees, setFees] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showBulkForm, setShowBulkForm] = useState(false);
    const [editingFee, setEditingFee] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [feeData, studentData, courseData] = await Promise.all([
                Fee.list('-created_date'),
                Student.list(),
                Course.list()
            ]);
            setFees(feeData);
            setStudents(studentData);
            setCourses(courseData);
        } catch (error) {
            console.error("Error loading data:", error);
        }
        setLoading(false);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (editingFee) {
                await Fee.update(editingFee.id, formData);
            } else {
                await Fee.create(formData);
            }
            setShowForm(false);
            setEditingFee(null);
            loadData();
        } catch (error) {
            console.error("Error saving fee:", error);
            alert("Failed to save fee.");
        }
    };
    
    const handleBulkSubmit = async ({ course_id, amount, due_date }) => {
        try {
            const enrollments = await Enrollment.filter({ course_id: course_id, status: 'Enrolled' });
            const course = courses.find(c => c.id === course_id);
            
            if (enrollments.length === 0) {
                alert("No students are enrolled in this course.");
                return;
            }

            const feeRecords = enrollments.map(enrollment => ({
                student_id: enrollment.student_id,
                course_id,
                amount,
                due_date,
                status: 'Due',
                semester: course.semester,
                year: course.year,
            }));

            await Fee.bulkCreate(feeRecords);
            alert(`Successfully created ${feeRecords.length} fee records.`);
            setShowBulkForm(false);
            loadData();
        } catch (error) {
            console.error("Error in bulk fee creation:", error);
            alert("Failed to create fees in bulk.");
        }
    };

    const handleDeleteFee = async (feeId) => {
        if (confirm("Are you sure you want to delete this fee record?")) {
            try {
                await Fee.delete(feeId);
                loadData();
            } catch (error) {
                console.error("Error deleting fee:", error);
                alert("Failed to delete fee record.");
            }
        }
    };

    const getStudentName = (studentId) => {
        const student = students.find(s => s.id === studentId);
        return student ? `${student.first_name} ${student.last_name}` : "Unknown Student";
    };

    const getCourseName = (courseId) => {
        const course = courses.find(c => c.id === courseId);
        return course ? course.name : "Unknown Course";
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Due': return 'bg-yellow-100 text-yellow-800';
            case 'Overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredFees = fees.filter(fee => {
        const studentName = getStudentName(fee.student_id).toLowerCase();
        const courseName = getCourseName(fee.course_id).toLowerCase();
        return studentName.includes(searchTerm.toLowerCase()) || courseName.includes(searchTerm.toLowerCase());
    });

    if (loading) return <div className="p-8 text-center">Loading fees...</div>;

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Fees Management</h1>
                        <p className="text-gray-600 mt-1">Create and track student fee payments</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => { setShowBulkForm(true); setShowForm(false); }} className="bg-green-600 hover:bg-green-700">
                            <Users className="w-4 h-4 mr-2" />
                            Bulk Generate
                        </Button>
                        <Button onClick={() => { setEditingFee(null); setShowForm(true); setShowBulkForm(false); }} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Single Fee
                        </Button>
                    </div>
                </div>

                {showForm && (
                    <FeeForm
                        fee={editingFee}
                        students={students}
                        courses={courses}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setShowForm(false)}
                    />
                )}

                {showBulkForm && (
                    <BulkFeeForm
                        courses={courses}
                        onSubmit={handleBulkSubmit}
                        onCancel={() => setShowBulkForm(false)}
                    />
                )}

                <Card className="shadow-lg border-0">
                    <CardHeader className="border-b bg-white">
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            <CardTitle className="text-xl">Fee Records ({fees.length})</CardTitle>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search by student or course..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead>Student</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFees.map(fee => (
                                        <TableRow key={fee.id}>
                                            <TableCell>{getStudentName(fee.student_id)}</TableCell>
                                            <TableCell>{getCourseName(fee.course_id)}</TableCell>
                                            <TableCell className="font-medium">${fee.amount.toLocaleString()}</TableCell>
                                            <TableCell>{new Date(fee.due_date).toLocaleDateString()}</TableCell>
                                            <TableCell><Badge className={getStatusColor(fee.status)}>{fee.status}</Badge></TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => { setEditingFee(fee); setShowForm(true); }}>
                                                        Edit
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteFee(fee.id)}>
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}