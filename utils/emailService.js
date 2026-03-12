/**
 * Email Service Utility
 * 
 * This service handles sending emails. Currently uses a mock implementation
 * that logs to console and shows alerts. Can be easily replaced with a real
 * email service like SendGrid, AWS SES, or Nodemailer.
 */

/**
 * Send a temporary password email to a user
 * @param {string} to - Recipient email address
 * @param {string} password - Temporary password
 * @param {string} name - Recipient's full name
 * @param {string} role - User role (student/faculty)
 * @returns {Promise<boolean>} - Success status
 */
export async function sendTempPasswordEmail(to, password, name, role = 'student') {
  try {
    const roleName = role === 'faculty' ? 'Faculty' : 'Student';
    const subject = `Your ${roleName} Portal Login Credentials - AcademiaHub`;
    
    const emailBody = `
Dear ${name},

Welcome to AcademiaHub - Chitkara University's Academic Management System!

Your ${roleName} account has been created. Please use the following credentials to log in:

Email: ${to}
Temporary Password: ${password}

IMPORTANT: Please change your password after your first login for security purposes.

You can access the portal at: ${window.location.origin}

Best regards,
AcademiaHub Team
Chitkara University
    `.trim();

    // Mock email sending - logs to console and shows alert
    // In production, replace this with actual email API call
    console.log('='.repeat(60));
    console.log('📧 EMAIL SENT (Mock)');
    console.log('='.repeat(60));
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${emailBody}`);
    console.log('='.repeat(60));

    // Show user-friendly notification
    alert(
      `📧 Email Sent!\n\n` +
      `A temporary password has been sent to:\n${to}\n\n` +
      `Password: ${password}\n\n` +
      `(Check console for full email details)`
    );

    // In production, uncomment and configure one of these:
    
    // Option 1: SendGrid
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email: to }] }],
    //     from: { email: 'noreply@academiahub.edu' },
    //     subject: subject,
    //     content: [{ type: 'text/plain', value: emailBody }]
    //   })
    // });
    // return response.ok;

    // Option 2: AWS SES
    // const response = await fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ to, subject, body: emailBody })
    // });
    // return response.ok;

    // Option 3: Nodemailer (via backend API)
    // const response = await fetch('/api/email/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ to, subject, html: emailBody })
    // });
    // return response.ok;

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    // Fallback: still show the password to user
    alert(
      `⚠️ Email service unavailable, but here are the credentials:\n\n` +
      `Email: ${to}\n` +
      `Password: ${password}\n\n` +
      `Please save these credentials securely.`
    );
    return false;
  }
}

/**
 * Send a password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} name - Recipient's full name
 * @returns {Promise<boolean>} - Success status
 */
export async function sendPasswordResetEmail(to, resetToken, name) {
  const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request - AcademiaHub';
  
  const emailBody = `
Dear ${name},

You have requested to reset your password for your AcademiaHub account.

Click the following link to reset your password:
${resetLink}

This link will expire in 24 hours.

If you did not request this, please ignore this email.

Best regards,
AcademiaHub Team
  `.trim();

  console.log('📧 Password Reset Email:', { to, subject, body: emailBody });
  return true;
}

