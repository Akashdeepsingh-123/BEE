import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export default function FeeForm({ fee, students, courses, onSubmit, onCancel }) {
    const [formData, setFormData] = useState(fee || {
        student_id: '',
        course_id: '',
        amount: '',
        due_date: '',
        status: 'Due',
        payment_date: null
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const course = courses.find(c => c.id === formData.course_id);
        const finalData = {
            ...formData,
            amount: Number(formData.amount),
            semester: course?.semester,
            year: course?.year,
        };
        onSubmit(finalData);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Card className="mb-8 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{fee ? 'Edit Fee Record' : 'Add New Fee Record'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="student_id">Student</Label>
                            <Select value={formData.student_id} onValueChange={(v) => handleInputChange('student_id', v)} required>
                                <SelectTrigger><SelectValue placeholder="Select a student" /></SelectTrigger>
                                <SelectContent>
                                    {students.map(s => <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="course_id">Course</Label>
                            <Select value={formData.course_id} onValueChange={(v) => handleInputChange('course_id', v)} required>
                                <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
                                <SelectContent>
                                    {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount ($)</Label>
                            <Input id="amount" type="number" value={formData.amount} onChange={(e) => handleInputChange('amount', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="due_date">Due Date</Label>
                            <Input id="due_date" type="date" value={formData.due_date} onChange={(e) => handleInputChange('due_date', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(v) => handleInputChange('status', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Due">Due</SelectItem>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                    <SelectItem value="Overdue">Overdue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         {formData.status === 'Paid' && (
                            <div className="space-y-2">
                                <Label htmlFor="payment_date">Payment Date</Label>
                                <Input id="payment_date" type="date" value={formData.payment_date || ''} onChange={(e) => handleInputChange('payment_date', e.target.value)} />
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{fee ? 'Update Record' : 'Create Record'}</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}