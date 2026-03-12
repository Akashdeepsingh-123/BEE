import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Info, Users } from "lucide-react";
import { Enrollment } from '@/entities/Enrollment';

export default function BulkFeeForm({ courses, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        course_id: '',
        amount: '',
        due_date: '',
        semester: 'Fall',
        year: new Date().getFullYear()
    });
    const [enrolledCount, setEnrolledCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Set default due date to 30 days from today
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30);
        setFormData(prev => ({
            ...prev,
            due_date: defaultDate.toISOString().split('T')[0]
        }));
    }, []);

    useEffect(() => {
        const fetchEnrolledCount = async () => {
            if (!formData.course_id) {
                setEnrolledCount(0);
                return;
            }
            setLoading(true);
            try {
                const enrollments = await Enrollment.filter({ 
                    course_id: formData.course_id, 
                    status: 'Enrolled' 
                });
                setEnrolledCount(enrollments.length);
            } catch (error) {
                console.error('Error fetching enrollments:', error);
                setEnrolledCount(0);
            }
            setLoading(false);
        };
        fetchEnrolledCount();
    }, [formData.course_id]);

    const validate = () => {
        const newErrors = {};
        if (!formData.course_id) newErrors.course_id = 'Course is required';
        if (!formData.amount || Number(formData.amount) < 1) {
            newErrors.amount = 'Amount must be at least $1';
        }
        if (Number(formData.amount) > 999999) {
            newErrors.amount = 'Amount cannot exceed $999,999';
        }
        if (!formData.due_date) {
            newErrors.due_date = 'Due date is required';
        }
        if (enrolledCount === 0 && formData.course_id) {
            newErrors.course_id = 'No students enrolled in this course';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        
        setSubmitting(true);
        try {
            await onSubmit(formData);
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

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Bulk Fee Generation</h2>
                <Button variant="ghost" size="icon" onClick={onCancel} className="hover:bg-gray-100">
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm text-blue-800">
                            {formData.course_id ? (
                                loading ? (
                                    <span>Loading enrolled students...</span>
                                ) : enrolledCount > 0 ? (
                                    <span>This will create fees for all <strong>{enrolledCount}</strong> students enrolled in this course.</span>
                                ) : (
                                    <span className="text-red-600">No students are currently enrolled in this course.</span>
                                )
                            ) : (
                                <span>Select a course to see how many students will receive fees.</span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        className="bg-green-600 hover:bg-green-700 text-white" 
                        disabled={submitting || enrolledCount === 0 || loading}
                    >
                        {submitting ? (
                            'Generating...'
                        ) : (
                            <>
                                <Users className="w-4 h-4 mr-2" />
                                Generate Fees ({enrolledCount})
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}