import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export default function FeeForm({ fee, students, courses, onSubmit, onCancel }) {
    const [formData, setFormData] = useState(fee || {
        student_id: '',
        course_id: '',
        amount: '',
        due_date: '',
        status: 'Due',
        payment_date: '',
        semester: 'Fall',
        year: new Date().getFullYear()
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (fee) {
            setFormData({
                ...fee,
                payment_date: fee.payment_date || ''
            });
        } else {
            // Set default due date to 30 days from today
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 30);
            setFormData(prev => ({
                ...prev,
                due_date: defaultDate.toISOString().split('T')[0]
            }));
        }
    }, [fee]);

    const validate = () => {
        const newErrors = {};
        if (!formData.student_id) newErrors.student_id = 'Student is required';
        if (!formData.course_id) newErrors.course_id = 'Course is required';
        if (!formData.amount || Number(formData.amount) < 1) {
            newErrors.amount = 'Amount must be at least $1';
        }
        if (Number(formData.amount) > 999999) {
            newErrors.amount = 'Amount cannot exceed $999,999';
        }
        if (!formData.due_date) {
            newErrors.due_date = 'Due date is required';
        } else if (!fee && new Date(formData.due_date) < new Date().setHours(0,0,0,0)) {
            newErrors.due_date = 'Due date cannot be before today';
        }
        if (!formData.status) newErrors.status = 'Status is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        
        setSubmitting(true);
        try {
            const course = courses.find(c => c.id === formData.course_id);
            const finalData = {
                ...formData,
                amount: Number(formData.amount),
                semester: course?.semester || formData.semester,
                year: course?.year || formData.year,
                payment_date: formData.status === 'Paid' ? (formData.payment_date || new Date().toISOString().split('T')[0]) : null
            };
            await onSubmit(finalData);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when field is updated
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            'Paid': 'bg-green-100 text-green-800',
            'Due': 'bg-yellow-100 text-yellow-800',
            'Overdue': 'bg-red-100 text-red-800'
        };
        return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{fee ? 'Edit Fee Record' : 'Add Fee Record'}</h2>
                <Button variant="ghost" size="icon" onClick={onCancel} className="hover:bg-gray-100">
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="student_id" className="text-sm font-medium text-gray-700">
                            Student <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                            value={formData.student_id} 
                            onValueChange={(v) => handleInputChange('student_id', v)} 
                            required
                        >
                            <SelectTrigger className={errors.student_id ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select a student" />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map(s => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.first_name} {s.last_name} ({s.student_id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.student_id && <p className="text-xs text-red-500">{errors.student_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="course_id" className="text-sm font-medium text-gray-700">
                            Course <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                            value={formData.course_id} 
                            onValueChange={(v) => handleInputChange('course_id', v)} 
                            required
                        >
                            <SelectTrigger className={errors.course_id ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map(c => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.code} - {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.course_id && <p className="text-xs text-red-500">{errors.course_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                            Amount <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <Input 
                                id="amount" 
                                type="number" 
                                min="1"
                                max="999999"
                                step="0.01"
                                value={formData.amount} 
                                onChange={(e) => handleInputChange('amount', e.target.value)} 
                                className={`pl-7 ${errors.amount ? 'border-red-500' : ''}`}
                                placeholder="0.00"
                                required 
                            />
                        </div>
                        {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="due_date" className="text-sm font-medium text-gray-700">
                            Due Date <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                            id="due_date" 
                            type="date" 
                            value={formData.due_date} 
                            onChange={(e) => handleInputChange('due_date', e.target.value)} 
                            className={errors.due_date ? 'border-red-500' : ''}
                            required 
                        />
                        {errors.due_date && <p className="text-xs text-red-500">{errors.due_date}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                            Status <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center gap-3">
                            <Select 
                                value={formData.status} 
                                onValueChange={(v) => handleInputChange('status', v)}
                                className="flex-1"
                            >
                                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Due">Due</SelectItem>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                    <SelectItem value="Overdue">Overdue</SelectItem>
                                </SelectContent>
                            </Select>
                            {getStatusBadge(formData.status)}
                        </div>
                        {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
                    </div>

                    {formData.status === 'Paid' && (
                        <div className="space-y-2">
                            <Label htmlFor="payment_date" className="text-sm font-medium text-gray-700">
                                Payment Date
                            </Label>
                            <Input 
                                id="payment_date" 
                                type="date" 
                                value={formData.payment_date || new Date().toISOString().split('T')[0]} 
                                onChange={(e) => handleInputChange('payment_date', e.target.value)} 
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="semester" className="text-sm font-medium text-gray-700">
                            Semester
                        </Label>
                        <Select 
                            value={formData.semester} 
                            onValueChange={(v) => handleInputChange('semester', v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Fall">Fall</SelectItem>
                                <SelectItem value="Spring">Spring</SelectItem>
                                <SelectItem value="Summer">Summer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="year" className="text-sm font-medium text-gray-700">
                            Year
                        </Label>
                        <Input 
                            id="year" 
                            type="number" 
                            min="2020"
                            max="2030"
                            value={formData.year} 
                            onChange={(e) => handleInputChange('year', Number(e.target.value))} 
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white" 
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : (fee ? 'Update Fee' : 'Create Fee')}
                    </Button>
                </div>
            </form>
        </div>
    );
}