// Simple email sending utility using Resend API (free tier: 100 emails/day)
// Sign up at resend.com to get your API key
// Store API key in .env.local as RESEND_API_KEY

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Love Dove <onboarding@resend.dev>';
// Default recipient for now; can be overridden per-call
const DEFAULT_RECIPIENT = process.env.PROPOSAL_NOTIFICATION_EMAIL || 'noreply@example.com';

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type ProposalEmailData = {
  proposalId: string;
  senderName: string;
  receiverName: string;
  title: string;
  message: string;
  category: string;
  categoryEmoji: string;
  responseUrl: string;
  isResponse?: boolean;
  response?: 'yes' | 'no' | 'maybe';
};

export async function sendEmail({ to, subject, html, text }: EmailPayload) {
  // If no API key is set, log to console (dev mode) and return success
  if (!RESEND_API_KEY) {
    console.log('📧 [DEV MODE] Email would be sent to:', to);
    console.log('Subject:', subject);
    console.log('---');
    if (text) console.log(text);
    return { success: true, dev: true };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
}

export function buildProposalEmail(data: ProposalEmailData): { subject: string; html: string; text: string } {
  const {
    proposalId,
    senderName,
    receiverName,
    title,
    message,
    categoryEmoji,
    responseUrl,
    isResponse,
    response,
  } = data;

  if (isResponse && response) {
    const isYes = response === 'yes';
    const emoji = isYes ? '💕' : response === 'no' ? '💔' : '🤔';
    const headline = isYes
      ? `${receiverName} said YES!`
      : response === 'no'
      ? `${receiverName} respectfully declined`
      : `${receiverName} needs more time`;
    const headlineGradient = isYes
      ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)'
      : response === 'no'
      ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
      : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';

    const subject = isYes
      ? `💕 ${receiverName} accepted your proposal!`
      : response === 'no'
      ? `💔 ${receiverName} responded to your proposal`
      : `🤔 ${receiverName} responded to your proposal`;

    const htmlResponse = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background: linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(236, 72, 153, 0.15);">
          <tr>
            <td style="background: ${headlineGradient}; padding: 40px 30px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 16px;">${emoji}</div>
              <h1 style="margin: 0; color: #ffffff; font-family: Georgia, serif; font-size: 32px; font-weight: 900; text-shadow: 0 2px 8px rgba(0,0,0,0.1);">${headline}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 16px 0; color: #831843; font-size: 18px; font-weight: 600;">Hi ${senderName},</p>
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                ${receiverName} just responded to your proposal <strong>"${title}"</strong>${categoryEmoji ? ` ${categoryEmoji}` : ''}.
              </p>
              <div style="background: linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%); border: 1px solid #fbcfe8; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <div style="font-size: 14px; color: #831843; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Their Response</div>
                <div style="font-size: 28px; font-weight: 900; color: ${isYes ? '#be185d' : '#475569'}; font-family: Georgia, serif;">
                  ${isYes ? 'Yes 💕' : response === 'no' ? 'No 💔' : 'Maybe 🤔'}
                </div>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${responseUrl}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 9999px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 30px rgba(236, 72, 153, 0.3);">View on Love Dove</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: #fdf2f8; padding: 24px 30px; text-align: center; border-top: 1px solid #fbcfe8;">
              <p style="margin: 0; color: #831843; font-size: 14px; font-weight: 600;">Made with 💕 by Love Dove</p>
              <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">Where hearts connect</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

    const textResponse = `${headline}\n\nHi ${senderName},\n\n${receiverName} just responded to your proposal "${title}": ${response.toUpperCase()}\n\nView on Love Dove: ${responseUrl}\n\nMade with 💕 by Love Dove`;

    return { subject, html: htmlResponse, text: textResponse };
  }

  // Initial proposal email to receiver
  const subject = `${categoryEmoji} ${senderName} sent you a proposal on Love Dove`;
  const htmlProposal = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background: linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(236, 72, 153, 0.15);">
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 16px;">${categoryEmoji}</div>
              <h1 style="margin: 0 0 8px 0; color: #ffffff; font-family: Georgia, serif; font-size: 28px; font-weight: 900; text-shadow: 0 2px 8px rgba(0,0,0,0.1);">You have a proposal!</h1>
              <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 16px;">from ${senderName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 16px 0; color: #831843; font-family: Georgia, serif; font-size: 24px; font-weight: 700;">${title}</h2>
              <div style="background: linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%); border-left: 4px solid #ec4899; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.7; font-style: italic;">"${message}"</p>
              </div>
              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                ${senderName} is waiting for your response. Click below to view the proposal and let them know what you think 💕
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${responseUrl}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 9999px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 30px rgba(236, 72, 153, 0.3);">View & Respond 💕</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: #fdf2f8; padding: 24px 30px; text-align: center; border-top: 1px solid #fbcfe8;">
              <p style="margin: 0; color: #831843; font-size: 14px; font-weight: 600;">Made with 💕 by Love Dove</p>
              <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">Where hearts connect</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  const textProposal = `You have a proposal!\n\nfrom ${senderName}\n\n${title}\n\n"${message}"\n\nView & Respond: ${responseUrl}\n\nMade with 💕 by Love Dove`;

  return { subject, html: htmlProposal, text: textProposal };
}

export async function sendProposalEmail(
  to: string | null,
  data: ProposalEmailData,
  fallbackEmail: string = DEFAULT_RECIPIENT
) {
  const recipient = to || fallbackEmail;
  const { subject, html, text } = buildProposalEmail(data);
  return sendEmail({ to: recipient, subject, html, text });
}