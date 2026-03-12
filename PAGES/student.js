
import React, { useState, useEffect } from "react";
import { Student } from "@/entities/Student";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Eye } from "lucide-react";
import StudentForm from "../components/student/StudentForm";
import StudentDetails from "../components/student/StudentDetail";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await Student.list('-created_date');
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (studentData) => {
    try {
      if (editingStudent) {
        // When editing, check for duplicates, excluding the student being edited
        const duplicateId = students.find(s => s.student_id === studentData.student_id && s.id !== editingStudent.id);
        if (duplicateId) {
          alert('Error: Another student with this Student ID already exists.');
          return;
        }
        const duplicateEmail = students.find(s => s.email === studentData.email && s.id !== editingStudent.id);
        if (duplicateEmail) {
          alert('Error: Another student with this email address already exists.');
          return;
        }
        await Student.update(editingStudent.id, studentData);
      } else {
        // When creating, check for duplicates
        const duplicateId = students.find(s => s.student_id === studentData.student_id);
        if (duplicateId) {
          alert('Error: A student with this Student ID already exists.');
          return;
        }
        const duplicateEmail = students.find(s => s.email === studentData.email);
        if (duplicateEmail) {
          alert('Error: A student with this email address already exists.');
          return;
        }
        await Student.create(studentData);
      }
      setShowForm(false);
      setEditingStudent(null);
      loadStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      // More specific error message for the user
      alert(`Error saving student: ${error.message || 'Please check the console for details.'}`);
    }
  };

  const filteredStudents = students.filter(student =>
    student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.major?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Graduated': return 'bg-blue-100 text-blue-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedStudent) {
    return (
      <StudentDetails 
        student={selectedStudent} 
        onBack={() => setSelectedStudent(null)} 
      />
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
            <p className="text-gray-600 mt-1">Manage student records and enrollment</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>

        {showForm && (
          <StudentForm 
            student={editingStudent}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingStudent(null);
            }}
          />
        )}

        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-white">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CardTitle className="text-xl">Students ({students.length})</CardTitle>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading students...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Major</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>GPA</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{student.student_id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.first_name} {student.last_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.major}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.year}</Badge>
                        </TableCell>
                        <TableCell>{student.gpa ? student.gpa.toFixed(2) : 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(student.status)}>
                            {student.status || 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedStudent(student)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingStudent(student);
                                setShowForm(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredStudents.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No students found matching your search.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
