const { sendEmail } = require("../controllers/smtpController");

/**
 * Returns HTML for Contact Us email
 */
function contactUsEmail({ firstname, lastname, email, phone, website, company, description }) {
  const fullname = `${firstname} ${lastname}`;

  return `
  <div style="font-family: Arial, sans-serif; padding:20px;">
    <h2>Hello Admin,</h2>
    <p>${fullname} wants to connect with you.</p>
    <p>Look into ${fullname}'s query.</p>
    <p><strong>Name:</strong> ${fullname}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone || "N/A"}</p>
    <p><strong>Website:</strong> ${website || "N/A"}</p>
    <p><strong>Company:</strong> ${company || "N/A"}</p>
    <p><strong>Message:</strong> ${description || "N/A"}</p>
    <hr />
    <p>Regards,<br/>Puffski Support Team</p>
  </div>
  `;
}

/**
 * Sends Contact Us email using reusable SMTP controller
 */
async function sendContactUsEmail(data) {
  const html = await contactUsEmail(data);

  const result = await sendEmail("admin@puffski.com", "New Contact Request", html);

  if (!result.success) {
    throw new Error(result.error || "Failed to send contact email");
  }

  return result;
}


async function sendLsrContactUsEmail(data) {
  const { firstname, lastname, email, description, subject } = data;
  const fullname = `${firstname} ${lastname}`;

  const message = `
    Hello Admin,<br/><br/>
    ${fullname} wants to connect with you.<br/><br/>
    Look into ${fullname}'s query.<br/><br/>
    Name: ${fullname}<br/>
    Email: ${email}<br/>
    Message: ${description}<br/><br/>
    Regards,<br/>
    LocalShowRoom Support Team
  `;

  return await sendEmail("admin@puffski.com", subject || "New Contact Query", message);
}



async function sendFeedbackEmail({ regarding, feedback, rating }) {
  let message = `
  <div style="background-color: #fff; width: 650px; margin:auto; font-family: Arial, sans-serif;">
    <div style="background-color:#2e2f2f; color:#fff; padding: 15px; text-align:center;">
      Your Legal <span style="color:rgb(255,96,84)">Canadian</span> Cannabis Directory
    </div>
    <div style="padding:15px; text-align:center; border-top:4px solid rgb(108,175,107); border-bottom:4px solid rgb(108,175,107);">
      <a href="https://puffski.com">
        <img src="https://puffski.com/assets/img/logo-img.png" style="width:184px;" />
      </a>
    </div>
    <div style="text-align:center; padding:20px;">
      <h1 style="font-size: 26px;">Hello Admin,</h1>
      <p style="font-size: 16px;">There is a new feedback regarding:</p>
  `;

  regarding.forEach((item) => {
    message += `<p style="font-size: 16px;">${item}</p>`;
  });

  message += `
      <p style="font-size: 16px;">Feedback: ${feedback}</p>
      <p style="font-size: 16px;">Rating: ${rating}</p>
    </div>
  </div>
  `;

  const result = await sendEmail("admin@puffski.com", "Puffski Feedback", message);
  if (!result.success) {
    throw new Error("Failed to send feedback email");
  }

  return result;
}



async function emailChangePassword(password, user) {
  if (!user || !user.email) {
    return { success: false, error: "Email is required for sending password reset mail." };
  }

  const username =
    user.username ||
    user.fullName ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "User";

  const html = `
    Hello ${username},<br/><br/>
    Your password has been changed successfully.<br/><br/>
    <strong>New Password:</strong> ${password}<br/><br/>
    Regards,<br/>
    <strong>Puffski Support Team</strong>
  `;

  return await sendEmail(
    user.email,
    "Your Puffski Password Has Been Updated",
    html
  );
}





module.exports = { contactUsEmail, sendContactUsEmail,sendLsrContactUsEmail,sendFeedbackEmail,emailChangePassword };
