import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Fee } from '@/entities/Fee';
import { Student } from '@/entities/Student';
import { Course } from '@/entities/Course';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';

export default function MyFeesPage() {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalDue, setTotalDue] = useState(0);

    useEffect(() => {
        const fetchMyFees = async () => {
            try {
                const user = await User.me();
                const studentProfile = await Student.filter({ email: user.email });

                if (studentProfile.length > 0) {
                    const myFeeRecords = await Fee.filter({ student_id: studentProfile[0].id }, '-due_date');

                    const courseIds = [...new Set(myFeeRecords.map(f => f.course_id))];
                    const courses = await Course.list();
                    const coursesMap = new Map(courses.map(c => [c.id, c]));

                    const populatedFees = myFeeRecords.map(fee => ({
                        ...fee,
                        course_name: coursesMap.get(fee.course_id)?.name || 'Unknown Course'
                    }));

                    setFees(populatedFees);
                    
                    const dueAmount = populatedFees
                        .filter(f => f.status === 'Due' || f.status === 'Overdue')
                        .reduce((sum, f) => sum + f.amount, 0);
                    setTotalDue(dueAmount);
                }
            } catch (error) {
                console.error("Error fetching fees:", error);
            }
            setLoading(false);
        };
        fetchMyFees();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Due': return 'bg-yellow-100 text-yellow-800';
            case 'Overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading your fee information...</div>;
    }

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Fees</h1>
                    <p className="text-gray-600 mt-1">Review your fee statements and payment status</p>
                </div>
                
                <Card className="mb-8 shadow-md">
                    <CardHeader>
                        <CardTitle>Fee Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-red-600">
                            ${totalDue.toLocaleString()}
                        </div>
                        <p className="text-gray-600">Total amount due</p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Fee Statements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead>Course</TableHead>
                                        <TableHead>Semester & Year</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Payment Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fees.length > 0 ? fees.map(fee => (
                                        <TableRow key={fee.id}>
                                            <TableCell className="font-medium">{fee.course_name}</TableCell>
                                            <TableCell>{fee.semester} {fee.year}</TableCell>
                                            <TableCell>${fee.amount.toLocaleString()}</TableCell>
                                            <TableCell>{new Date(fee.due_date).toLocaleDateString()}</TableCell>
                                            <TableCell><Badge className={getStatusColor(fee.status)}>{fee.status}</Badge></TableCell>
                                            <TableCell>{fee.payment_date ? new Date(fee.payment_date).toLocaleDateString() : 'N/A'}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan="6" className="text-center py-10">No fee records found.</TableCell>
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