import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { Course } from '@/entities/Course';


export default function ExamForm({ exam, courseId, onSubmit, onCancel }) {
    const [formData, setFormData] = useState(exam || {
        course_id: courseId || '',
        title: '',
        type: 'Midterm',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        duration: 90,
        location: '',
        total_marks: 100,
        instructions: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = {
            ...formData,
            duration: Number(formData.duration),
            total_marks: Number(formData.total_marks)
        };
        onSubmit(submitData);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Card className="mb-8 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{exam ? 'Edit Exam' : 'Create New Exam'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={onCancel}>
                    <X className="w-4 h-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Exam Title</Label>
                            <Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Exam Type</Label>
                            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Quiz">Quiz</SelectItem>
                                    <SelectItem value="Assignment">Assignment</SelectItem>
                                    <SelectItem value="Project">Project</SelectItem>
                                    <SelectItem value="Midterm">Midterm</SelectItem>
                                    <SelectItem value="Final">Final</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input id="date" type="date" value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Time</Label>
                            <Input id="time" type="time" value={formData.time} onChange={(e) => handleInputChange('time', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="total_marks">Total Marks</Label>
                            <Input id="total_marks" type="number" value={formData.total_marks} onChange={(e) => handleInputChange('total_marks', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input id="duration" type="number" value={formData.duration} onChange={(e) => handleInputChange('duration', e.target.value)} />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} placeholder="e.g., Room 301, Block B" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="instructions">Instructions</Label>
                            <Textarea id="instructions" value={formData.instructions} onChange={(e) => handleInputChange('instructions', e.target.value)} placeholder="Enter any instructions for the exam..." />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{exam ? 'Update Exam' : 'Create Exam'}</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}