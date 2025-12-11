/**
 * Bug Bounty Email Notifications
 *
 * Handles sending transactional emails for bounty program events
 */

import { sendEmail, type SendEmailResult } from './mailgun';

/**
 * Send email when rewards are calculated for a program
 */
export async function sendRewardCalculatedEmail(params: {
  to: string;
  developerName: string;
  programName: string;
  finalScore: number;
  rankOrTier: string;
  rewardAmount: number;
  rewardCurrency: string;
  orgName: string;
  orgSlug: string;
  baseUrl?: string;
}): Promise<SendEmailResult> {
  const {
    to,
    developerName,
    programName,
    finalScore,
    rankOrTier,
    rewardAmount,
    rewardCurrency,
    orgName,
    orgSlug,
    baseUrl = 'https://mergemint.dev',
  } = params;

  const bountyUrl = `${baseUrl}/${orgSlug}/bounty`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bug Bounty Reward Calculated - ${programName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                🎉 You've Earned a Bounty Reward!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${developerName},
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Congratulations! Your contributions have earned you a reward in the <strong>${programName}</strong> bug bounty program at <strong>${orgName}</strong>.
              </p>

              <!-- Reward Box -->
              <table role="presentation" style="width: 100%; margin: 30px 0; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px; padding: 24px; border: 2px solid #10b981;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px; color: #065f46; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Your Reward
                    </p>
                    <p style="margin: 0; color: #047857; font-size: 40px; font-weight: 700; line-height: 1.2;">
                      ${rewardCurrency} ${rewardAmount}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Stats -->
              <table role="presentation" style="width: 100%; margin: 20px 0;">
                <tr>
                  <td style="padding: 16px; background-color: #f9fafb; border-radius: 8px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 14px;">Position:</span>
                          <strong style="float: right; color: #111827; font-size: 14px;">${rankOrTier}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 14px;">Final Score:</span>
                          <strong style="float: right; color: #111827; font-size: 14px;">${finalScore.toFixed(2)}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Your reward is currently pending approval by the program administrator. You'll receive another notification once it's been approved for payout.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center; padding: 10px 0 20px;">
                    <a href="${bountyUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      View Bounty Programs
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

              <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.5;">
                Keep up the great work! Your contributions make a real difference to the team.
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
🎉 You've Earned a Bounty Reward!

Hi ${developerName},

Congratulations! Your contributions have earned you a reward in the "${programName}" bug bounty program at ${orgName}.

Your Reward: ${rewardCurrency} ${rewardAmount}
Position: ${rankOrTier}
Final Score: ${finalScore.toFixed(2)}

Your reward is currently pending approval by the program administrator. You'll receive another notification once it's been approved for payout.

View your bounty programs: ${bountyUrl}

Keep up the great work! Your contributions make a real difference to the team.
  `.trim();

  return sendEmail({
    to,
    subject: `🎉 You've earned ${rewardCurrency} ${rewardAmount} in ${programName}!`,
    html,
    text,
    tags: ['bounty', 'reward-calculated'],
  });
}

/**
 * Send email when a reward is approved
 */
export async function sendRewardApprovedEmail(params: {
  to: string;
  developerName: string;
  programName: string;
  rewardAmount: number;
  rewardCurrency: string;
  orgName: string;
  orgSlug: string;
  baseUrl?: string;
}): Promise<SendEmailResult> {
  const {
    to,
    developerName,
    programName,
    rewardAmount,
    rewardCurrency,
    orgName,
    orgSlug,
    baseUrl = 'https://mergemint.dev',
  } = params;

  const bountyUrl = `${baseUrl}/${orgSlug}/bounty`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bounty Reward Approved - ${programName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                ✅ Reward Approved!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${developerName},
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Great news! Your reward from the <strong>${programName}</strong> program has been approved by <strong>${orgName}</strong>.
              </p>

              <!-- Reward Box -->
              <table role="presentation" style="width: 100%; margin: 30px 0; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 8px; padding: 24px; border: 2px solid #3b82f6;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px; color: #1e40af; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Approved Amount
                    </p>
                    <p style="margin: 0; color: #1d4ed8; font-size: 40px; font-weight: 700; line-height: 1.2;">
                      ${rewardCurrency} ${rewardAmount}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Your payment is being processed. You'll receive a final notification once the payout has been completed with transaction details.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center; padding: 10px 0 20px;">
                    <a href="${bountyUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      View My Rewards
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
✅ Reward Approved!

Hi ${developerName},

Great news! Your reward from the "${programName}" program has been approved by ${orgName}.

Approved Amount: ${rewardCurrency} ${rewardAmount}

Your payment is being processed. You'll receive a final notification once the payout has been completed with transaction details.

View your rewards: ${bountyUrl}
  `.trim();

  return sendEmail({
    to,
    subject: `✅ Your ${rewardCurrency} ${rewardAmount} bounty reward has been approved`,
    html,
    text,
    tags: ['bounty', 'reward-approved'],
  });
}

/**
 * Send email when a reward has been paid
 */
export async function sendRewardPaidEmail(params: {
  to: string;
  developerName: string;
  programName: string;
  rewardAmount: number;
  rewardCurrency: string;
  payoutMethod: string;
  payoutReference: string;
  orgName: string;
  orgSlug: string;
  baseUrl?: string;
}): Promise<SendEmailResult> {
  const {
    to,
    developerName,
    programName,
    rewardAmount,
    rewardCurrency,
    payoutMethod,
    payoutReference,
    orgName,
    orgSlug,
    baseUrl = 'https://mergemint.dev',
  } = params;

  const bountyUrl = `${baseUrl}/${orgSlug}/bounty`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bounty Reward Paid - ${programName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                💰 Payment Completed!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${developerName},
              </p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Your bounty reward from <strong>${programName}</strong> has been paid by <strong>${orgName}</strong>!
              </p>

              <!-- Payment Details -->
              <table role="presentation" style="width: 100%; margin: 20px 0; background-color: #f9fafb; border-radius: 8px; padding: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 16px; color: #111827; font-size: 18px; font-weight: 600;">
                      Payment Details
                    </p>
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 14px;">Amount:</span>
                          <strong style="float: right; color: #111827; font-size: 14px;">${rewardCurrency} ${rewardAmount}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 14px;">Method:</span>
                          <strong style="float: right; color: #111827; font-size: 14px;">${payoutMethod}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 14px;">Reference:</span>
                          <strong style="float: right; color: #111827; font-size: 14px; word-break: break-all;">${payoutReference}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Please allow some time for the payment to appear in your account depending on the payment method.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center; padding: 10px 0 20px;">
                    <a href="${bountyUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      View Rewards History
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

              <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.5;">
                Thank you for your valuable contributions! Keep building great things.
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
💰 Payment Completed!

Hi ${developerName},

Your bounty reward from "${programName}" has been paid by ${orgName}!

Payment Details:
Amount: ${rewardCurrency} ${rewardAmount}
Method: ${payoutMethod}
Reference: ${payoutReference}

Please allow some time for the payment to appear in your account depending on the payment method.

View your rewards history: ${bountyUrl}

Thank you for your valuable contributions! Keep building great things.
  `.trim();

  return sendEmail({
    to,
    subject: `💰 Payment completed: ${rewardCurrency} ${rewardAmount} from ${programName}`,
    html,
    text,
    tags: ['bounty', 'reward-paid'],
  });
}
