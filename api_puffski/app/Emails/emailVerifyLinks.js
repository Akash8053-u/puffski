const { sendEmail } = require("../controllers/smtpController"); // your SMTP helper
const constants = require("../utils/constants"); // messages etc.

async function sendUserVerificationEmail({ username1, email, verifyURL }) {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Hello ${username1},</h2>
        <p>You are one step away from verifying your account and joining the Puffski community.</p>
        <p>With this account you will be able to save your favorite business/strain profiles and leave reviews to help others.</p>
        <p>Click the link below to verify your account:</p>
        <p><a href="${verifyURL}" target="_blank" style="background:#3db370; color:#fff; padding:10px 20px; text-decoration:none; border-radius:5px;">Click and Verify</a></p>
        <p>Welcome to the Puffski community!</p>
        <img src="${
          process.env.Puffski_BACK_WEB_URL || "https://your-backend-url.com"
        }/images/unnamed.png" width="300px" />
      </div>
    `;

    const result = await sendEmail(email, "Email Verification", html);

    if (!result.success) {
      throw new Error("Failed to send verification email");
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function sendVerifyRequestEmail({ username, email }) {
  try {
    const html = `
      <div style="font-family: Arial; max-width:600px; margin:auto;">
        <h2>Hello Admin,</h2>

        <p><strong>${username}</strong> has sent a request to verify their account.</p>

        <h3>User Details:</h3>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Email:</strong> ${email}</p>

        <br/>
        <p>Regards,<br/>Puffski Support Team</p>
      </div>
    `;

    const result = await sendEmail(
      "admin@puffski.com",
      "Puffski Account Verify Request",
      html
    );

    if (!result.success) {
      throw new Error("Failed to send verification request email");
    }

    return { success: true };
  } catch (err) {
    console.error("Verify Request Email Error:", err);
    return { success: false, error: err.message };
  }
}

// services/lsrEmailService.js


const lsrEmailVerifyLink = async (options) => {
  try {
    const { verifyURL, username: email, firstName, city, roles, code } = options;

    let message = '';

    if (roles === 'STOREADMIN') {
      message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #df0b15;">Welcome to Local Showroom!</h2>
        <p>Dear ${firstName},</p>
        <p>Thank you for creating a Local Showroom Seller Account. We're thrilled to have you join our community of quality local businesses!</p>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #df0b15; margin-top: 0;">Your Local Showroom Benefits</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>A customizable Showroom URL for your customers to browse and shop</li>
            <li>Access to your seller dashboard to easily list products, track sales, and manage deliveries</li>
            <li>Instant order notifications for your staff via POS or the Local Showroom app</li>
            <li>90 minute delivery in ${city}</li>
            <li>Advertising and exposure as a quality local business</li>
          </ul>
        </div>
        <p>Your seller profile will need to be approved by our team before listing products. We'll contact you shortly.</p>
        <p style="font-style: italic; color: #df0b15;">Thank you for trusting Local Showroom to help grow your business!</p>
      </div>`;
    } else if (roles === 'U') {
      message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #df0b15;">Welcome to Local Showroom!</h2>
        <p>Dear ${firstName},</p>
        <p>Thank you for creating a Local Showroom Account. We're thrilled to have you join our community and support local Canadian businesses!</p>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #df0b15; margin-top: 0;">Your Local Showroom Benefits</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Browse and shop from a wide range of quality local Canadian businesses</li>
            <li>Access your user dashboard to track orders and manage your account</li>
            <li>Order tracking notifications in ${city}</li>
            <li>Secure online payment processing through Stripe</li>
          </ul>
        </div>
        <p>We're here to support you every step of the way. If you have any questions, our team is ready to help.</p>
        <p style="font-style: italic; color: #df0b15;">Thank you for choosing Local Showroom and supporting local Canadian businesses!</p>
      </div>`;
    }

    // Use the sendEmail function from smtpController
    const emailResult = await sendEmail(
      email,
      "Local Showroom account activated - Here's what you need to know",
      message
    );

    if (!emailResult.success) {
      throw new Error('Failed to send email');
    }

    return {
      success: true,
      code: 200,
      email,
      code,
      data: { message: constants.messages.ADDED_SUCCESSFULL },
    };
  } catch (error) {
    console.error('Error sending LSR verification email:', error);
    return {
      success: false,
      code: 500,
      error: { message: 'Failed to send verification email', details: error.message },
    };
  }
};



module.exports = {
  sendUserVerificationEmail,
  sendVerifyRequestEmail,
  lsrEmailVerifyLink,
};
