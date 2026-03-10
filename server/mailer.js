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

  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Verify your Stickermania account',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Hello ${username},</h2>
        <p>Verify your account to start trading FIFA World Cup stickers.</p>
        <p><a href="${verifyUrl}">Verify email address</a></p>
        <p>If the button does not work, open this link:</p>
        <p>${verifyUrl}</p>
      </div>
    `
  });

  return { delivered: true, skippedInDevelopment: false };
}
