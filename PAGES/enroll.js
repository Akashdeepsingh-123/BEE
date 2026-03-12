
import React, { useState, useEffect } from "react";
import { Student } from "@/entities/Student";
import { Course } from "@/entities/Course";
import { Enrollment } from "@/entities/Enrollment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, X, Users } from "lucide-react";

export default function EnrollmentsPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    semester: 'Fall',
    year: new Date().getFullYear(),
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'Enrolled'
  });
  const [bulkEnrollment, setBulkEnrollment] = useState({
    course_id: '',
    semester: 'Fall',
    year: new Date().getFullYear(),
    student_year: '',
    major: '',
    selected_students: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, coursesData, enrollmentsData] = await Promise.all([
        Student.list(),
        Course.list(),
        Enrollment.list('-created_date')
      ]);
      setStudents(studentsData);
      setCourses(coursesData);
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check if enrollment already exists
      const existingEnrollment = enrollments.find(
        e => e.student_id === formData.student_id && 
             e.course_id === formData.course_id && 
             e.status === 'Enrolled'
      );

      if (existingEnrollment) {
        alert('Student is already enrolled in this course');
        return;
      }

      await Enrollment.create(formData);
      alert('Student enrolled successfully!');
      setShowForm(false);
      setFormData({
        student_id: '',
        course_id: '',
        semester: 'Fall',
        year: new Date().getFullYear(),
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'Enrolled'
      });
      loadData();
    } catch (error) {
      console.error('Error enrolling student:', error);
      alert('Error enrolling student. Please try again.');
    }
  };

  const getFilteredStudents = () => {
    if (!bulkEnrollment.course_id) {
      return []; 
    }

    return students.filter(student => {
      const yearMatch = !bulkEnrollment.student_year || student.year === bulkEnrollment.student_year;
      const majorMatch = !bulkEnrollment.major || (student.major && student.major.toLowerCase().includes(bulkEnrollment.major.toLowerCase()));
      
      const alreadyEnrolled = enrollments.some(
        e => e.student_id === student.id && 
             e.course_id === bulkEnrollment.course_id && 
             e.status === 'Enrolled'
      );
      
      return yearMatch && majorMatch && !alreadyEnrolled;
    });
  };

  const handleBulkEnrollment = async () => {
    if (!bulkEnrollment.course_id) {
      alert('Please select a course first');
      return;
    }

    const studentsToEnrollIds = bulkEnrollment.selected_students.length > 0 
      ? bulkEnrollment.selected_students 
      : getFilteredStudents().map(s => s.id);

    if (studentsToEnrollIds.length === 0) {
      alert('No students to enroll based on current filters or selections.');
      return;
    }

    try {
      const enrollmentRecords = studentsToEnrollIds.map(studentId => ({
        student_id: studentId,
        course_id: bulkEnrollment.course_id,
        semester: bulkEnrollment.semester,
        year: bulkEnrollment.year,
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'Enrolled'
      }));

      // Assuming Enrollment.bulkCreate is available
      await Enrollment.bulkCreate(enrollmentRecords); 
      alert(`Successfully enrolled ${studentsToEnrollIds.length} students!`);
      setShowBulkForm(false);
      setBulkEnrollment({
        course_id: '',
        semester: 'Fall',
        year: new Date().getFullYear(),
        student_year: '',
        major: '',
        selected_students: []
      });
      loadData();
    } catch (error) {
      console.error('Error with bulk enrollment:', error);
      alert('Error enrolling students. Please try again.');
    }
  };

  const handleStudentSelection = (studentId, isChecked) => {
    setBulkEnrollment(prev => ({
      ...prev,
      selected_students: isChecked 
        ? [...prev.selected_students, studentId]
        : prev.selected_students.filter(id => id !== studentId)
    }));
  };

  const handleSelectAllFiltered = () => {
    const filteredStudentIds = getFilteredStudents().map(s => s.id);
    setBulkEnrollment(prev => ({
      ...prev,
      selected_students: filteredStudentIds
    }));
  };

  const handleUnenroll = async (enrollmentId) => {
    if (confirm('Are you sure you want to drop this student from the course?')) {
      try {
        await Enrollment.update(enrollmentId, { status: 'Dropped' });
        alert('Student dropped from course successfully!');
        loadData();
      } catch (error) {
        console.error('Error dropping student:', error);
        alert('Error dropping student. Please try again.');
      }
    }
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name} (${student.student_id})` : 'Unknown Student';
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.code} - ${course.name}` : 'Unknown Course';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Enrolled': return 'bg-green-100 text-green-800';
      case 'Dropped': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const studentName = getStudentName(enrollment.student_id).toLowerCase();
    const courseName = getCourseName(enrollment.course_id).toLowerCase();
    return studentName.includes(searchTerm.toLowerCase()) || 
           courseName.includes(searchTerm.toLowerCase());
  });

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Enrollments</h1>
            <p className="text-gray-600 mt-1">Manage student course enrollments</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => { setShowBulkForm(true); setShowForm(false); }} className="bg-green-600 hover:bg-green-700">
              <Users className="w-4 h-4 mr-2" />
              Bulk Enroll
            </Button>
            <Button onClick={() => { setShowForm(true); setShowBulkForm(false); }} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Enroll Student
            </Button>
          </div>
        </div>

        {showBulkForm && (
          <Card className="mb-8 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Bulk Student Enrollment</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowBulkForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="bulk-course-select" className="text-sm font-medium text-gray-700 mb-2 block">Course</label>
                    <Select
                      value={bulkEnrollment.course_id}
                      onValueChange={(value) => setBulkEnrollment(prev => ({ ...prev, course_id: value, selected_students: [] }))}
                      required
                    >
                      <SelectTrigger id="bulk-course-select">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.code} - {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="bulk-student-year-select" className="text-sm font-medium text-gray-700 mb-2 block">Student Year</label>
                    <Select
                      value={bulkEnrollment.student_year}
                      onValueChange={(value) => setBulkEnrollment(prev => ({ ...prev, student_year: value, selected_students: [] }))}
                    >
                      <SelectTrigger id="bulk-student-year-select">
                        <SelectValue placeholder="All years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>All Years</SelectItem>
                        <SelectItem value="Freshman">Freshman</SelectItem>
                        <SelectItem value="Sophomore">Sophomore</SelectItem>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="bulk-major-input" className="text-sm font-medium text-gray-700 mb-2 block">Major (optional)</label>
                    <Input
                      id="bulk-major-input"
                      value={bulkEnrollment.major}
                      onChange={(e) => setBulkEnrollment(prev => ({ ...prev, major: e.target.value, selected_students: [] }))}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div>
                    <label htmlFor="bulk-semester-select" className="text-sm font-medium text-gray-700 mb-2 block">Semester</label>
                    <Select
                      value={bulkEnrollment.semester}
                      onValueChange={(value) => setBulkEnrollment(prev => ({ ...prev, semester: value }))}
                    >
                      <SelectTrigger id="bulk-semester-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Spring">Spring</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="bulk-year-input" className="text-sm font-medium text-gray-700 mb-2 block">Enrollment Year</label>
                    <Input
                      id="bulk-year-input"
                      type="number"
                      value={bulkEnrollment.year}
                      onChange={(e) => setBulkEnrollment(prev => ({ ...prev, year: Number(e.target.value) }))}
                      required
                    />
                  </div>
                </div>

                {bulkEnrollment.course_id && (
                  <>
                    <div className="flex justify-between items-center mt-6">
                      <h3 className="text-lg font-medium">
                        Eligible Students ({getFilteredStudents().length})
                      </h3>
                      {getFilteredStudents().length > 0 && (
                        <Button onClick={handleSelectAllFiltered} variant="outline" type="button">
                          Select All Filtered ({getFilteredStudents().length})
                        </Button>
                      )}
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-12">Select</TableHead>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Major</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getFilteredStudents().length > 0 ? (
                            getFilteredStudents().map((student) => (
                              <TableRow key={student.id}>
                                <TableCell>
                                  <Checkbox
                                    checked={bulkEnrollment.selected_students.includes(student.id)}
                                    onCheckedChange={(checked) => handleStudentSelection(student.id, checked)}
                                  />
                                </TableCell>
                                <TableCell>{student.student_id}</TableCell>
                                <TableCell>{student.first_name} {student.last_name}</TableCell>
                                <TableCell>{student.year}</TableCell>
                                <TableCell>{student.major}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                                No eligible students found for the selected course and filters, or all are already enrolled.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowBulkForm(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleBulkEnrollment} 
                        className="bg-green-600 hover:bg-green-700"
                        disabled={
                          (bulkEnrollment.selected_students.length === 0 && getFilteredStudents().length === 0) ||
                          !bulkEnrollment.course_id
                        }
                      >
                        Enroll Selected Students ({bulkEnrollment.selected_students.length || getFilteredStudents().length})
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {showForm && (
          <Card className="mb-8 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Enroll Student in Course</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="student-select" className="text-sm font-medium text-gray-700 mb-2 block">Student</label>
                    <Select
                      value={formData.student_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, student_id: value }))}
                      required
                    >
                      <SelectTrigger id="student-select">
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(student => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.first_name} {student.last_name} ({student.student_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="course-select" className="text-sm font-medium text-gray-700 mb-2 block">Course</label>
                    <Select
                      value={formData.course_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, course_id: value }))}
                      required
                    >
                      <SelectTrigger id="course-select">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.code} - {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="semester-select" className="text-sm font-medium text-gray-700 mb-2 block">Semester</label>
                    <Select
                      value={formData.semester}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}
                    >
                      <SelectTrigger id="semester-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Spring">Spring</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="year-input" className="text-sm font-medium text-gray-700 mb-2 block">Year</label>
                    <Input
                      id="year-input"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Enroll Student
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-white">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CardTitle className="text-xl">Enrollments ({enrollments.length})</CardTitle>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search enrollments..."
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
                    <TableHead>Semester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enrolled Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.length > 0 ? (
                    filteredEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id} className="hover:bg-gray-50">
                        <TableCell>{getStudentName(enrollment.student_id)}</TableCell>
                        <TableCell>{getCourseName(enrollment.course_id)}</TableCell>
                        <TableCell>{enrollment.semester} {enrollment.year}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(enrollment.status)}>
                            {enrollment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(enrollment.enrollment_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {enrollment.status === 'Enrolled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnenroll(enrollment.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Drop
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                        No enrollments found for your search.
                      </TableCell>
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
