// src/mail/mail.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { MAIL_TRANSPORT } from '../transport/transport.module';

@Injectable()
export class MailService {
  constructor(
    @Inject(MAIL_TRANSPORT) private readonly transport: Transporter,
    private readonly config: ConfigService,
  ) {}

  async sendMail(opts: { to: string; subject: string; text?: string; html?: string; from?: string }) {
    const from = opts.from || this.config.get<string>('MAIL_FROM') || this.config.get<string>('MAIL_USER');
    const info = await this.transport.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    return info;
  }

  async sendOtpEmail(
    to: string,
    otp: string,
    expiresMinutes = 5,
    opts?: { template?: 'simple' | 'modern' | 'cta'; appName?: string; logoUrl?: string; attachLogoCid?: { path: string; cid: string } },
  ) {
    const template = opts?.template ?? 'modern';
    const appName = opts?.appName ?? this.config.get<string>('APP_NAME') ?? 'My App';

    const { html, text } = this.renderOtpTemplate(template, otp, expiresMinutes, appName, opts?.logoUrl, opts?.attachLogoCid?.cid);

    const attachments = opts?.attachLogoCid ? [{ filename: 'logo.png', path: opts.attachLogoCid.path, cid: opts.attachLogoCid.cid }] : undefined;

    return this.sendMail({
      to,
      subject: `${appName}: Your verification code`,
      text,
      html,
    //   attachments,
    });
  }

//   async sendOtpEmail(to: string, otp: string, expiresMinutes = 5) {
//     const subject = 'Your verification code';
//     const text = `Your OTP is ${otp}. It will expire in ${expiresMinutes} minutes.`;
//     const html = `<p>Your OTP is <strong>${otp}</strong>. It will expire in ${expiresMinutes} minutes.</p>`;
//     return this.sendMail({ to, subject, text, html });
//   }

  
  private renderOtpTemplate(
    template: 'simple' | 'modern' | 'cta' = 'modern',
    otp: string,
    expiresMinutes = 5,
    appName = 'My App',
    logoUrl?: string, // external url
    logoCid?: string // if you attach inline image with cid
  ): { html: string; text: string } {
    const escapedOtp = String(otp); // simple escaping (keep OTP numeric)
    const text = `Your OTP is ${escapedOtp}. It will expire in ${expiresMinutes} minutes.`;

    if (template === 'simple') {
      const html = `
        <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.4;color:#111;">
          <p>Hello,</p>
          <p>Your verification code for <strong>${appName}</strong> is:</p>
          <h2 style="background:#f5f5f5;padding:12px;border-radius:6px;display:inline-block">${escapedOtp}</h2>
          <p style="font-size:12px;color:#666;margin-top:8px">This code will expire in ${expiresMinutes} minutes.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
          <p style="font-size:12px;color:#999">If you didn't request this, please ignore this email.</p>
        </div>
      `;
      return { html, text };
    }

    if (template === 'cta') {
      // CTA template with button (for UX where user might click to verify)
      const verifyUrl = `https://your-app.example.com/verify?otp=${encodeURIComponent(escapedOtp)}`; // optional
      const logoImg = logoCid
        ? `<img src="cid:${logoCid}" alt="${appName}" style="height:48px;margin-bottom:12px;"/>`
        : logoUrl
        ? `<img src="${logoUrl}" alt="${appName}" style="height:48px;margin-bottom:12px;"/>`
        : '';

      const html = `
        <div style="font-family:Arial,Helvetica,sans-serif;color:#222;max-width:600px;padding:24px;border-radius:8px;border:1px solid #f0f0f0;">
          <div style="text-align:center">${logoImg}</div>
          <h3 style="margin:0 0 8px 0">Verify your ${appName} account</h3>
          <p style="margin:0 0 16px 0">Use the code below to verify your account. It expires in ${expiresMinutes} minutes.</p>
          <div style="text-align:center;margin:18px 0;">
            <span style="font-size:28px;letter-spacing:2px;background:#f7f7f7;padding:14px 22px;border-radius:8px;display:inline-block;">${escapedOtp}</span>
          </div>
          <div style="text-align:center;margin-top:8px">
            <a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;border-radius:6px;text-decoration:none;background:#2563eb;color:#fff;font-weight:600;">
              Verify Account
            </a>
          </div>
          <p style="color:#777;font-size:13px;margin-top:18px;">If the button doesn't work, copy & paste this link into your browser:<br><span style="word-break:break-all">${verifyUrl}</span></p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
          <p style="font-size:12px;color:#999">If you didn't request this, ignore this email.</p>
        </div>
      `;
      return { html, text };
    }

    // default modern card
    const logoImg = logoCid
      ? `<img src="cid:${logoCid}" alt="${appName}" style="height:40px;display:block;margin-bottom:14px;"/>`
      : logoUrl
      ? `<img src="${logoUrl}" alt="${appName}" style="height:40px;display:block;margin-bottom:14px;"/>`
      : '';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#1f2937; max-width:600px; margin:0 auto;">
        <div style="padding:28px;border-radius:8px;background:#ffffff;border:1px solid #f3f4f6;">
          <div style="text-align:left">${logoImg}</div>
          <h2 style="margin:6px 0 6px 0;font-size:20px;">Your ${appName} verification code</h2>
          <p style="margin:0 0 18px 0;color:#374151">Enter the code below to continue. It will expire in ${expiresMinutes} minutes.</p>
          <div style="padding:16px;background:#f9fafb;border-radius:6px;text-align:center;margin-bottom:18px;">
            <span style="font-size:30px;letter-spacing:3px;font-weight:700;color:#111">${escapedOtp}</span>
          </div>
          <p style="font-size:13px;color:#6b7280;margin-bottom:0">If you didn't request this code, you can safely ignore this email.</p>
        </div>
        <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:12px">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
      </div>
    `;
    return { html, text };
  }
}
