// controllers/smtpController.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",  // correct host
  port: 587,
  secure: false, // false for TLS
  auth: {
    user: process.env.SMTP_USER,      
    pass: process.env.SMTP_Password,  
  },
});

async function sendEmail(to, subject, html, options = {}) {
  try {
    await transporter.sendMail({
      from: `Puffski <${process.env.SMTP_EMAIL}>`,
      to:"demo@yopmail.com",
      subject,
      html,
    //  ...options, // allows bcc or cc
    });

    console.log(`Email sent to ${to}`);
    return { success: true };
  } catch (err) {
    console.error("Email Error:", err);
    return { success: false, error: err };
  }
}




module.exports = { sendEmail };
