import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string | undefined;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>(
      'RESEND_FROM_EMAIL',
      'onboarding@resend.dev',
    );
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.warn(
        `RESEND_API_KEY is not defined. Email to ${to} was not sent. Subject: ${subject}`,
      );
      // Return true in development to allow flows to proceed without breaking
      return this.configService.get<string>('NODE_ENV') !== 'production';
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [to],
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Failed to send email via Resend: ${response.status} - ${errorText}`,
        );
        return false;
      }

      this.logger.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(
        'Error occurred while sending email via Resend',
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }
}
