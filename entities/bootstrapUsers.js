import { Student } from './Student';
import { User } from './User';

export async function bootstrapUsers() {
  try {
    await User.ensureDefaultAdmin();
  } catch (error) {
    console.error('Failed to ensure default admin user:', error);
  }

  try {
    const students = await Student.list();
    await Promise.all(
      students.map((student) =>
        User.syncStudentAccount(student, { sendEmail: false })
      )
    );
  } catch (error) {
    console.error('Failed to bootstrap student accounts:', error);
  }
}


