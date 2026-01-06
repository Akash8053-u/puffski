

const { sendEmail } = require("../controllers/smtpController");

async function sendQuestion({ firstName, lastName, email, question }) {
  if (!firstName || !lastName || !email || !question) {
    throw new Error("Payload missing");
  }

  const fullName = `${firstName} ${lastName}`;

  const html = `
    <div style="font-family: Arial; padding:20px;">
      <h2>New Question from ${fullName}</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Question:</strong> ${question}</p>
    </div>
  `;

  const result = await sendEmail(
    process.env.ADMIN_EMAIL, 
    "New Question Submitted", 
    html
  );

  if (!result.success) {
    throw new Error("Failed to send question email");
  }

  return result;
}


async function addStrainEmail({ product, producer }) {

    console.log(producer)
  const html = `
    <div style="background-color: #fff; width: 650px; margin:auto; font-family: Arial, sans-serif;">
      <div style="background-color:#2e2f2f; color:#fff; padding: 15px; text-align:center;">
        Your Legal <span style="color:rgb(255,96,84)">Canadian</span> Cannabis Directory
      </div>
      <div style="padding:15px; text-align:center; border-top:4px solid #6cac6b; border-bottom:4px solid #6cac6b;">
        <a href="${process.env.FRONTEND_URL || 'https://puffski.com'}">
          <img src="${process.env.FRONTEND_URL || 'https://puffski.com'}/assets/img/logo-img.png" style="width:184px;" />
        </a>
      </div>
      <div style="text-align:center; padding:0 20px;">
        <h1>Hello Admin,</h1>
        <p>A user wants to add a new strain.</p>
        <p><b>Product:</b> ${product}</p>
        <p><b>Producer:</b> ${producer}</p>
      </div>
    </div>
  `;

  const result = await sendEmail(
    "admin@puffski.com",           // To
    "Puffski community contact us",// Subject
    html,
    { bcc: process.env.BCC_EMAIL } // BCC
  );

  return result;
}


module.exports = {
  sendQuestion,addStrainEmail
};
