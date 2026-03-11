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

export async function sendTradeRequestEmail({
  email,
  targetUsername,
  requesterUsername,
  requestedStickers = [],
  offeredStickers = [],
  tradeMethod = 'in_person'
}) {
  if (isDevelopment) {
    console.warn('Development mode detected. Resend trade email skipped.');
    return { delivered: false, skippedInDevelopment: true };
  }

  if (!resendApiKey || !fromEmail) {
    console.warn('Resend is not configured. Trade email skipped.');
    return { delivered: false };
  }

  const resend = new Resend(resendApiKey);
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const tradesUrl = `${clientUrl}/trades`;
  const formattedRequested = requestedStickers.join(', ') || '-';
  const formattedOffered = offeredStickers.join(', ') || '-';
  const methodLabel = tradeMethod === 'post' ? 'By post' : 'In person';

  console.log(`[mailer] Sending trade request email to ${email} (user: ${targetUsername})`);

  const result = await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: `${requesterUsername} sent you a trade request on Stickermania`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Hello ${targetUsername},</h2>
        <p>${requesterUsername} sent you a new sticker trade request on Stickermania.</p>
        <p><strong>Trade method:</strong> ${methodLabel}</p>
        <p><strong>Stickers requested from you:</strong> ${formattedRequested}</p>
        <p><strong>Stickers offered to you:</strong> ${formattedOffered}</p>
        <p><a href="${tradesUrl}">Open your trades</a></p>
        <p>If the button does not work, open this URL in your browser:</p>
        <p>${tradesUrl}</p>
      </div>
    `
  });

  if (result.error) {
    console.error(`[mailer] Resend trade email error for ${email}:`, result.error);
    return { delivered: false, error: result.error };
  }

  console.log(`[mailer] Trade email delivered to ${email}, id: ${result.data?.id}`);
  return { delivered: true, skippedInDevelopment: false };
}
