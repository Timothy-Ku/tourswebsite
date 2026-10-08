// Gmail API Utility for Direct Client Dispatches via Google Workspace

export interface GmailDispatchData {
  recipientEmail: string;
  recipientName?: string;
  senderEmail?: string;
  senderName?: string;
  subject: string;
  body: string;
}

export interface GmailDispatchResult {
  success: boolean;
  messageId: string;
  threadId?: string;
  deliveryTime: string;
  response: string;
  senderEmailAddress?: string;
}

// Convert email params into RFC 2822 base64url string
export function buildRfc2822Message({
  toEmail,
  toName,
  senderEmail,
  senderName,
  subject,
  bodyText,
}: {
  toEmail: string;
  toName?: string;
  senderEmail?: string;
  senderName?: string;
  subject: string;
  bodyText: string;
}): string {
  const recipient = toName ? `"${toName}" <${toEmail}>` : toEmail;
  const fromHeader = senderName && senderEmail ? `"${senderName}" <${senderEmail}>` : senderEmail;

  const htmlContent = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; border: 1px solid #EADCC9; background-color: #FAF7F2; padding: 32px;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #C5A880;">
        <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #C5A880; font-weight: bold; font-family: monospace;">KAGZ TOURS & SAFARIS</span>
        <h1 style="font-size: 22px; color: #1C2421; margin: 8px 0 4px 0;">Bespoke Safari Expedition</h1>
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #78716C;">Direct Gmail Dispatch</span>
      </div>
      <div style="padding: 24px 0; font-size: 14px; line-height: 1.8; color: #292524; white-space: pre-line;">
${bodyText}
      </div>
      <div style="border-top: 1px solid #EADCC9; padding-top: 20px; text-align: center; font-size: 11px; color: #78716C; font-family: sans-serif;">
        <strong style="color: #1C2421;">KAGZ Travel & Safaris</strong> &bull; Luxury Travel Concierge<br/>
        Nairobi &bull; Arusha &bull; Kigali &bull; Zanzibar &bull; <a href="https://kagztours.com" style="color: #C5A880; text-decoration: none;">kagztours.com</a>
      </div>
    </div>
  `;

  const headers = [
    `To: ${recipient}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
  ];

  if (fromHeader) {
    headers.push(`From: ${fromHeader}`);
  }

  const rawString = [...headers, '', htmlContent].join('\r\n');

  // UTF-8 Safe Base64URL Encoding
  const utf8Bytes = new TextEncoder().encode(rawString);
  let binaryString = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binaryString += String.fromCharCode(utf8Bytes[i]);
  }

  const base64 = btoa(binaryString);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Fetch user's Gmail profile
export async function getGmailProfile(accessToken: string): Promise<{ emailAddress: string; messagesTotal: number; threadsTotal: number }> {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gmail API error (${response.status}): ${errText}`);
  }

  return response.json();
}

// Send Email via official Gmail API
export async function sendGmailMessage(
  accessToken: string,
  emailData: GmailDispatchData
): Promise<GmailDispatchResult> {
  const raw = buildRfc2822Message({
    toEmail: emailData.recipientEmail,
    toName: emailData.recipientName,
    senderEmail: emailData.senderEmail,
    senderName: emailData.senderName,
    subject: emailData.subject,
    bodyText: emailData.body,
  });

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gmail API dispatch failed with status ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  return {
    success: true,
    messageId: data.id || `gmail-${Date.now()}`,
    threadId: data.threadId,
    deliveryTime: new Date().toISOString(),
    response: '250 2.0.0 OK Direct Gmail Dispatch',
    senderEmailAddress: emailData.senderEmail,
  };
}
