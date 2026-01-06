// services/communityService.js
const { sendEmail } = require('../controllers/smtpController');

async function sendCommunityConnectEmail({ username, email, phone, role, additionalNotes }) {
  try {
    let message = '';
    message +=
      '<div class="box mr-auto ml-auto" style="background-color: #fff; width: 650px;margin:auto">';
    message +=
      '<div class="bg-black" style="background-color:#2e2f2f;color:#fff;padding: 15px;text-align:center;">';
    message +=
      'Your Legal <span style="color:rgb(255,96,84)">Canadian</span> Cannabis Directory';
    message += '</div>';
    message += '<div class="logoimg"';
    message +=
      ' style="padding:15px;text-align:center;border-top:solid;border-bottom:solid;border-color:rgb(108,175,107);border-width: 4px;">';
    message +=
      `<a href="https://puffski.com"><img src="${process.env.Puffski_FRONT_WEB_URL}assets/img/logo-img.png" style="width:184px;" /></a>`;
    message += '</div>';

    message += '<div style="text-align:center;padding:0 20px;">';
    message += '<h1 style="font-size: 26px;">Hello Admin,</h1>';
    message +=
      `<p style="font-size: 16px;">A user whose email is <b>${email}</b> wants to register as a community account.</p>`;
    message += '<p style="font-size: 16px;">User Detail :</p>';
    message += `<p style="font-size: 16px;">Email: ${email}</p>`;
    message += `<p style="font-size: 16px;">Username: ${username}</p>`;
    message += `<p style="font-size: 16px;">Phone number: ${phone}</p>`;
    message += `<p style="font-size: 16px;">Role: ${role}</p>`;

    if (additionalNotes) {
      message += `<p style="font-size: 16px;">Additional Note: ${additionalNotes}</p>`;
    }

    message += '</div></div>';

    // Use centralized SMTP sendEmail function
    const result = await sendEmail('admin@puffski.com', 'Puffski Community Connect', message);

    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }

    return { success: true, message: 'Email sent to admin successfully.' };
  } catch (err) {
    console.error('Community Connect Email Error:', err);
    throw new Error('Failed to send community connect email');
  }
}

async function communityContactUSService({ name, email, message: userMessage }) {
  // HTML email template
  const html = `
    <div class="box mr-auto ml-auto" style="background-color: #fff; width: 650px;margin:auto">
      <div class="bg-black" style="background-color:#2e2f2f;color:#fff;padding: 15px;text-align:center;">
        Your Legal <span style="color:rgb(255,96,84)">Canadian</span> Cannabis Directory
      </div>
      <div class="logoimg" style="padding:15px;text-align:center;border-top:solid;border-bottom:solid;border-color:rgb(108,175,107);border-width: 4px;">
        <a href="https://puffski.com">
          <img src="${process.env.Puffski_FRONT_WEB_URL}assets/img/logo-img.png" style="width:184px;" />
        </a>
      </div>
      <div style="text-align:center;padding:0 20px;">
        <h1 style="font-size: 26px;">Hello Admin,</h1>
        <p style="font-size: 16px;">A user whose name is <b>${name}</b> wants to connect with you.</p>
        <p style="font-size: 16px;">Email: ${email}</p>
        <p style="font-size: 16px;">Message: ${userMessage}</p>
      </div>
    </div>
  `;

  // Send email
  return await sendEmail('admin@puffski.com', 'Puffski community contact us', html);
}



module.exports = {
  sendCommunityConnectEmail,communityContactUSService
};
