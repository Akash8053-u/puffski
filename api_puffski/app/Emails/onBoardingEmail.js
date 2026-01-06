// Emails/onBoardingEmail.js
const { sendEmail } = require("../controllers/smtpController");
function onboardingVerificationEmail({ username1, email, verifyURL }) {
  return `
  <div style="font-family: Arial; padding:20px;">
    <div style="background:#2e2f2f; color:#fff; padding:15px; text-align:center;">
      On Demand Delivery From <span style="color:#ff6054">Legal</span> Cannabis Stores
    </div>

    <div style="text-align:center; padding:20px;">
      <img src="https://puffski.com/assets/img/logo-img.png" width="180" />
    </div>

    <h2 style="text-align:center;">Hello ${username1}</h2>

    <p>Your Puffski account has been created.</p>

    <p style="text-align:center">
      <a href="${verifyURL}"
         style="padding:12px 25px; background:#3db370; color:#fff; text-decoration:none; border-radius:6px;">
         Click to Verify Your Account
      </a>
    </p>

    <p>If the button does not work, use this link:</p>
    <p>${verifyURL}</p>

    <hr />
    <p style="text-align:center;font-size:14px;">
      For support: <a href="mailto:admin@puffski.com">admin@puffski.com</a>
    </p>
  </div>
  `;
}

// utils/emailService.js


/**
 * Send password change email using reusable SMTP controller
 * @param {string} password - new password
 * @param {object} options - { username, email }
 */
async function emailChangePassword(password, options) {
  const { email, username } = options;

  const html = `
    <div style="font-family: Arial; padding:20px;">
      <h3>Hello ${username}</h3>
      <p>Your password has been changed successfully.</p>
      <p><b>New Password:</b> ${password}</p>
      <p>Regards,<br/>Puffski Support Team</p>
    </div>
  `;

  const result = await sendEmail(email, "Puffski Password Reset", html);

  if (!result.success) {
    throw new Error("Failed to send password change email");
  }

  return result;
}






module.exports = {
  onboardingVerificationEmail,emailChangePassword
};
