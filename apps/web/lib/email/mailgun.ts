/**
 * Mailgun Email Service
 * 
 * Handles sending transactional emails via Mailgun API
 */

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN || 'mg.mergemint.dev';
const MAILGUN_FROM = process.env.MAILGUN_FROM || 'MergeMint <noreply@mg.mergemint.dev>';
// Use EU endpoint for EU domains
const MAILGUN_API_URL = process.env.MAILGUN_API_URL || 'https://api.eu.mailgun.net/v3';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: string[];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Mailgun API
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  if (!MAILGUN_API_KEY) {
    console.warn('MAILGUN_API_KEY not configured, skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  const { to, subject, html, text, from, replyTo, tags } = options;

  const recipients = Array.isArray(to) ? to.join(', ') : to;

  const formData = new FormData();
  formData.append('from', from || MAILGUN_FROM);
  formData.append('to', recipients);
  formData.append('subject', subject);
  formData.append('html', html);
  
  if (text) {
    formData.append('text', text);
  }
  
  if (replyTo) {
    formData.append('h:Reply-To', replyTo);
  }

  if (tags?.length) {
    tags.forEach(tag => formData.append('o:tag', tag));
  }

  try {
    const response = await fetch(`${MAILGUN_API_URL}/${MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mailgun API error:', response.status, errorText);
      return { 
        success: false, 
        error: `Mailgun error: ${response.status} - ${errorText}` 
      };
    }

    const result = await response.json();
    
    return {
      success: true,
      messageId: result.id,
    };
  } catch (error) {
    console.error('Failed to send email via Mailgun:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send organization invitation email
 */
export async function sendInvitationEmail(params: {
  to: string;
  inviterName: string;
  orgName: string;
  role: string;
  inviteToken: string;
  baseUrl?: string;
}): Promise<SendEmailResult> {
  const { to, inviterName, orgName, role, inviteToken, baseUrl = 'https://mergemint.dev' } = params;
  
  const inviteUrl = `${baseUrl}/invite/${inviteToken}`;
  
  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    pm: 'Product Manager',
    developer: 'Developer',
    viewer: 'Viewer',
    member: 'Team Member',
  };
  
  const roleLabel = roleLabels[role] || role;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to join ${orgName} on MergeMint</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                🎉 You're Invited!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi there,
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> on MergeMint as a <strong>${roleLabel}</strong>.
              </p>
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                MergeMint helps engineering teams track PR contributions and celebrate developer achievements.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center; padding: 10px 0 30px;">
                    <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 20px; color: #7c3aed; font-size: 14px; word-break: break-all;">
                <a href="${inviteUrl}" style="color: #7c3aed;">${inviteUrl}</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.5;">
                This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                © ${new Date().getFullYear()} MergeMint. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
You're invited to join ${orgName} on MergeMint!

${inviterName} has invited you to join ${orgName} as a ${roleLabel}.

MergeMint helps engineering teams track PR contributions and celebrate developer achievements.

Accept your invitation here: ${inviteUrl}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.
  `.trim();

  return sendEmail({
    to,
    subject: `You're invited to join ${orgName} on MergeMint`,
    html,
    text,
    tags: ['invitation', 'onboarding'],
  });
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
  orgName: string;
  baseUrl?: string;
}): Promise<SendEmailResult> {
  const { to, name, orgName, baseUrl = 'https://mergemint.dev' } = params;
  
  const dashboardUrl = `${baseUrl}/home`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to MergeMint!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                Welcome to MergeMint! 🚀
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${name},
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Welcome to MergeMint! Your organization <strong>${orgName}</strong> is all set up and ready to go.
              </p>
              <p style="margin: 0 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                Here's what you can do next:
              </p>
              
              <ul style="margin: 0 0 30px; padding-left: 20px; color: #374151; font-size: 16px; line-height: 1.8;">
                <li>Connect your GitHub repositories</li>
                <li>Define your product components</li>
                <li>Invite your team members</li>
                <li>Start tracking PR contributions</li>
              </ul>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center; padding: 10px 0 20px;">
                    <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                © ${new Date().getFullYear()} MergeMint. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Welcome to MergeMint, ${name}!

Your organization ${orgName} is all set up and ready to go.

Here's what you can do next:
- Connect your GitHub repositories
- Define your product components
- Invite your team members
- Start tracking PR contributions

Go to your dashboard: ${dashboardUrl}
  `.trim();

  return sendEmail({
    to,
    subject: `Welcome to MergeMint, ${name}! 🚀`,
    html,
    text,
    tags: ['welcome', 'onboarding'],
  });
}

