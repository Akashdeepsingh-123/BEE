import { AttendanceModel } from '../models/AttendanceModel.js';

export async function markAttendance(req, res) {
  try {
    const { studentId, courseId, status, date } = req.body;
    
    if (!studentId || !courseId || !status) {
      return res.status(400).json({ message: 'studentId, courseId, and status are required' });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    

    const record = new AttendanceModel({
      studentId,
      courseId,
      status,
      date: attendanceDate
    });

    await record.save();
    res.status(201).json({ message: 'Attendance marked successfully', record });
  } catch (error) {
    console.error('Mark Attendance Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getStudentAttendance(req, res) {
  try {
    const { id } = req.user; // from JWT
    const attendance = await AttendanceModel.find({ studentId: id }).populate('courseId', 'courseName');
    res.json(attendance);
  } catch (error) {
    console.error('Get Attendance Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
