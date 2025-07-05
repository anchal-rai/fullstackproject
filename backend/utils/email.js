const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
const logger = require('./logger');

class Email {
  constructor(user, data = {}) {
    this.to = user.email;
    this.name = user.name;
    this.from = `HomeService Pro <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;
    this.data = data;
  }

  // Create a transport object
  newTransport() {
    // For production
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // Only for development with self-signed certificates
      }
    });
  }

  // Send the actual email
  async send(template, subject) {
    try {
      // 1) Render HTML based on a pug template
      let html;
      try {
        html = pug.renderFile(
          `${__dirname}/../views/emails/${template}.pug`,
          {
            name: this.name,
            ...this.data,
            subject,
          }
        );
      } catch (err) {
        console.error('Error rendering email template:', err);
        // Fallback to simple HTML if template rendering fails
        html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <h2>${subject}</h2>
            <div>${this.data.message || ''}</div>
            ${this.data.otp ? `<p>Your OTP is: <strong>${this.data.otp}</strong></p>` : ''}
            ${this.data.url ? `<p><a href="${this.data.url}" style="display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Click Here</a></p>` : ''}
            <p style="margin-top: 20px; color: #666; font-size: 0.9em;">If you didn't request this, please ignore this email.</p>
          </div>
        `;
      }
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: convert(html, { wordwrap: 80 }),
      };

      // 3) Create a transport and send email
      await this.newTransport().sendMail(mailOptions);
    } catch (error) {
      logger.error(`Error sending email: ${error.message}`);
      throw error;
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to HomeService Pro!');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Your Password Reset OTP');
  }

  async sendOTP() {
    await this.send('otp', 'Your One-Time Password (OTP)');
  }

  async sendPasswordChanged() {
    await this.send('passwordChanged', 'Your Password Has Been Changed');
  }
};

// Simple email sending function for basic use
const sendEmail = async (options) => {
  try {
    // Create a test account if in development
    let testAccount;
    if (process.env.NODE_ENV === 'development') {
      testAccount = await nodemailer.createTestAccount();
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || testAccount?.smtp?.host,
      port: process.env.SMTP_PORT || testAccount?.smtp?.port,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || testAccount?.user,
        pass: process.env.SMTP_PASSWORD || testAccount?.pass,
      },
      tls: {
        rejectUnauthorized: false // Only for development with self-signed certificates
      }
    });

    // Define the email options
    const mailOptions = {
      from: process.env.SMTP_FROM || `HomeService Pro <${process.env.SMTP_USER || testAccount?.user}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || undefined
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (err) {
    console.error('Error sending email:', err);
    throw new Error('There was an error sending the email. Please try again later.');
  }
};

module.exports = { sendEmail, Email };
