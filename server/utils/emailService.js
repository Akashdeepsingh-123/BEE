import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendTempPasswordEmail = async (email, studentId, password, fullName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to AcademiaHub! Your Account Details',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to AcademiaHub!</h2>
        <p>Dear ${fullName},</p>
        <p>An administrator has created a student account for you.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Username/Student ID:</strong> ${studentId} (or your email)</p>
          <p><strong>Temporary Password:</strong> ${password}</p>
        </div>
        <p>Please <a href="http://localhost:5173/">login here</a> and you will be prompted to change your password on your first login.</p>
        <br />
        <p>Best regards,<br/>The Administration Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
  }
};
