import React, { useState, useEffect } from "react";
import { Faculty } from "@/entities/Faculty";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit } from "lucide-react";
import FacultyForm from "../components/faculty/FacultyForm";

export default function FacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    try {
      const data = await Faculty.list('-created_date');
      setFaculty(data);
    } catch (error) {
      console.error('Error loading faculty:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (facultyData) => {
    try {
      if (editingFaculty) {
        await Faculty.update(editingFaculty.id, facultyData);
      } else {
        await Faculty.create(facultyData);
      }
      setShowForm(false);
      setEditingFaculty(null);
      loadFaculty();
    } catch (error) {
      console.error('Error saving faculty:', error);
    }
  };

  const filteredFaculty = faculty.filter(f =>
    f.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.faculty_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faculty Management</h1>
            <p className="text-gray-600 mt-1">Manage faculty profiles and assignments</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Faculty
          </Button>
        </div>

        {showForm && (
          <FacultyForm 
            faculty={editingFaculty}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingFaculty(null);
            }}
          />
        )}

        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-white">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CardTitle className="text-xl">Faculty Members ({faculty.length})</CardTitle>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search faculty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Faculty ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFaculty.map((member) => (
                      <TableRow key={member.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{member.faculty_id}</TableCell>
                        <TableCell>{member.first_name} {member.last_name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.department}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{member.position}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingFaculty(member);
                              setShowForm(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
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