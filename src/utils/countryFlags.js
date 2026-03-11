const COUNTRY_FLAG_CODES = {
  Algeria: 'dz',
  Argentina: 'ar',
  Australia: 'au',
  Austria: 'at',
  Belgium: 'be',
  Brazil: 'br',
  Canada: 'ca',
  Colombia: 'co',
  Croatia: 'hr',
  Curacao: 'cw',
  'Curaçao': 'cw',
  Ecuador: 'ec',
  Egypt: 'eg',
  England: 'gb-eng',
  France: 'fr',
  Germany: 'de',
  Ghana: 'gh',
  Haiti: 'ht',
  Iran: 'ir',
  Iraq: 'iq',
  'Ivory Coast': 'ci',
  Japan: 'jp',
  Jordan: 'jo',
  'Korea Republic': 'kr',
  Mexico: 'mx',
  Morocco: 'ma',
  Netherlands: 'nl',
  Norway: 'no',
  Panama: 'pa',
  Paraguay: 'py',
  Portugal: 'pt',
  Qatar: 'qa',
  'Saudi Arabia': 'sa',
  Scotland: 'gb-sct',
  Senegal: 'sn',
  Serbia: 'rs',
  Spain: 'es',
  'South Africa': 'za',
  Switzerland: 'ch',
  Tunisia: 'tn',
  Uruguay: 'uy',
  Uzbekistan: 'uz',
  'United States': 'us',
  'New Zealand': 'nz',
  'Cape Verde': 'cv'
};

export function getCountryFlagCode(country) {
  return COUNTRY_FLAG_CODES[String(country || '').trim()] || '';
}

export function hasCountryFlag(country) {
  return Boolean(getCountryFlagCode(country));
}
