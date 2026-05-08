const TEAM_GROUPS = [
  // AFC
  { label: 'Australia',    code: 'AUS' },
  { label: 'Iran',         code: 'IRN' },
  { label: 'Iraq',         code: 'IRQ' },
  { label: 'Jordan',       code: 'JOR' },
  { label: 'Japan',        code: 'JPN' },
  { label: 'South Korea',  code: 'KOR' },
  { label: 'Saudi Arabia', code: 'KSA' },
  { label: 'Qatar',        code: 'QAT' },
  { label: 'Uzbekistan',   code: 'UZB' },
  // CAF
  { label: 'Algeria',      code: 'ALG' },
  { label: 'Cabo Verde',   code: 'CPV' },
  { label: "Côte d'Ivoire", code: 'CIV' },
  { label: 'DR Congo',     code: 'COD' },
  { label: 'Egypt',        code: 'EGY' },
  { label: 'Ghana',        code: 'GHA' },
  { label: 'Morocco',      code: 'MAR' },
  { label: 'South Africa', code: 'RSA' },
  { label: 'Senegal',      code: 'SEN' },
  { label: 'Tunisia',      code: 'TUN' },
  // CONCACAF
  { label: 'Canada',       code: 'CAN' },
  { label: 'Curaçao',      code: 'CUW' },
  { label: 'Haiti',        code: 'HAI' },
  { label: 'Mexico',       code: 'MEX' },
  { label: 'Panama',       code: 'PAN' },
  { label: 'United States', code: 'USA' },
  // CONMEBOL
  { label: 'Argentina',   code: 'ARG' },
  { label: 'Brazil',      code: 'BRA' },
  { label: 'Colombia',    code: 'COL' },
  { label: 'Ecuador',     code: 'ECU' },
  { label: 'Paraguay',    code: 'PAR' },
  { label: 'Uruguay',     code: 'URU' },
  // OFC
  { label: 'New Zealand', code: 'NZL' },
  // UEFA
  { label: 'Austria',              code: 'AUT' },
  { label: 'Belgium',              code: 'BEL' },
  { label: 'Bosnia and Herzegovina', code: 'BIH' },
  { label: 'Croatia',              code: 'CRO' },
  { label: 'Czechia',              code: 'CZE' },
  { label: 'England',              code: 'ENG' },
  { label: 'Spain',                code: 'ESP' },
  { label: 'France',               code: 'FRA' },
  { label: 'Germany',              code: 'GER' },
  { label: 'Netherlands',          code: 'NED' },
  { label: 'Norway',               code: 'NOR' },
  { label: 'Portugal',             code: 'POR' },
  { label: 'Scotland',             code: 'SCO' },
  { label: 'Switzerland',          code: 'SUI' },
  { label: 'Sweden',               code: 'SWE' },
  { label: 'Türkiye',              code: 'TUR' },
];

export const STICKER_GROUPS = [
  {
    label: 'FIFA World Cup',
    codes: ['00', ...Array.from({ length: 19 }, (_, i) => `FWC${i + 1}`)],
  },
  ...TEAM_GROUPS.map(({ label, code }) => ({
    label,
    codes: Array.from({ length: 20 }, (_, i) => `${code}${i + 1}`),
  })),
];

export const STICKER_CODES = STICKER_GROUPS.flatMap((g) => g.codes);
export const STICKER_INDEX = new Map(STICKER_CODES.map((c, i) => [c, i]));

export function stickerDisplay(code) {
  return code.replace(/^[A-Z]+/, '') || code;
}
