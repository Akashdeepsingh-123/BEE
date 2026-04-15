import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  courseName: { type: String },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserModel' }]
}, { strict: false });

export const CourseModel = mongoose.models.CourseModel || mongoose.model('CourseModel', CourseSchema);
