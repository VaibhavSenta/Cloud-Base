/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
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

  const { isDev } = require('../config/env.config');

  if (!smtpHost || !smtpUser || !smtpPass) {
    if (!isDev) {
      console.error('❌ SMTP credentials missing in production environment.');
      return false;
    }
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
    return false;
  }
};

/**
 * Send Welcome & Privacy Policy Disclosure Email
 * Sent from privacy@nothingbox.site.
 */
const sendPrivacyDisclosureEmail = async ({ email }) => {
  // Verify SMTP variables for privacy
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  
  // Use SMTP_PRIVACY_USER/PASS if set, otherwise default to master SMTP_USER/PASS
  const smtpUser = process.env.SMTP_PRIVACY_USER || process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PRIVACY_PASS || process.env.SMTP_PASS;
  
  // Sender email header
  const senderEmail = process.env.SMTP_PRIVACY_USER || 'privacy@nothingbox.site';

  const { isDev } = require('../config/env.config');

  console.log('\n============================================================');
  console.log('✉️  PRIVACY & DISCLOSURE EMAIL SENT');
  console.log(`To: ${email}`);
  console.log(`From: ${senderEmail}`);
  console.log('============================================================\n');

  if (!smtpHost || !smtpUser || !smtpPass) {
    if (!isDev) {
      console.error('❌ SMTP credentials missing in production environment.');
      return false;
    }
    console.log('ℹ️  SMTP credentials not set in .env. Logging to terminal above for dev testing.');
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort == 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: `"Cloud-Base Privacy" <${senderEmail}>`,
      to: email,
      subject: 'Security, Privacy, and Data Processing Disclosure - Cloud-Base',
      text: `Hello,\n\nWelcome to Cloud-Base. Legally, we disclose that we process your data securely. Your data is encrypted and never sold. For more information, please read our Privacy Policy.\n\nThank you,\nCloud-Base Team`,
      html: `
        <div style="background-color: #000000; padding: 2.5rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; text-align: left; border: 1px solid #1a1a1a; max-width: 500px; margin: 0 auto; border-radius: 16px;">
          <h2 style="font-size: 1.4rem; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 1.5rem; color: #ffffff; text-align: center; border-bottom: 1px solid #111111; padding-bottom: 1rem;">Data Privacy Disclosure</h2>
          <p style="color: #ffffff; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">Hello,</p>
          <p style="color: #888888; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1rem;">
            Thank you for creating an account on <strong>Cloud-Base</strong>. As part of our commitment to data security and transparency, we want to inform you about how your data is managed:
          </p>
          <ul style="color: #888888; font-size: 0.82rem; line-height: 1.6; padding-left: 1.2rem; margin-bottom: 1.5rem;">
            <li style="margin-bottom: 0.5rem;"><strong>End-to-End Encryption</strong>: Chat messages and secure vaults are encrypted using AES-256 and RSA key handshakes. Your keys never leave your device.</li>
            <li style="margin-bottom: 0.5rem;"><strong>Data Security</strong>: All network request payloads are protected using asymmetric RSA-OAEP / AES encryption.</li>
            <li style="margin-bottom: 0.5rem;"><strong>No Selling</strong>: Your data is exclusively yours. We do not sell or monetize personal information.</li>
          </ul>
          <p style="color: #888888; font-size: 0.85rem; line-height: 1.6; margin-bottom: 2rem;">
            By using our service, you agree to our Terms of Service and Privacy Policy. If you have any questions, contact us at this address.
          </p>
          <div style="border-top: 1px solid #111; padding-top: 1.5rem; color: #555555; font-size: 0.75rem; letter-spacing: 0.5px; text-align: center;">
            <strong>Cloud-Base Privacy Team</strong><br/>
            <a href="mailto:${senderEmail}" style="color: #0095f6; text-decoration: none;">${senderEmail}</a>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Privacy & data disclosure email sent successfully to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ SMTP Mail Transporter Error:', error.message);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPrivacyDisclosureEmail
};
