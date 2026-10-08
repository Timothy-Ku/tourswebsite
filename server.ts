import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Helper to construct SMTP transporter
function getTransporter(customConfig?: {
  host?: string;
  port?: number | string;
  secure?: boolean;
  user?: string;
  pass?: string;
}) {
  const host = customConfig?.host || process.env.SMTP_HOST;
  const port = Number(customConfig?.port || process.env.SMTP_PORT || 587);
  const secure = customConfig?.secure !== undefined
    ? customConfig.secure
    : (process.env.SMTP_SECURE === 'true' || port === 465);
  const user = customConfig?.user || process.env.SMTP_USER;
  const pass = customConfig?.pass || process.env.SMTP_PASS;

  if (host && user && pass) {
    return {
      type: 'smtp' as const,
      host,
      port,
      user,
      transporter: nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      }),
    };
  }

  // Fallback sandbox transport
  return {
    type: 'sandbox' as const,
    host: host || 'smtp.sandbox.local',
    port,
    user: user || 'sandbox@kagztours.com',
    transporter: nodemailer.createTransport({
      jsonTransport: true,
    }),
  };
}

// SMTP Verification Endpoint
app.post('/api/verify-smtp', async (req, res) => {
  try {
    const { host, port, secure, user, pass } = req.body || {};
    const config = getTransporter({ host, port, secure, user, pass });

    if (config.type === 'sandbox') {
      res.json({
        success: true,
        mode: 'sandbox',
        message: 'SMTP Sandbox Active. Provide host, port, username, and password/app-password to test live SMTP connection.',
        config: {
          host: config.host,
          port: config.port,
          user: config.user,
        },
      });
      return;
    }

    await config.transporter.verify();
    res.json({
      success: true,
      mode: 'live_smtp',
      message: `Successfully connected & authenticated with SMTP server (${config.host}:${config.port})!`,
      config: {
        host: config.host,
        port: config.port,
        user: config.user,
      },
    });
  } catch (error: any) {
    console.error('SMTP Verification Error:', error);
    res.status(400).json({
      success: false,
      error: error?.message || 'Failed to authenticate with SMTP server.',
    });
  }
});

// Send Direct Email via SMTP Endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const {
      recipientEmail,
      recipientName,
      senderEmail,
      senderName,
      subject,
      body,
      smtpConfig,
    } = req.body || {};

    if (!recipientEmail || !subject || !body) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameters: recipientEmail, subject, body.',
      });
      return;
    }

    const { type, host, port, user, transporter } = getTransporter(smtpConfig);

    const fromAddress = smtpConfig?.fromEmail || process.env.SMTP_FROM_EMAIL || user || 'info@kagztours.com';
    const fromName = smtpConfig?.fromName || process.env.SMTP_FROM_NAME || senderName || 'KAGZ Safari Concierge';

    const mailOptions = {
      from: `"${fromName}" <${fromAddress}>`,
      to: recipientName ? `"${recipientName}" <${recipientEmail}>` : recipientEmail,
      replyTo: senderEmail || fromAddress,
      subject,
      text: body,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; border: 1px solid #EADCC9; background-color: #FAF7F2; padding: 32px;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #C5A880;">
            <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #C5A880; font-weight: bold; font-family: monospace;">KAGZ TOURS & SAFARIS</span>
            <h1 style="font-size: 22px; color: #1C2421; margin: 8px 0 4px 0;">Bespoke Safari Expedition</h1>
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #78716C;">Direct Client Dispatch</span>
          </div>
          <div style="padding: 24px 0; font-size: 14px; line-height: 1.8; color: #292524; white-space: pre-line;">
${body}
          </div>
          <div style="border-top: 1px solid #EADCC9; padding-top: 20px; text-align: center; font-size: 11px; color: #78716C; font-family: sans-serif;">
            <strong style="color: #1C2421;">KAGZ Travel & Safaris</strong> &bull; Luxury Travel Concierge<br/>
            Nairobi &bull; Arusha &bull; Kigali &bull; Zanzibar &bull; <a href="https://kagztours.com" style="color: #C5A880; text-decoration: none;">kagztours.com</a>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    const generatedMessageId = info.messageId || `smtp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    console.log(`[SMTP] Email sent to ${recipientEmail} via ${type} (${host}:${port}) - MessageID: ${generatedMessageId}`);

    res.json({
      success: true,
      mode: type === 'smtp' ? 'live_smtp' : 'sandbox',
      messageId: generatedMessageId,
      accepted: info.accepted || [recipientEmail],
      response: type === 'smtp' ? (info.response || '250 2.0.0 OK Direct SMTP Delivery') : '250 2.0.0 OK (SMTP Sandbox Mode)',
      deliveryTime: new Date().toISOString(),
      smtpServer: `${host}:${port}`,
      from: `"${fromName}" <${fromAddress}>`,
    });
  } catch (error: any) {
    console.error('SMTP Send Email Error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to dispatch email via SMTP.',
    });
  }
});

// Vite middleware / Express static setup
const PORT = process.env.PORT || 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`KAGZ Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
