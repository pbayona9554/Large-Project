const nodemailer = require("nodemailer");

async function sendVerificationEmail(toEmail, code) {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // or another SMTP service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Student Org App" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify Your Email",
    html: `<p>Your verification code is: <b>${code}</b></p>`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendVerificationEmail;