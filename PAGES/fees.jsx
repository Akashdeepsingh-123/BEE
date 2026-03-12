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
import { Plus, Search, DollarSign, Users, Trash2, Edit, X, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import FeeForm from '../components/fees/FeeForm';
import BulkFeeForm from '../components/fees/BulkFeeForm';

// Toast Notification Component
function Toast({ message, type, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertCircle : Info;

    return (
        <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in`}>
            <Icon className="w-5 h-5" />
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-80">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// Confirmation Dialog Component
function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onCancel}>
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={onConfirm}>Delete</Button>
                </div>
            </div>
        </div>
    );
}

export default function FeesPage() {
    const [fees, setFees] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showBulkForm, setShowBulkForm] = useState(false);
    const [editingFee, setEditingFee] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [toast, setToast] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, feeId: null, studentName: '' });

    useEffect(() => {
        loadData();
        const onChanged = (e) => {
            if (!e.detail || ['Fee','Student','Course','Enrollment'].includes(e.detail.name)) {
                loadData();
            }
        };
        window.addEventListener('sms:entity-changed', onChanged);
        return () => window.removeEventListener('sms:entity-changed', onChanged);
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

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
            showToast("Failed to load fees data.", 'error');
        }
        setLoading(false);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (editingFee) {
                await Fee.update(editingFee.id, formData);
                showToast("Fee updated successfully!", 'success');
            } else {
                await Fee.create(formData);
                showToast("Fee created successfully!", 'success');
            }
            setShowForm(false);
            setEditingFee(null);
            loadData();
        } catch (error) {
            console.error("Error saving fee:", error);
            showToast("Failed to save fee. Please try again.", 'error');
        }
    };
    
    const handleBulkSubmit = async (formData) => {
        try {
            const enrollments = await Enrollment.filter({ course_id: formData.course_id, status: 'Enrolled' });
            const course = courses.find(c => c.id === formData.course_id);
            
            if (enrollments.length === 0) {
                showToast("No students enrolled in selected course.", 'error');
                return;
            }

            const feeRecords = enrollments.map(enrollment => ({
                student_id: enrollment.student_id,
                course_id: formData.course_id,
                amount: Number(formData.amount),
                due_date: formData.due_date,
                status: 'Due',
                semester: course?.semester || formData.semester,
                year: course?.year || formData.year,
            }));

            await Fee.bulkCreate(feeRecords);
            showToast(`Generated ${feeRecords.length} fees successfully!`, 'success');
            setShowBulkForm(false);
            loadData();
        } catch (error) {
            console.error("Error in bulk fee creation:", error);
            showToast("Failed to create fees in bulk.", 'error');
        }
    };

    const handleDeleteClick = (feeId) => {
        const fee = fees.find(f => f.id === feeId);
        const studentName = getStudentName(fee?.student_id || '');
        setDeleteConfirm({ isOpen: true, feeId, studentName });
    };

    const handleDeleteConfirm = async () => {
        if (deleteConfirm.feeId) {
            try {
                await Fee.delete(deleteConfirm.feeId);
                showToast("Fee deleted successfully!", 'success');
                setDeleteConfirm({ isOpen: false, feeId: null, studentName: '' });
                loadData();
            } catch (error) {
                console.error("Error deleting fee:", error);
                showToast("Failed to delete fee record.", 'error');
            }
        }
    };

    const getStudentName = (studentId) => {
        const student = students.find(s => s.id === studentId);
        return student ? `${student.first_name} ${student.last_name}` : "Unknown Student";
    };

    const getCourseName = (courseId) => {
        const course = courses.find(c => c.id === courseId);
        return course ? `${course.code} - ${course.name}` : "Unknown Course";
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Due': return 'bg-yellow-100 text-yellow-800';
            case 'Overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount) => {
        return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
    };

    const filteredFees = fees.filter(fee => {
        const studentName = getStudentName(fee.student_id).toLowerCase();
        const courseName = getCourseName(fee.course_id).toLowerCase();
        return studentName.includes(searchTerm.toLowerCase()) || courseName.includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading fees...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <style>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
            
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Fees Management</h1>
                        <p className="text-gray-600 mt-1">Create and track student fee payments</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button 
                            onClick={() => { setShowBulkForm(true); setShowForm(false); }} 
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Bulk Generate
                        </Button>
                        <Button 
                            onClick={() => { setEditingFee(null); setShowForm(true); setShowBulkForm(false); }} 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Fee
                        </Button>
                    </div>
                </div>

                {/* Modals */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
                            <FeeForm
                                fee={editingFee}
                                students={students}
                                courses={courses}
                                onSubmit={handleFormSubmit}
                                onCancel={() => setShowForm(false)}
                            />
                        </div>
                    </div>
                )}

                {showBulkForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowBulkForm(false)}>
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
                            <BulkFeeForm
                                courses={courses}
                                onSubmit={handleBulkSubmit}
                                onCancel={() => setShowBulkForm(false)}
                            />
                        </div>
                    </div>
                )}

                {/* Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={deleteConfirm.isOpen}
                    title="Delete Fee Record?"
                    message={`Are you sure you want to delete this fee for ${deleteConfirm.studentName}? This action cannot be undone.`}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteConfirm({ isOpen: false, feeId: null, studentName: '' })}
                />

                {/* Toast Notification */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                {/* Fee Records Table */}
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
                        {filteredFees.length === 0 ? (
                            <div className="text-center py-16">
                                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {searchTerm ? 'No fees found matching your search.' : 'No Fee Records Found'}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    {searchTerm ? 'Try adjusting your search terms.' : 'Create your first fee record or generate fees for a course'}
                                </p>
                                {!searchTerm && (
                                    <Button 
                                        onClick={() => { setEditingFee(null); setShowForm(true); setShowBulkForm(false); }}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Fee
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="w-[200px]">Student</TableHead>
                                            <TableHead className="w-[150px]">Course</TableHead>
                                            <TableHead className="w-[120px]">Amount</TableHead>
                                            <TableHead className="w-[120px]">Due Date</TableHead>
                                            <TableHead className="w-[100px]">Status</TableHead>
                                            <TableHead className="w-[150px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredFees.map(fee => (
                                            <TableRow key={fee.id} className="hover:bg-gray-50 transition-colors">
                                                <TableCell className="font-medium">{getStudentName(fee.student_id)}</TableCell>
                                                <TableCell>{getCourseName(fee.course_id)}</TableCell>
                                                <TableCell className="font-semibold text-gray-900">{formatCurrency(fee.amount)}</TableCell>
                                                <TableCell>{formatDate(fee.due_date)}</TableCell>
                                                <TableCell>
                                                    <Badge className={`${getStatusColor(fee.status)} rounded-full px-3 py-1 text-xs font-medium`}>
                                                        {fee.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            onClick={() => { setEditingFee(fee); setShowForm(true); setShowBulkForm(false); }}
                                                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                                        >
                                                            <Edit className="w-3 h-3 mr-1" />
                                                            Edit
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => handleDeleteClick(fee.id)}
                                                            className="text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}