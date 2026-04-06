import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseModel', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Present', 'Absent'], required: true }
});

export const AttendanceModel = mongoose.models.AttendanceModel || mongoose.model('AttendanceModel', AttendanceSchema);
