import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;
const isDevelopment = process.env.VITE_ENV === 'development';

export async function sendVerificationEmail({ email, username, token }) {
  if (isDevelopment) {
    console.warn('Development mode detected. Resend verification email skipped.');
    return { delivered: false, skippedInDevelopment: true };
  }

  if (!resendApiKey || !fromEmail) {
    console.warn('Resend is not configured. Verification email skipped.');
    return { delivered: false };
  }

  const resend = new Resend(resendApiKey);
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const verifyUrl = `${clientUrl}/?verify=${token}`;

  console.log(`[mailer] Sending verification email to ${email} (user: ${username})`);

  const result = await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Verify your World Cup Stuff account',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Hello ${username},</h2>
        <p>Welcome to World Cup Stuff.</p>
        <p>Confirm your email address to activate your account and start trading FIFA World Cup stickers.</p>
        <p><a href="${verifyUrl}">Confirm email address</a></p>
        <p>If the link above does not work, open this URL in your browser:</p>
        <p>${verifyUrl}</p>
      </div>
    `
  });

  if (result.error) {
    console.error(`[mailer] Resend error for ${email}:`, result.error);
    return { delivered: false, error: result.error };
  }

  console.log(`[mailer] Email delivered to ${email}, id: ${result.data?.id}`);
  return { delivered: true, skippedInDevelopment: false };
}
