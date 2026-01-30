const nodemailer = require('nodemailer');

// Email service for sending notifications
class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  // Initialize email transporter
  async initialize() {
    try {
      // Use environment-specific email config
      // For development: Use ethereal (test) or Gmail (production)
      if (process.env.NODE_ENV === 'production') {
        // Production: Gmail or SendGrid
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
      } else {
        // Development: Ethereal (test email service)
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        console.log('📧 Ethereal test account created');
        console.log(`   User: ${testAccount.user}`);
        console.log(`   Pass: ${testAccount.pass}`);
      }

      this.initialized = true;
      console.log('✅ Email service initialized');
      return true;
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      return false;
    }
  }

  // Send contact form email
  async sendContactEmail(contactData) {
    if (!this.initialized) await this.initialize();

    try {
      const { name, email, subject, message, phone } = contactData;

      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@portfolio.com',
        to: 'parsaharshith@gmail.com',
        subject: `New Contact: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
            <h2 style="color: #2563EB; margin-bottom: 20px;">📩 New Contact Form Submission</h2>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              ${phone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
              <p style="margin: 8px 0;"><strong>Subject:</strong> ${subject}</p>
            </div>

            <div style="background: #fafafa; padding: 15px; border-left: 4px solid #2563EB; border-radius: 6px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #0F172A;">Message:</h3>
              <p style="margin: 0; white-space: pre-wrap; color: #475569;">${message}</p>
            </div>

            <div style="border-top: 1px solid #e0e0e0; padding-top: 15px; font-size: 12px; color: #999;">
              <p>Submitted at: ${new Date().toLocaleString()}</p>
              <p>Timestamp: ${new Date().toISOString()}</p>
            </div>
          </div>
        `,
        text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
Subject: ${subject}

Message:
${message}

---
Submitted: ${new Date().toLocaleString()}
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`📧 Contact email sent: ${info.messageId}`);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`   Preview: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return {
        success: true,
        messageId: info.messageId,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Failed to send contact email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send admin alert for new contact
  async sendAdminAlert(contactData) {
    if (!this.initialized) await this.initialize();

    try {
      const { name, email } = contactData;

      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@portfolio.com',
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: '🔔 New Portfolio Contact Alert',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
            <h2 style="color: #f59e0b; margin-bottom: 16px;">🔔 New Contact Submission</h2>
            <p><strong>${name}</strong> just submitted a contact form.</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin-top: 20px;">
              <a href="${process.env.ADMIN_URL || 'http://localhost:5000'}/admin-parsa-7734" 
                 style="background: #2563EB; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">
                View in Admin
              </a>
            </p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✉️ Admin alert sent: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send admin alert:', error.message);
      return false;
    }
  }

  // Send confirmation email to visitor
  async sendConfirmationEmail(visitorEmail, visitorName) {
    if (!this.initialized) await this.initialize();

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@portfolio.com',
        to: visitorEmail,
        subject: 'Thanks for reaching out!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10B981;">✅ Thank You, ${visitorName}!</h2>
            <p>I've received your message and will get back to you as soon as possible.</p>
            
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
              <p style="margin: 0; color: #166534;">
                Typically, I respond within 24-48 hours. Keep an eye on your inbox!
              </p>
            </div>

            <p>In the meantime, feel free to connect with me on:</p>
            <ul style="list-style: none; padding: 0;">
              <li>💼 <a href="https://linkedin.com/in/parsa" style="color: #2563EB;">LinkedIn</a></li>
              <li>🐙 <a href="https://github.com/parsa" style="color: #2563EB;">GitHub</a></li>
              <li>🐦 <a href="https://twitter.com/parsa" style="color: #2563EB;">Twitter</a></li>
            </ul>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #999;">
              — Parsa<br>
              Full Stack Developer & Designer
            </p>
          </div>
        `,
        text: `
Hi ${visitorName},

Thank you for reaching out! I've received your message and will get back to you as soon as possible.

Typically, I respond within 24-48 hours.

Best regards,
Parsa
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✉️ Confirmation email sent to ${visitorEmail}`);
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('❌ Failed to send confirmation email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send analytics summary to admin (daily/weekly)
  async sendAnalyticsSummary(summary) {
    if (!this.initialized) await this.initialize();

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@portfolio.com',
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `📊 Portfolio Analytics Summary - ${new Date().toLocaleDateString()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563EB; margin-bottom: 20px;">📊 Analytics Summary</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
              <div style="background: #e0f2fe; padding: 15px; border-radius: 8px;">
                <div style="font-size: 12px; color: #0369a1;">Unique Visitors</div>
                <div style="font-size: 28px; font-weight: bold; color: #0c4a6e;">${summary.uniqueVisitors || 0}</div>
              </div>
              <div style="background: #f0fdf4; padding: 15px; border-radius: 8px;">
                <div style="font-size: 12px; color: #166534;">Page Views</div>
                <div style="font-size: 28px; font-weight: bold; color: #15803d;">${summary.pageViews || 0}</div>
              </div>
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px;">
                <div style="font-size: 12px; color: #92400e;">Resume Downloads</div>
                <div style="font-size: 28px; font-weight: bold; color: #b45309;">${summary.resumeDownloads || 0}</div>
              </div>
              <div style="background: #fce7f3; padding: 15px; border-radius: 8px;">
                <div style="font-size: 12px; color: #831843;">CV Downloads</div>
                <div style="font-size: 28px; font-weight: bold; color: #be185d;">${summary.cvDownloads || 0}</div>
              </div>
            </div>

            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin-top: 0;">Top Pages:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                ${(summary.topPages || []).map(p => `<li>${p.page} - ${p.count} views</li>`).join('')}
              </ul>
            </div>

            <p style="text-align: center; margin-top: 30px;">
              <a href="${process.env.ADMIN_URL || 'http://localhost:5000'}/admin-parsa-7734" 
                 style="background: #2563EB; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
                View Full Dashboard
              </a>
            </p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📊 Analytics summary sent: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send analytics summary:', error.message);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
