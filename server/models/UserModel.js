import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  studentId: { type: String, unique: true, sparse: true },
  password: { type: String }, // Optional for Google Login
  full_name: { type: String },
  role: { type: String, default: 'student' },
  firstLogin: { type: Boolean, default: true },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CourseModel' }],
  profilePic: { type: String }, // Path to the uploaded image
  googleId: { type: String }
}, { strict: false });

export const UserModel = mongoose.models.UserModel || mongoose.model('UserModel', UserSchema);
