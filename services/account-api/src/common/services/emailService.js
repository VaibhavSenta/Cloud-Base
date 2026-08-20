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
      from: `"Nothingbox Support" <${smtpUser}>`,
      to: email,
      subject: isOtp ? 'Your Login Verification Code - Nothingbox' : 'Verify your Nothingbox Account Email',
      text: isOtp 
        ? `Your Nothingbox login verification code is: ${otpCode}. Valid for 5 minutes.`
        : `Hello, please verify your account email by clicking this link: ${verificationLink}`,
      html: isOtp ? `
        <div style="background-color: #050505; padding: 3rem 1.5rem; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; text-align: center;">
          <div style="background-color: #000000; padding: 2.5rem 2rem; border: 1px solid #1f1f23; max-width: 460px; margin: 0 auto; border-radius: 2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
            <div style="font-size: 1.5rem; font-weight: 900; letter-spacing: -0.04em; color: #ffffff; margin-bottom: 1.5rem;">Nothingbox</div>
            <h2 style="font-size: 1.25rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 0.5rem; color: #ffffff;">Login Verification</h2>
            <p style="color: #9898a0; font-size: 0.88rem; line-height: 1.5; margin-bottom: 2rem;">Use the 6-digit verification code below to complete your login. Valid for 5 minutes.</p>
            <div style="display: inline-block; background-color: #0d0d10; border: 1px solid #222228; color: #0095f6; letter-spacing: 6px; font-weight: 900; font-size: 2rem; padding: 1rem 2.5rem; border-radius: 1rem; margin-bottom: 2rem;">${otpCode}</div>
            <div style="border-top: 1px solid #18181c; padding-top: 1.5rem; color: #66666e; font-size: 0.78rem; letter-spacing: -0.01em;">
              If you did not request this code, you can safely ignore this email.<br/>
              <strong style="color: #888892; display: inline-block; margin-top: 0.5rem;">Nothingbox Security Team</strong>
            </div>
          </div>
        </div>
      ` : `
        <div style="background-color: #050505; padding: 3rem 1.5rem; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; text-align: center;">
          <div style="background-color: #000000; padding: 2.5rem 2rem; border: 1px solid #1f1f23; max-width: 460px; margin: 0 auto; border-radius: 2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
            <div style="font-size: 1.5rem; font-weight: 900; letter-spacing: -0.04em; color: #ffffff; margin-bottom: 1.5rem;">Nothingbox</div>
            <h2 style="font-size: 1.25rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 0.5rem; color: #ffffff;">Confirm Your Email</h2>
            <p style="color: #9898a0; font-size: 0.88rem; line-height: 1.6; margin-bottom: 2rem;">Click the button below to verify your email address and activate your Nothingbox account.</p>
            <a href="${verificationLink}" style="display: inline-block; background-color: #0095f6; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 0.9rem; padding: 0.9rem 2.2rem; border-radius: 2rem; transition: opacity 0.2s; box-shadow: 0 4px 14px rgba(0,149,246,0.3);">Verify Email Address</a>
            <div style="margin-top: 2.5rem; border-top: 1px solid #18181c; padding-top: 1.5rem; color: #66666e; font-size: 0.78rem; letter-spacing: -0.01em;">
              Thank you,<br/>
              <strong style="color: #888892; display: inline-block; margin-top: 0.5rem;">Nothingbox Team</strong>
            </div>
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
      from: `"Nothingbox Privacy" <${senderEmail}>`,
      to: email,
      subject: 'Security, Privacy, and Data Processing Disclosure - Nothingbox',
      text: `Hello,\n\nWelcome to Nothingbox. Legally, we disclose that we process your data securely. Your data is encrypted and never sold. For more information, please read our Privacy Policy.\n\nThank you,\nNothingbox Team`,
      html: `
        <div style="background-color: #050505; padding: 3rem 1.5rem; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; text-align: left;">
          <div style="background-color: #000000; padding: 2.5rem 2rem; border: 1px solid #1f1f23; max-width: 460px; margin: 0 auto; border-radius: 2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
            <div style="font-size: 1.5rem; font-weight: 900; letter-spacing: -0.04em; color: #ffffff; margin-bottom: 1.5rem; text-align: center;">Nothingbox</div>
            <h2 style="font-size: 1.2rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 1.5rem; color: #ffffff; text-align: center; border-bottom: 1px solid #18181c; padding-bottom: 1rem;">Data Privacy Disclosure</h2>
            <p style="color: #ffffff; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">Hello,</p>
            <p style="color: #9898a0; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1rem;">
              Thank you for creating an account on <strong>Nothingbox</strong>. As part of our commitment to data security and transparency, we want to inform you about how your data is managed:
            </p>
            <ul style="color: #9898a0; font-size: 0.82rem; line-height: 1.6; padding-left: 1.2rem; margin-bottom: 1.5rem;">
              <li style="margin-bottom: 0.5rem;"><strong style="color: #e1e1e6;">End-to-End Encryption</strong>: Chat messages and secure vaults are encrypted using AES-256 and RSA key handshakes. Your keys never leave your device.</li>
              <li style="margin-bottom: 0.5rem;"><strong style="color: #e1e1e6;">Data Security</strong>: All network request payloads are protected using asymmetric RSA-OAEP / AES encryption.</li>
              <li style="margin-bottom: 0.5rem;"><strong style="color: #e1e1e6;">No Selling</strong>: Your data is exclusively yours. We do not sell or monetize personal information.</li>
            </ul>
            <p style="color: #9898a0; font-size: 0.85rem; line-height: 1.6; margin-bottom: 2rem;">
              By using our service, you agree to our Terms of Service and Privacy Policy.
            </p>
            <div style="border-top: 1px solid #18181c; padding-top: 1.5rem; color: #66666e; font-size: 0.78rem; letter-spacing: -0.01em; text-align: center;">
              <strong style="color: #888892;">Nothingbox Privacy Team</strong><br/>
              <a href="mailto:${senderEmail}" style="color: #0095f6; text-decoration: none; display: inline-block; margin-top: 0.3rem;">${senderEmail}</a>
            </div>
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
