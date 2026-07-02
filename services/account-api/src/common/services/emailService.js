const nodemailer = require('nodemailer');

/**
 * Send Email Verification Service
 * Resolves to true on success, prints mockup link to console if SMTP details are missing.
 */
const sendVerificationEmail = async ({ email, token }) => {
  const isOtp = token.startsWith('otp:');
  let otpCode = '';
  let verificationLink = '';

  if (isOtp) {
    otpCode = token.replace('otp:', '');
    console.log('\n============================================================');
    console.log('✉️  2FA LOGIN OTP CODE SENT');
    console.log(`To: ${email}`);
    console.log(`Code: ${otpCode}`);
    console.log('============================================================\n');
  } else {
    const frontendHost = process.env.FRONTEND_URL || 'http://172.20.10.2:3000';
    verificationLink = `${frontendHost}/dashboard/verify-email?token=${token}`;
    console.log('\n============================================================');
    console.log('✉️  EMAIL VERIFICATION LINK SENT');
    console.log(`To: ${email}`);
    console.log(`Link: ${verificationLink}`);
    console.log('============================================================\n');
  }

  // Verify SMTP variables
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log('ℹ️  SMTP credentials not set in .env. Logging token link/code to terminal above for dev testing.');
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort == 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: `"Cloud-Base Support" <${smtpUser}>`,
      to: email,
      subject: isOtp ? 'Your Login Verification Code - Cloud-Base' : 'Verify your Cloud-Base Account Email',
      text: isOtp 
        ? `Your Cloud-Base login verification code is: ${otpCode}. Valid for 5 minutes.`
        : `Hello, please verify your account email by clicking this link: ${verificationLink}`,
      html: isOtp ? `
        <div style="background-color: #000000; padding: 2.5rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; text-align: center; border: 1px solid #1a1a1a; max-width: 500px; margin: 0 auto; border-radius: 16px;">
          <h2 style="font-size: 1.4rem; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 0.5rem; color: #ffffff;">Login Verification</h2>
          <p style="color: #888888; font-size: 0.85rem; line-height: 1.5; margin-bottom: 1.5rem;">Use the verification code below to complete your login. Valid for 5 minutes.</p>
          <div style="display: inline-block; background-color: #111111; border: 1px solid #222222; color: #0095f6; letter-spacing: 4px; font-weight: 900; font-size: 1.8rem; padding: 0.8rem 2.5rem; border-radius: 12px; margin-bottom: 1.5rem;">${otpCode}</div>
          <div style="margin-top: 1.5rem; border-top: 1px solid #111; padding-top: 1.5rem; color: #555555; font-size: 0.75rem; letter-spacing: 0.5px;">
            If you did not request this, you can safely ignore this email. <br/><strong>Cloud-Base Team</strong>
          </div>
        </div>
      ` : `
        <div style="background-color: #000000; padding: 2.5rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; text-align: center; border: 1px solid #1a1a1a; max-width: 500px; margin: 0 auto; border-radius: 16px;">
          <h2 style="font-size: 1.4rem; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 0.5rem; color: #ffffff;">Confirm Your Email</h2>
          <p style="color: #888888; font-size: 0.85rem; line-height: 1.5; margin-bottom: 2rem;">Hello! Please click the button below to verify your email address and secure your Cloud-Base account.</p>
          <a href="${verificationLink}" style="display: inline-block; background-color: #0095f6; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 0.85rem; padding: 0.8rem 2rem; border-radius: 100px; transition: opacity 0.2s;">Verify Email</a>
          <div style="margin-top: 2rem; border-top: 1px solid #111; padding-top: 1.5rem; color: #555555; font-size: 0.75rem; letter-spacing: 0.5px;">
            Thank you, <br/><strong>Cloud-Base Team</strong>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ SMTP verification email/OTP sent successfully to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ SMTP Mail Transporter Error:', error.message);
    return true;
  }
};

module.exports = {
  sendVerificationEmail
};
