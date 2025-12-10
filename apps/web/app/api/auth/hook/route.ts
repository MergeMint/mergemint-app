import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  sendConfirmationEmail,
  sendPasswordResetEmail,
  sendMagicLinkEmail,
  sendEmailChangeEmail,
} from '~/lib/email/mailgun';

// Supabase Auth Hook Secret - from Supabase Dashboard > Authentication > Hooks
// Format: v1,whsec_<base64-encoded-secret>
const AUTH_HOOK_SECRET = process.env.SUPABASE_AUTH_HOOK_SECRET;

interface AuthHookPayload {
  user: {
    id: string;
    email: string;
    email_confirmed_at?: string;
    phone?: string;
    created_at: string;
    updated_at: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: 'signup' | 'recovery' | 'magiclink' | 'email_change' | 'invite';
    site_url: string;
    token_new?: string; // For email change - new email token
    token_hash_new?: string; // For email change - new email token hash
  };
}

/**
 * Extract the actual secret from the Supabase webhook secret format
 * Format: v1,whsec_<base64-encoded-secret>
 */
function getWebhookSecret(secret: string): string {
  // Remove the version prefix if present (e.g., "v1,whsec_")
  const parts = secret.split('whsec_');
  if (parts.length === 2) {
    return parts[1];
  }
  return secret;
}

/**
 * Verify Supabase webhook signature
 * Supabase sends the signature in the x-webhook-signature header
 */
async function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) return false;

  try {
    const webhookSecret = getWebhookSecret(secret);

    // Supabase uses HMAC-SHA256 for webhook signatures
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('base64');

    // Compare signatures (timing-safe comparison)
    return crypto.timingSafeEquals(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Auth hook: Signature verification error', error);
    return false;
  }
}

/**
 * Supabase Auth Hook - Custom Email Sending
 *
 * This endpoint is called by Supabase instead of sending emails directly.
 * Configure this in Supabase Dashboard > Authentication > Hooks > Send Email
 *
 * @see https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();

    // Verify webhook signature if secret is configured
    if (AUTH_HOOK_SECRET) {
      const signature = request.headers.get('x-webhook-signature');

      const isValid = await verifyWebhookSignature(rawBody, signature, AUTH_HOOK_SECRET);

      if (!isValid) {
        console.error('Auth hook: Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    }

    const payload: AuthHookPayload = JSON.parse(rawBody);
    const { user, email_data } = payload;

    if (!user?.email || !email_data) {
      console.error('Auth hook: Missing required fields', { user, email_data });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { email } = user;
    const { token_hash, redirect_to, email_action_type, site_url } = email_data;

    // Build the confirmation URL using the token_hash (same format as Supabase)
    const baseUrl = site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://mergemint.dev';

    let result;

    switch (email_action_type) {
      case 'signup': {
        // Email confirmation for new signups
        const confirmationUrl = `${baseUrl}/auth/confirm?token_hash=${token_hash}&type=email&callback=${encodeURIComponent(redirect_to || '')}`;

        result = await sendConfirmationEmail({
          to: email,
          confirmationUrl,
          baseUrl,
        });
        break;
      }

      case 'recovery': {
        // Password reset
        const resetUrl = `${baseUrl}/auth/confirm?token_hash=${token_hash}&type=recovery&callback=${encodeURIComponent(redirect_to || '/update-password')}`;

        result = await sendPasswordResetEmail({
          to: email,
          resetUrl,
          baseUrl,
        });
        break;
      }

      case 'magiclink': {
        // Magic link sign in
        const magicLinkUrl = `${baseUrl}/auth/confirm?token_hash=${token_hash}&type=magiclink&callback=${encodeURIComponent(redirect_to || '')}`;

        result = await sendMagicLinkEmail({
          to: email,
          magicLinkUrl,
          baseUrl,
        });
        break;
      }

      case 'email_change': {
        // Email change confirmation
        const confirmationUrl = `${baseUrl}/auth/confirm?token_hash=${token_hash}&type=email_change&callback=${encodeURIComponent(redirect_to || '')}`;

        // For email change, email_data may contain the new email
        // The 'email' in user is the current email, and we're confirming the change
        result = await sendEmailChangeEmail({
          to: email,
          confirmationUrl,
          newEmail: email, // The email receiving this is the new email address
          baseUrl,
        });
        break;
      }

      case 'invite': {
        // User invitation - this is typically handled by organization invites
        // but if Supabase sends an invite, handle it here
        const inviteUrl = `${baseUrl}/auth/confirm?token_hash=${token_hash}&type=invite&callback=${encodeURIComponent(redirect_to || '')}`;

        // Use confirmation email template for invites
        result = await sendConfirmationEmail({
          to: email,
          confirmationUrl: inviteUrl,
          baseUrl,
        });
        break;
      }

      default: {
        console.warn('Auth hook: Unknown email action type', email_action_type);
        return NextResponse.json(
          { error: `Unknown email action type: ${email_action_type}` },
          { status: 400 }
        );
      }
    }

    if (!result.success) {
      console.error('Auth hook: Failed to send email', {
        email_action_type,
        email,
        error: result.error,
      });

      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log('Auth hook: Email sent successfully', {
      email_action_type,
      email,
      messageId: result.messageId,
    });

    // Return success - Supabase expects a 200 response
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Auth hook: Unexpected error', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
