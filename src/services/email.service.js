/**
 * Email Service for AlumniCircle
 *
 * This service handles sending emails for various events:
 * - User approval notifications
 * - Event registration confirmations
 * - Password reset emails (handled by Firebase)
 *
 * SETUP REQUIRED:
 * 1. Sign up for EmailJS (free tier: 200 emails/month)
 *    https://www.emailjs.com/
 * 2. Create an email template with the name "approval_email"
 * 3. Add these environment variables to .env:
 *    VITE_EMAILJS_SERVICE_ID=your_service_id
 *    VITE_EMAILJS_TEMPLATE_ID_APPROVAL=your_template_id
 *    VITE_EMAILJS_PUBLIC_KEY=your_public_key
 *
 * ALTERNATIVE: Use Resend, SendGrid, or any other email service
 */

/**
 * Generate approval email HTML
 */
export const generateApprovalEmailHTML = (userName, loginUrl) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Approved - AlumniCircle</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #6b21a8 0%, #9333ea 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">
                🎉 Welcome to AlumniCircle!
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #111827; font-size: 18px; font-weight: 600;">
                Hi ${userName},
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Great news! Your AlumniCircle account has been <strong style="color: #10b981;">approved</strong> by our admin team. You now have full access to all features of our alumni community.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background-color: #f9fafb; border-left: 4px solid #6b21a8; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px; color: #6b21a8; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      You can now:
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                      <li style="margin-bottom: 8px;">Browse the complete alumni directory</li>
                      <li style="margin-bottom: 8px;">Connect with fellow batch members</li>
                      <li style="margin-bottom: 8px;">Register for upcoming events</li>
                      <li style="margin-bottom: 8px;">Update your profile and preferences</li>
                      <li style="margin-bottom: 0;">Participate in community discussions</li>
                    </ul>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6b21a8 0%, #9333ea 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(107, 33, 168, 0.3);">
                      Sign In to Your Account
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you have any questions or need assistance, feel free to reach out to our support team.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 12px; color: #9333ea; font-size: 18px; font-weight: 700;">
                AlumniCircle
              </p>
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">
                School Batch 2003 Directory
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2026 AlumniCircle. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Send approval email using EmailJS
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's full name
 * @returns {Promise<boolean>} Success status
 */
export const sendApprovalEmail = async (userEmail, userName) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_APPROVAL;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  // Check if email service is configured
  if (!serviceId || !templateId || !publicKey) {
    console.group('📧 Approval Email (Email service not configured)');
    console.log('To:', userEmail);
    console.log('Name:', userName);
    console.log('Subject: Account Approved - AlumniCircle');
    console.log('Login URL:', `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/login`);
    console.log('\nTo enable email sending, see EMAIL_SERVICE_SETUP.md');
    console.groupEnd();
    return false;
  }

  try {
    // Dynamically import EmailJS only when needed and configured
    const emailjs = await import('@emailjs/browser');

    const loginUrl = `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/login`;

    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      user_name: userName,
      login_url: loginUrl,
      app_url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    };

    console.group('📧 Sending Approval Email');
    console.log('To:', userEmail);
    console.log('Service ID:', serviceId);
    console.log('Template ID:', templateId);
    console.log('Template Params:', templateParams);
    console.groupEnd();

    await emailjs.default.send(serviceId, templateId, templateParams, publicKey);
    console.log('✅ Approval email sent successfully to:', userEmail);
    return true;
  } catch (error) {
    console.group('❌ Email Service Error');

    // If email package isn't installed
    if (error.message?.includes('Cannot find module') || error.message?.includes('@emailjs')) {
      console.log('Email service package not installed.');
      console.log('See EMAIL_SERVICE_SETUP.md for setup instructions');
    } else if (error.status === 422) {
      console.error('422 Error - Invalid email request');
      console.log('\nCommon causes:');
      console.log('1. Template ID or Service ID is incorrect');
      console.log('2. Template variables mismatch');
      console.log('3. Email service not properly configured');
      console.log('\nSteps to fix:');
      console.log('1. Check your email service dashboard');
      console.log('2. Verify Service ID and Template ID');
      console.log('3. Ensure email service is connected');
      console.log('4. Check template variables: to_email, to_name, user_name, login_url, app_url');
      console.log('5. Verify you haven\'t exceeded email sending limits');
      console.log('\nError details:', error);
    } else {
      console.error('Unexpected error:', error);
      console.log('Error status:', error.status);
      console.log('Error text:', error.text);
    }

    console.log('\nSee EMAIL_SERVICE_SETUP.md for full setup instructions');
    console.groupEnd();
    return false;
  }
};

/**
 * Log email details for manual sending or debugging
 * This is used as a fallback when email service is not configured
 */
export const logEmailDetails = (to, subject, body) => {
  console.group('📧 Email to be sent');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Body:', body);
  console.groupEnd();
};
