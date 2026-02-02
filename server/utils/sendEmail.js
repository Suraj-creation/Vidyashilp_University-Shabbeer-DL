const nodemailer = require('nodemailer');

/**
 * Send email using configured email service
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 */
const sendEmail = async (options) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email service not configured. Skipping email send.');
      console.log('Would have sent email to:', options.to);
      console.log('Subject:', options.subject);
      return;
    }

    // Create transporter
    const transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', options.to);
    console.log('Message ID:', info.messageId);
    
    return info;
  } catch (error) {
    console.error('Email send error:', error.message);
    // Don't throw error - allow the process to continue even if email fails
    console.warn('Email sending failed but process will continue');
  }
};

module.exports = sendEmail;
