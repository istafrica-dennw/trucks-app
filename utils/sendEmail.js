const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email verification
const sendEmailVerification = async (email, token) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email - Truck Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Thank you for registering with our Truck Management System!</p>
          <p>Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Email verification sent successfully');
  } catch (error) {
    console.error('Error sending email verification:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordReset = async (email, token) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset - Truck Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You have requested to reset your password for the Truck Management System.</p>
          <p>Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="color: #666; font-size: 14px;">This link will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this password reset, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send user invitation email
const sendUserInvitation = async (email, token, role) => {
  try {
    const transporter = createTransporter();
    
    const invitationUrl = `${process.env.FRONTEND_URL}/invite/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Invitation to Truck Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">You're Invited!</h2>
          <p>You have been invited to join the Truck Management System as a <strong>${role}</strong>.</p>
          <p>Please click the button below to accept the invitation and create your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" 
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${invitationUrl}</p>
          <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('User invitation sent successfully');
  } catch (error) {
    console.error('Error sending user invitation:', error);
    throw error;
  }
};

module.exports = {
  sendEmailVerification,
  sendPasswordReset,
  sendUserInvitation
};