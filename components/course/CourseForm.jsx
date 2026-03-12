import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

export default function CourseForm({ course, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(course || {
    code: '', name: '', description: '', credits: 3, semester: 'Fall', year: new Date().getFullYear(), department: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, credits: Number(formData.credits), year: Number(formData.year) });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{course ? 'Edit Course' : 'Add New Course'}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><Label htmlFor="code">Course Code</Label><Input id="code" value={formData.code} onChange={(e) => handleInputChange('code', e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="name">Course Name</Label><Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="department">Department</Label><Input id="department" value={formData.department} onChange={(e) => handleInputChange('department', e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="credits">Credits</Label><Input id="credits" type="number" value={formData.credits} onChange={(e) => handleInputChange('credits', e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="semester">Semester</Label><Select value={formData.semester} onValueChange={(v) => handleInputChange('semester', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Fall">Fall</SelectItem><SelectItem value="Spring">Spring</SelectItem><SelectItem value="Summer">Summer</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="year">Year</Label><Input id="year" type="number" value={formData.year} onChange={(e) => handleInputChange('year', e.target.value)} required /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} /></div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{course ? 'Update Course' : 'Add Course'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}