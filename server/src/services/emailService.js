import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Ensure the Resend API key is available
const resend = new Resend(process.env.RESEND_API);

/**
 * Generates the HTML template for the OTP email.
 * Matches the requested "Email Verification - Gmail Desktop View" styling.
 */
const getEmailTemplate = (otp, purpose) => {
  const isAccountVerification = purpose === 'ACCOUNT_VERIFICATION';
  const title = isAccountVerification ? 'Verify your email address' : 'Reset your password';
  const description = isAccountVerification
    ? 'To complete your registration with ReviseAI, please enter the verification code below.'
    : 'We received a request to reset your ReviseAI password. Please enter the verification code below to proceed.';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f9fafb;
          margin: 0;
          padding: 0;
          color: #111827;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }
        .header {
          background-color: #4f46e5; /* Indigo-600 */
          padding: 32px 24px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          letter-spacing: -0.5px;
        }
        .content {
          padding: 32px 24px;
          text-align: center;
        }
        .content p {
          font-size: 16px;
          line-height: 1.5;
          color: #4b5563;
          margin: 0 0 24px;
        }
        .otp-container {
          background-color: #eef2ff;
          border: 2px dashed #4f46e5;
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 24px;
        }
        .otp-code {
          font-family: 'Courier New', Courier, monospace;
          font-size: 48px;
          font-weight: 800;
          color: #4f46e5;
          letter-spacing: 12px;
          margin: 0;
        }
        .footer {
          padding: 24px;
          background-color: #f9fafb;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ReviseAI</h1>
        </div>
        <div class="content">
          <h2 style="font-size: 20px; font-weight: 600; margin-top: 0;">${title}</h2>
          <p>${description}</p>
          <div class="otp-container">
            <p class="otp-code">${otp}</p>
          </div>
          <p style="font-size: 14px; color: #9ca3af;">This code will expire in 5 minutes.</p>
        </div>
        <div class="footer">
          <p>If you didn't request this email, you can safely ignore it.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Sends an OTP verification email using Resend.
 * @param {string} to - The recipient's email address
 * @param {string} otp - The 6-digit OTP code
 * @param {string} purpose - 'ACCOUNT_VERIFICATION' or 'PASSWORD_RESET'
 */
export const sendVerificationEmail = async (to, otp, purpose) => {
  if (!process.env.RESEND_API) {
    console.warn('RESEND_API key is missing. Skipping actual email send. OTP is:', otp);
    return;
  }

  const subject = purpose === 'ACCOUNT_VERIFICATION' 
    ? 'Verify your ReviseAI account' 
    : 'Reset your ReviseAI password';

  // Using a fallback sender email if a verified domain is not set up on Resend yet.
  // Note: Resend requires a verified domain to send from custom addresses like <noreply@reviseai.com>.
  // We use onboarding@resend.dev as a fallback for testing if needed, but will try ReviseAI first.
  
  try {
    const data = await resend.emails.send({
      from: 'ReviseAI <onboarding@resend.dev>', // Use onboarding@resend.dev for testing without verified domain
      to,
      subject,
      html: getEmailTemplate(otp, purpose),
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    throw new Error('Failed to send verification email.');
  }
};
