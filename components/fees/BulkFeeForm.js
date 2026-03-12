import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export default function BulkFeeForm({ courses, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        course_id: '',
        amount: '',
        due_date: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Card className="mb-8 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Bulk Generate Fees by Course</CardTitle>
                <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <p className="text-sm text-gray-600">This will create a fee record for every student currently enrolled in the selected course.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            <Label htmlFor="amount">Fee Amount ($)</Label>
                            <Input id="amount" type="number" value={formData.amount} onChange={(e) => handleInputChange('amount', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="due_date">Due Date</Label>
                            <Input id="due_date" type="date" value={formData.due_date} onChange={(e) => handleInputChange('due_date', e.target.value)} required />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">Generate Fees</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}