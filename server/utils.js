import crypto from 'crypto';

export function createVerificationToken() {
  return crypto.randomBytes(24).toString('hex');
}

export function normalizeStickerNumbers(input) {
  const raw = Array.isArray(input) ? input.join(',') : String(input || '');

  return [...new Set(
    raw
      .split(/[\s,;]+/)
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean)
  )];
}
