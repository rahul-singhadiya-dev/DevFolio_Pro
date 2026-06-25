const nodemailer = require('nodemailer');

// Create transporter from environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a notification email to the administrator on a new contact form submission
 * @param {object} messageData - The contact message data
 * @param {string} messageData.name - Visitor name
 * @param {string} messageData.email - Visitor email
 * @param {string} messageData.subject - Message subject
 * @param {string} messageData.message - Message body
 * @returns {Promise<any>} - Nodemailer send result
 */
async function sendContactNotification({ name, email, subject, message }) {
  // Validate configuration presence
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    !process.env.NOTIFY_EMAIL
  ) {
    console.warn('Mail notification skipped: SMTP environment variables are missing.');
    return null;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || `"DevFolio Pro" <noreply@yourdomain.com>`,
    to: process.env.NOTIFY_EMAIL,
    subject: `[DevFolio Pro Contact] ${subject}`,
    text: `You have received a new contact message from your portfolio site:\n\n` +
          `Name: ${name}\n` +
          `Email: ${email}\n` +
          `Subject: ${subject}\n\n` +
          `Message:\n${message}\n`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-top: 0;">New Contact Form Submission</h2>
        <p>You have received a new message from your portfolio website.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 100px; color: #475569;">Name:</td>
            <td style="padding: 6px 0;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #475569;">Email:</td>
            <td style="padding: 6px 0;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold; color: #475569;">Subject:</td>
            <td style="padding: 6px 0; font-weight: bold;">${subject}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; white-space: pre-wrap;">
          ${message}
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendContactNotification,
};
