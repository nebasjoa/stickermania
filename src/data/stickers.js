const FWC_CODES = ['00', ...Array.from({ length: 19 }, (_, i) => `FWC${i + 1}`)];

// Teams ordered by World Cup group (A–L), matching the album layout
const TEAM_DATA = [
  // Group A: Mexico · South Africa · South Korea · Czechia
  { group: 'A', label: 'Mexico',       code: 'MEX', flag: '🇲🇽' },
  { group: 'A', label: 'South Africa', code: 'RSA', flag: '🇿🇦' },
  { group: 'A', label: 'South Korea',  code: 'KOR', flag: '🇰🇷' },
  { group: 'A', label: 'Czechia',      code: 'CZE', flag: '🇨🇿' },
  // Group B: Canada · Bosnia and Herzegovina · Qatar · Switzerland
  { group: 'B', label: 'Canada',                  code: 'CAN', flag: '🇨🇦' },
  { group: 'B', label: 'Bosnia and Herzegovina',  code: 'BIH', flag: '🇧🇦' },
  { group: 'B', label: 'Qatar',                   code: 'QAT', flag: '🇶🇦' },
  { group: 'B', label: 'Switzerland',             code: 'SUI', flag: '🇨🇭' },
  // Group C: Brazil · Morocco · Haiti · Scotland
  { group: 'C', label: 'Brazil',   code: 'BRA', flag: '🇧🇷' },
  { group: 'C', label: 'Morocco',  code: 'MAR', flag: '🇲🇦' },
  { group: 'C', label: 'Haiti',    code: 'HAI', flag: '🇭🇹' },
  { group: 'C', label: 'Scotland', code: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  // Group D: United States · Paraguay · Australia · Türkiye
  { group: 'D', label: 'United States', code: 'USA', flag: '🇺🇸' },
  { group: 'D', label: 'Paraguay',      code: 'PAR', flag: '🇵🇾' },
  { group: 'D', label: 'Australia',     code: 'AUS', flag: '🇦🇺' },
  { group: 'D', label: 'Türkiye',       code: 'TUR', flag: '🇹🇷' },
  // Group E: Germany · Curaçao · Côte d'Ivoire · Ecuador
  { group: 'E', label: 'Germany',        code: 'GER', flag: '🇩🇪' },
  { group: 'E', label: 'Curaçao',        code: 'CUW', flag: '🇨🇼' },
  { group: 'E', label: "Côte d'Ivoire",  code: 'CIV', flag: '🇨🇮' },
  { group: 'E', label: 'Ecuador',        code: 'ECU', flag: '🇪🇨' },
  // Group F: Netherlands · Japan · Sweden · Tunisia
  { group: 'F', label: 'Netherlands', code: 'NED', flag: '🇳🇱' },
  { group: 'F', label: 'Japan',       code: 'JPN', flag: '🇯🇵' },
  { group: 'F', label: 'Sweden',      code: 'SWE', flag: '🇸🇪' },
  { group: 'F', label: 'Tunisia',     code: 'TUN', flag: '🇹🇳' },
  // Group G: Belgium · Egypt · Iran · New Zealand
  { group: 'G', label: 'Belgium',     code: 'BEL', flag: '🇧🇪' },
  { group: 'G', label: 'Egypt',       code: 'EGY', flag: '🇪🇬' },
  { group: 'G', label: 'Iran',        code: 'IRN', flag: '🇮🇷' },
  { group: 'G', label: 'New Zealand', code: 'NZL', flag: '🇳🇿' },
  // Group H: Spain · Cabo Verde · Saudi Arabia · Uruguay
  { group: 'H', label: 'Spain',        code: 'ESP', flag: '🇪🇸' },
  { group: 'H', label: 'Cabo Verde',   code: 'CPV', flag: '🇨🇻' },
  { group: 'H', label: 'Saudi Arabia', code: 'KSA', flag: '🇸🇦' },
  { group: 'H', label: 'Uruguay',      code: 'URU', flag: '🇺🇾' },
  // Group I: France · Senegal · Iraq · Norway
  { group: 'I', label: 'France',  code: 'FRA', flag: '🇫🇷' },
  { group: 'I', label: 'Senegal', code: 'SEN', flag: '🇸🇳' },
  { group: 'I', label: 'Iraq',    code: 'IRQ', flag: '🇮🇶' },
  { group: 'I', label: 'Norway',  code: 'NOR', flag: '🇳🇴' },
  // Group J: Argentina · Algeria · Austria · Jordan
  { group: 'J', label: 'Argentina', code: 'ARG', flag: '🇦🇷' },
  { group: 'J', label: 'Algeria',   code: 'ALG', flag: '🇩🇿' },
  { group: 'J', label: 'Austria',   code: 'AUT', flag: '🇦🇹' },
  { group: 'J', label: 'Jordan',    code: 'JOR', flag: '🇯🇴' },
  // Group K: Portugal · DR Congo · Uzbekistan · Colombia
  { group: 'K', label: 'Portugal',   code: 'POR', flag: '🇵🇹' },
  { group: 'K', label: 'DR Congo',   code: 'COD', flag: '🇨🇩' },
  { group: 'K', label: 'Uzbekistan', code: 'UZB', flag: '🇺🇿' },
  { group: 'K', label: 'Colombia',   code: 'COL', flag: '🇨🇴' },
  // Group L: England · Croatia · Ghana · Panama
  { group: 'L', label: 'England', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { group: 'L', label: 'Croatia', code: 'CRO', flag: '🇭🇷' },
  { group: 'L', label: 'Ghana',   code: 'GHA', flag: '🇬🇭' },
  { group: 'L', label: 'Panama',  code: 'PAN', flag: '🇵🇦' },
];

function teamCodes(code) {
  return Array.from({ length: 20 }, (_, i) => `${code}${i + 1}`);
}

export const STICKER_GROUPS = [
  {
    label: 'Introduction',
    teams: [{ label: 'FIFA World Cup', flag: '🏆', codes: FWC_CODES }],
  },
  ...['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((g) => ({
    label: `Group ${g}`,
    teams: TEAM_DATA
      .filter((t) => t.group === g)
      .map((t) => ({ label: t.label, flag: t.flag, codes: teamCodes(t.code) })),
  })),
];

export const STICKER_CODES = [
  ...FWC_CODES,
  ...TEAM_DATA.flatMap((t) => teamCodes(t.code)),
];

export const STICKER_INDEX = new Map(STICKER_CODES.map((c, i) => [c, i]));
