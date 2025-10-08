import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Email service configuration error:', error);
      } else {
        this.logger.log('Email service is ready to send messages');
      }
    });
  }

  async sendReplyEmail(options: {
    to: string;
    subject: string;
    message: string;
    senderName: string;
    senderEmail: string;
    requestId: string;
    clientName: string;
  }) {
    try {
      const htmlContent = this.generateReplyEmailTemplate(options);

      const mailOptions = {
        from: `"${options.senderName} - Granite Tech" <${process.env.GMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: htmlContent,
        replyTo: options.senderEmail,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Reply email sent successfully to ${options.to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error('Failed to send reply email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendProjectRequestNotification(options: {
    to: string;
    subject: string;
    requestData: any;
  }) {
    try {
      const htmlContent = this.generateRequestNotificationTemplate(options.requestData);

      const mailOptions = {
        from: `"Granite Tech System" <${process.env.GMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Request notification sent successfully to ${options.to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error('Failed to send request notification:', error);
      return { success: false, error: error.message };
    }
  }

  private generateReplyEmailTemplate(options: {
    message: string;
    senderName: string;
    clientName: string;
    requestId: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reply from Granite Tech</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1f2937, #374151); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🏗️ Granite Tech</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Professional Development Services</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border-left: 4px solid #3b82f6;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${options.clientName},</h2>
          
          <p style="color: #4b5563;">You have received a reply regarding your project request:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 3px solid #10b981; margin: 20px 0;">
            <p style="margin: 0; white-space: pre-line;">${options.message}</p>
          </div>
          
          <div style="margin: 30px 0;">
            <p style="color: #6b7280; margin: 5px 0;"><strong>From:</strong> ${options.senderName}</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>Request ID:</strong> #${options.requestId.slice(-8)}</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/track-request?id=${options.requestId}" 
               style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              View Full Conversation
            </a>
          </div>
          
          <hr style="border: none; height: 1px; background: #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            <strong>Granite Tech</strong><br>
            Professional Web & Software Development<br>
            📧 walter@granitetech.com | 🌐 www.granitetech.com
          </p>
          
          <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
            This email was sent in response to your project request. If you did not expect this message, please contact us immediately.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  private generateRequestNotificationTemplate(requestData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Project Request - Granite Tech</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1f2937, #374151); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🏗️ Granite Tech</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">New Project Request Received</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border-left: 4px solid #10b981;">
          <h2 style="color: #1f2937; margin-top: 0;">Request Details</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Client:</strong> ${requestData.fullName}</p>
            <p><strong>Email:</strong> ${requestData.email}</p>
            <p><strong>Company:</strong> ${requestData.company || 'Not specified'}</p>
            <p><strong>Service:</strong> ${requestData.serviceInterested}</p>
            <p><strong>Budget:</strong> ${requestData.projectBudget}</p>
            <p><strong>Timeline:</strong> ${requestData.projectTimeline}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Project Description</h3>
            <p style="white-space: pre-line;">${requestData.description}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard/requests" 
               style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Manage Request
            </a>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}