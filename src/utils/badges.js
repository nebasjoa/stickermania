import { STICKER_CODES } from '../data/stickers.js';
const TOTAL_STICKERS = STICKER_CODES.length;
const TOURNAMENT_START = new Date('2026-06-11');

export const BADGE_CATEGORIES = ['collection', 'trading', 'community', 'predictions', 'account'];

export const BADGES = [
  { id: 'first_sticker',   category: 'collection',  tier: 'bronze'   },
  { id: 'half_way',        category: 'collection',  tier: 'silver'   },
  { id: 'almost_complete', category: 'collection',  tier: 'gold'     },
  { id: 'full_album',      category: 'collection',  tier: 'platinum' },
  { id: 'first_trade',     category: 'trading',     tier: 'bronze'   },
  { id: 'trade_veteran',   category: 'trading',     tier: 'gold'     },
  { id: 'generous_trader', category: 'trading',     tier: 'silver'   },
  { id: 'sought_after',    category: 'trading',     tier: 'silver'   },
  { id: 'postal_trader',   category: 'trading',     tier: 'bronze'   },
  { id: 'meetup_goer',     category: 'community',   tier: 'bronze'   },
  { id: 'meetup_host',     category: 'community',   tier: 'silver'   },
  { id: 'forecaster',      category: 'predictions', tier: 'bronze'   },
  { id: 'full_predictor',  category: 'predictions', tier: 'gold'     },
  { id: 'sharp_eye',       category: 'predictions', tier: 'gold'     },
  { id: 'early_bird',      category: 'account',     tier: 'silver'   },
];

export function computeEarnedBadges(currentUser, trades, meetups, predictions) {
  if (!currentUser) return [];

  const earned = new Set();
  const collectedCount = TOTAL_STICKERS - (currentUser.needs?.length ?? TOTAL_STICKERS);
  const offersCount = currentUser.offers?.length ?? 0;
  const needsCount = currentUser.needs?.length ?? TOTAL_STICKERS;

  // Collection
  if (collectedCount > 0 || offersCount > 0) earned.add('first_sticker');
  if (collectedCount >= 490) earned.add('half_way');
  if (collectedCount > 0 && needsCount <= 98) earned.add('almost_complete');
  if (needsCount === 0) earned.add('full_album');

  // Trading
  if (trades.length > 0) earned.add('first_trade');

  const acceptedTrades = trades.filter((t) => t.status === 'accepted');
  if (acceptedTrades.length >= 10) earned.add('trade_veteran');
  if (offersCount >= 50) earned.add('generous_trader');

  const incomingTrades = trades.filter((t) => t.target_user_id === currentUser.id);
  if (incomingTrades.length >= 5) earned.add('sought_after');

  const hasAcceptedPostal = acceptedTrades.some((t) => t.trade_method === 'postal');
  if (currentUser.postalTradeEnabled && hasAcceptedPostal) earned.add('postal_trader');

  // Community
  if (meetups.some((m) => m.isAttending)) earned.add('meetup_goer');
  if (meetups.some((m) => m.creator_user_id === currentUser.id)) earned.add('meetup_host');

  // Predictions
  const predicted = predictions.filter((g) => g.prediction);
  if (predicted.length >= 10) earned.add('forecaster');
  if (predictions.length > 0 && predicted.length === predictions.length) earned.add('full_predictor');
  if (predictions.some((g) => g.prediction?.points === 3)) earned.add('sharp_eye');

  // Account
  if (currentUser.createdAt && new Date(currentUser.createdAt) < TOURNAMENT_START) {
    earned.add('early_bird');
  }

  return BADGES.filter((b) => earned.has(b.id));
}
