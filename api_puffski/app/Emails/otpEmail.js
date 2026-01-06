module.exports = function otpTemplate({ firstName, otp }) {
  return `
    <div style="text-align:center;">
      <p>Hello <strong>${firstName}</strong>,</p>
      
      <p>
        We heard you forgot your password — don’t worry, it happens to the best of us.<br>
        Here is your OTP to reset your password:
      </p>

      <h2 style="font-size: 28px; letter-spacing: 3px;">${otp}</h2>

      <div style="
        padding:15px;
        text-align: justify;
        margin:20px auto;
        border-top:2px solid #0c8040;
        border-bottom:2px solid #0c8040;
      ">
        <b>Local Showroom</b> is an innovative Canadian cannabis tech company 
        built by cannabis enthusiasts.  
        Our <b>Website & App</b> provide <b>on-demand delivery</b> and access 
        to better cannabis experiences.  
        We help you find <b>better cannabis products</b> for your needs.
      </div>
    </div>
  `;
};
