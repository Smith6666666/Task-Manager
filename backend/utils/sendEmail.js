const nodemailer = require('nodemailer');
const path = require('path');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const info = await transporter.sendMail({
    from: `"Smith's Task Manager" <onboarding@resend.dev>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
    attachments: [
      {
        filename: 'logo-sm.png',
        path: path.join(__dirname, '..', 'public', 'logo-sm.png'),
        cid: 'task-manager-logo'
      }
    ]
  });

  // console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
};

module.exports = sendEmail;