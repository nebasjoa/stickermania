// All 72 FIFA World Cup 2026 group stage fixtures.
// Kickoff times stored in UTC (source times were EDT = UTC-4).
export const games = [
  // ── Group A: Mexico · South Africa · Korea Republic · Playoff D ──────────
  { matchNumber: 1,  group: 'A', homeTeam: 'Mexico',           awayTeam: 'South Africa',    startsAt: '2026-06-11T19:00:00Z', venue: 'Estadio Azteca',           city: 'Mexico City' },
  { matchNumber: 2,  group: 'A', homeTeam: 'Korea Republic',   awayTeam: 'Playoff D',        startsAt: '2026-06-12T02:00:00Z', venue: 'Estadio Akron',            city: 'Guadalajara' },
  { matchNumber: 19, group: 'A', homeTeam: 'Playoff D',        awayTeam: 'South Africa',    startsAt: '2026-06-18T16:00:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta' },
  { matchNumber: 20, group: 'A', homeTeam: 'Mexico',           awayTeam: 'Korea Republic',  startsAt: '2026-06-19T01:00:00Z', venue: 'Estadio Akron',            city: 'Guadalajara' },
  { matchNumber: 37, group: 'A', homeTeam: 'Playoff D',        awayTeam: 'Mexico',          startsAt: '2026-06-25T01:00:00Z', venue: 'Estadio Azteca',           city: 'Mexico City' },
  { matchNumber: 38, group: 'A', homeTeam: 'South Africa',     awayTeam: 'Korea Republic',  startsAt: '2026-06-25T01:00:00Z', venue: 'Estadio BBVA',             city: 'Monterrey' },

  // ── Group B: Canada · Playoff A · Qatar · Switzerland ────────────────────
  { matchNumber: 3,  group: 'B', homeTeam: 'Canada',           awayTeam: 'Playoff A',       startsAt: '2026-06-12T19:00:00Z', venue: 'BMO Field',                city: 'Toronto' },
  { matchNumber: 4,  group: 'B', homeTeam: 'Qatar',            awayTeam: 'Switzerland',     startsAt: '2026-06-13T19:00:00Z', venue: "Levi's Stadium",           city: 'Santa Clara' },
  { matchNumber: 21, group: 'B', homeTeam: 'Switzerland',      awayTeam: 'Playoff A',       startsAt: '2026-06-18T19:00:00Z', venue: 'SoFi Stadium',             city: 'Inglewood' },
  { matchNumber: 22, group: 'B', homeTeam: 'Canada',           awayTeam: 'Qatar',           startsAt: '2026-06-18T22:00:00Z', venue: 'BC Place',                 city: 'Vancouver' },
  { matchNumber: 39, group: 'B', homeTeam: 'Switzerland',      awayTeam: 'Canada',          startsAt: '2026-06-24T19:00:00Z', venue: 'BC Place',                 city: 'Vancouver' },
  { matchNumber: 40, group: 'B', homeTeam: 'Playoff A',        awayTeam: 'Qatar',           startsAt: '2026-06-24T19:00:00Z', venue: 'Lumen Field',              city: 'Seattle' },

  // ── Group C: Brazil · Morocco · Haiti · Scotland ─────────────────────────
  { matchNumber: 5,  group: 'C', homeTeam: 'Brazil',           awayTeam: 'Morocco',         startsAt: '2026-06-13T22:00:00Z', venue: 'MetLife Stadium',          city: 'East Rutherford' },
  { matchNumber: 6,  group: 'C', homeTeam: 'Haiti',            awayTeam: 'Scotland',        startsAt: '2026-06-14T01:00:00Z', venue: 'Gillette Stadium',         city: 'Foxborough' },
  { matchNumber: 23, group: 'C', homeTeam: 'Scotland',         awayTeam: 'Morocco',         startsAt: '2026-06-19T22:00:00Z', venue: 'Gillette Stadium',         city: 'Foxborough' },
  { matchNumber: 24, group: 'C', homeTeam: 'Brazil',           awayTeam: 'Haiti',           startsAt: '2026-06-20T01:00:00Z', venue: 'Lincoln Financial Field',  city: 'Philadelphia' },
  { matchNumber: 41, group: 'C', homeTeam: 'Scotland',         awayTeam: 'Brazil',          startsAt: '2026-06-24T22:00:00Z', venue: 'Hard Rock Stadium',        city: 'Miami' },
  { matchNumber: 42, group: 'C', homeTeam: 'Morocco',          awayTeam: 'Haiti',           startsAt: '2026-06-24T22:00:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta' },

  // ── Group D: United States · Paraguay · Australia · Playoff C ────────────
  { matchNumber: 7,  group: 'D', homeTeam: 'United States',    awayTeam: 'Paraguay',        startsAt: '2026-06-13T01:00:00Z', venue: 'SoFi Stadium',             city: 'Inglewood' },
  { matchNumber: 8,  group: 'D', homeTeam: 'Australia',        awayTeam: 'Playoff C',       startsAt: '2026-06-13T04:00:00Z', venue: 'BC Place',                 city: 'Vancouver' },
  { matchNumber: 25, group: 'D', homeTeam: 'Playoff C',        awayTeam: 'Paraguay',        startsAt: '2026-06-19T04:00:00Z', venue: "Levi's Stadium",           city: 'Santa Clara' },
  { matchNumber: 26, group: 'D', homeTeam: 'United States',    awayTeam: 'Australia',       startsAt: '2026-06-19T19:00:00Z', venue: 'Lumen Field',              city: 'Seattle' },
  { matchNumber: 43, group: 'D', homeTeam: 'Playoff C',        awayTeam: 'United States',   startsAt: '2026-06-26T02:00:00Z', venue: 'SoFi Stadium',             city: 'Inglewood' },
  { matchNumber: 44, group: 'D', homeTeam: 'Paraguay',         awayTeam: 'Australia',       startsAt: '2026-06-26T02:00:00Z', venue: "Levi's Stadium",           city: 'Santa Clara' },

  // ── Group E: Germany · Curaçao · Ivory Coast · Ecuador ───────────────────
  { matchNumber: 9,  group: 'E', homeTeam: 'Germany',          awayTeam: 'Curaçao',         startsAt: '2026-06-14T17:00:00Z', venue: 'NRG Stadium',              city: 'Houston' },
  { matchNumber: 10, group: 'E', homeTeam: 'Ivory Coast',      awayTeam: 'Ecuador',         startsAt: '2026-06-14T23:00:00Z', venue: 'Lincoln Financial Field',  city: 'Philadelphia' },
  { matchNumber: 27, group: 'E', homeTeam: 'Germany',          awayTeam: 'Ivory Coast',     startsAt: '2026-06-20T20:00:00Z', venue: 'BMO Field',                city: 'Toronto' },
  { matchNumber: 28, group: 'E', homeTeam: 'Ecuador',          awayTeam: 'Curaçao',         startsAt: '2026-06-21T00:00:00Z', venue: 'Arrowhead Stadium',        city: 'Kansas City' },
  { matchNumber: 45, group: 'E', homeTeam: 'Curaçao',          awayTeam: 'Ivory Coast',     startsAt: '2026-06-25T20:00:00Z', venue: 'Lincoln Financial Field',  city: 'Philadelphia' },
  { matchNumber: 46, group: 'E', homeTeam: 'Ecuador',          awayTeam: 'Germany',         startsAt: '2026-06-25T20:00:00Z', venue: 'MetLife Stadium',          city: 'East Rutherford' },

  // ── Group F: Netherlands · Japan · Playoff B · Tunisia ───────────────────
  { matchNumber: 11, group: 'F', homeTeam: 'Netherlands',      awayTeam: 'Japan',           startsAt: '2026-06-14T20:00:00Z', venue: 'AT&T Stadium',             city: 'Arlington' },
  { matchNumber: 12, group: 'F', homeTeam: 'Playoff B',        awayTeam: 'Tunisia',         startsAt: '2026-06-15T02:00:00Z', venue: 'Estadio BBVA',             city: 'Monterrey' },
  { matchNumber: 29, group: 'F', homeTeam: 'Netherlands',      awayTeam: 'Playoff B',       startsAt: '2026-06-20T17:00:00Z', venue: 'NRG Stadium',              city: 'Houston' },
  { matchNumber: 30, group: 'F', homeTeam: 'Tunisia',          awayTeam: 'Japan',           startsAt: '2026-06-20T04:00:00Z', venue: 'Estadio BBVA',             city: 'Monterrey' },
  { matchNumber: 47, group: 'F', homeTeam: 'Japan',            awayTeam: 'Playoff B',       startsAt: '2026-06-25T23:00:00Z', venue: 'AT&T Stadium',             city: 'Arlington' },
  { matchNumber: 48, group: 'F', homeTeam: 'Tunisia',          awayTeam: 'Netherlands',     startsAt: '2026-06-25T23:00:00Z', venue: 'Arrowhead Stadium',        city: 'Kansas City' },

  // ── Group G: Belgium · Egypt · Iran · New Zealand ────────────────────────
  { matchNumber: 13, group: 'G', homeTeam: 'Belgium',          awayTeam: 'Egypt',           startsAt: '2026-06-15T19:00:00Z', venue: 'Lumen Field',              city: 'Seattle' },
  { matchNumber: 14, group: 'G', homeTeam: 'Iran',             awayTeam: 'New Zealand',     startsAt: '2026-06-16T01:00:00Z', venue: 'SoFi Stadium',             city: 'Inglewood' },
  { matchNumber: 31, group: 'G', homeTeam: 'Belgium',          awayTeam: 'Iran',            startsAt: '2026-06-21T19:00:00Z', venue: 'SoFi Stadium',             city: 'Inglewood' },
  { matchNumber: 32, group: 'G', homeTeam: 'New Zealand',      awayTeam: 'Egypt',           startsAt: '2026-06-22T01:00:00Z', venue: 'BC Place',                 city: 'Vancouver' },
  { matchNumber: 49, group: 'G', homeTeam: 'Egypt',            awayTeam: 'Iran',            startsAt: '2026-06-27T03:00:00Z', venue: 'Lumen Field',              city: 'Seattle' },
  { matchNumber: 50, group: 'G', homeTeam: 'New Zealand',      awayTeam: 'Belgium',         startsAt: '2026-06-27T03:00:00Z', venue: 'BC Place',                 city: 'Vancouver' },

  // ── Group H: Spain · Cape Verde · Saudi Arabia · Uruguay ─────────────────
  { matchNumber: 15, group: 'H', homeTeam: 'Spain',            awayTeam: 'Cape Verde',      startsAt: '2026-06-15T16:00:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta' },
  { matchNumber: 16, group: 'H', homeTeam: 'Saudi Arabia',     awayTeam: 'Uruguay',         startsAt: '2026-06-15T22:00:00Z', venue: 'Hard Rock Stadium',        city: 'Miami' },
  { matchNumber: 33, group: 'H', homeTeam: 'Spain',            awayTeam: 'Saudi Arabia',    startsAt: '2026-06-21T16:00:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta' },
  { matchNumber: 34, group: 'H', homeTeam: 'Uruguay',          awayTeam: 'Cape Verde',      startsAt: '2026-06-21T22:00:00Z', venue: 'Hard Rock Stadium',        city: 'Miami' },
  { matchNumber: 51, group: 'H', homeTeam: 'Cape Verde',       awayTeam: 'Saudi Arabia',    startsAt: '2026-06-27T00:00:00Z', venue: 'NRG Stadium',              city: 'Houston' },
  { matchNumber: 52, group: 'H', homeTeam: 'Uruguay',          awayTeam: 'Spain',           startsAt: '2026-06-27T00:00:00Z', venue: 'Estadio Akron',            city: 'Guadalajara' },

  // ── Group I: France · Senegal · IC Playoff 2 · Norway ────────────────────
  { matchNumber: 17, group: 'I', homeTeam: 'France',           awayTeam: 'Senegal',         startsAt: '2026-06-16T19:00:00Z', venue: 'MetLife Stadium',          city: 'East Rutherford' },
  { matchNumber: 18, group: 'I', homeTeam: 'IC Playoff 2',     awayTeam: 'Norway',          startsAt: '2026-06-16T22:00:00Z', venue: 'Gillette Stadium',         city: 'Foxborough' },
  { matchNumber: 35, group: 'I', homeTeam: 'France',           awayTeam: 'IC Playoff 2',    startsAt: '2026-06-22T21:00:00Z', venue: 'Lincoln Financial Field',  city: 'Philadelphia' },
  { matchNumber: 36, group: 'I', homeTeam: 'Norway',           awayTeam: 'Senegal',         startsAt: '2026-06-23T00:00:00Z', venue: 'MetLife Stadium',          city: 'East Rutherford' },
  { matchNumber: 53, group: 'I', homeTeam: 'Norway',           awayTeam: 'France',          startsAt: '2026-06-26T19:00:00Z', venue: 'Gillette Stadium',         city: 'Foxborough' },
  { matchNumber: 54, group: 'I', homeTeam: 'Senegal',          awayTeam: 'IC Playoff 2',    startsAt: '2026-06-26T19:00:00Z', venue: 'BMO Field',                city: 'Toronto' },

  // ── Group J: Argentina · Algeria · Austria · Jordan ──────────────────────
  { matchNumber: 55, group: 'J', homeTeam: 'Argentina',        awayTeam: 'Algeria',         startsAt: '2026-06-17T01:00:00Z', venue: 'Arrowhead Stadium',        city: 'Kansas City' },
  { matchNumber: 56, group: 'J', homeTeam: 'Austria',          awayTeam: 'Jordan',          startsAt: '2026-06-16T04:00:00Z', venue: "Levi's Stadium",           city: 'Santa Clara' },
  { matchNumber: 57, group: 'J', homeTeam: 'Argentina',        awayTeam: 'Austria',         startsAt: '2026-06-22T17:00:00Z', venue: 'AT&T Stadium',             city: 'Arlington' },
  { matchNumber: 58, group: 'J', homeTeam: 'Jordan',           awayTeam: 'Algeria',         startsAt: '2026-06-23T03:00:00Z', venue: "Levi's Stadium",           city: 'Santa Clara' },
  { matchNumber: 59, group: 'J', homeTeam: 'Jordan',           awayTeam: 'Argentina',       startsAt: '2026-06-28T02:00:00Z', venue: 'AT&T Stadium',             city: 'Arlington' },
  { matchNumber: 60, group: 'J', homeTeam: 'Algeria',          awayTeam: 'Austria',         startsAt: '2026-06-28T02:00:00Z', venue: 'Arrowhead Stadium',        city: 'Kansas City' },

  // ── Group K: Portugal · IC Playoff 1 · Uzbekistan · Colombia ─────────────
  { matchNumber: 61, group: 'K', homeTeam: 'Portugal',         awayTeam: 'IC Playoff 1',    startsAt: '2026-06-17T17:00:00Z', venue: 'NRG Stadium',              city: 'Houston' },
  { matchNumber: 62, group: 'K', homeTeam: 'Uzbekistan',       awayTeam: 'Colombia',        startsAt: '2026-06-18T02:00:00Z', venue: 'Estadio Azteca',           city: 'Mexico City' },
  { matchNumber: 63, group: 'K', homeTeam: 'Portugal',         awayTeam: 'Uzbekistan',      startsAt: '2026-06-23T17:00:00Z', venue: 'NRG Stadium',              city: 'Houston' },
  { matchNumber: 64, group: 'K', homeTeam: 'Colombia',         awayTeam: 'IC Playoff 1',    startsAt: '2026-06-24T02:00:00Z', venue: 'Estadio Akron',            city: 'Guadalajara' },
  { matchNumber: 65, group: 'K', homeTeam: 'Colombia',         awayTeam: 'Portugal',        startsAt: '2026-06-27T23:30:00Z', venue: 'Hard Rock Stadium',        city: 'Miami' },
  { matchNumber: 66, group: 'K', homeTeam: 'IC Playoff 1',     awayTeam: 'Uzbekistan',      startsAt: '2026-06-27T23:30:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta' },

  // ── Group L: England · Croatia · Ghana · Panama ───────────────────────────
  { matchNumber: 67, group: 'L', homeTeam: 'England',          awayTeam: 'Croatia',         startsAt: '2026-06-17T20:00:00Z', venue: 'AT&T Stadium',             city: 'Arlington' },
  { matchNumber: 68, group: 'L', homeTeam: 'Ghana',            awayTeam: 'Panama',          startsAt: '2026-06-17T23:00:00Z', venue: 'BMO Field',                city: 'Toronto' },
  { matchNumber: 69, group: 'L', homeTeam: 'England',          awayTeam: 'Ghana',           startsAt: '2026-06-23T20:00:00Z', venue: 'Gillette Stadium',         city: 'Foxborough' },
  { matchNumber: 70, group: 'L', homeTeam: 'Panama',           awayTeam: 'Croatia',         startsAt: '2026-06-23T23:00:00Z', venue: 'BMO Field',                city: 'Toronto' },
  { matchNumber: 71, group: 'L', homeTeam: 'Panama',           awayTeam: 'England',         startsAt: '2026-06-27T21:00:00Z', venue: 'MetLife Stadium',          city: 'East Rutherford' },
  { matchNumber: 72, group: 'L', homeTeam: 'Croatia',          awayTeam: 'Ghana',           startsAt: '2026-06-27T21:00:00Z', venue: 'Lincoln Financial Field',  city: 'Philadelphia' },

  // ── Round of 32 ───────────────────────────────────────────────────────────
  { matchNumber: 73,  group: '-', stage: 'r32', homeTeam: '1st Group A',          awayTeam: 'Runner-up Group B',    startsAt: '2026-06-28T19:00:00Z', venue: 'MetLife Stadium',          city: 'East Rutherford' },
  { matchNumber: 74,  group: '-', stage: 'r32', homeTeam: '1st Group C',          awayTeam: 'Runner-up Group D',    startsAt: '2026-06-28T23:00:00Z', venue: 'AT&T Stadium',             city: 'Arlington' },
  { matchNumber: 75,  group: '-', stage: 'r32', homeTeam: 'Runner-up Group A',    awayTeam: '1st Group B',          startsAt: '2026-06-29T19:00:00Z', venue: 'SoFi Stadium',             city: 'Inglewood' },
  { matchNumber: 76,  group: '-', stage: 'r32', homeTeam: 'Runner-up Group C',    awayTeam: '1st Group D',          startsAt: '2026-06-29T23:00:00Z', venue: 'NRG Stadium',              city: 'Houston' },
  { matchNumber: 77,  group: '-', stage: 'r32', homeTeam: '1st Group E',          awayTeam: 'Runner-up Group F',    startsAt: '2026-06-30T19:00:00Z', venue: 'Hard Rock Stadium',        city: 'Miami' },
  { matchNumber: 78,  group: '-', stage: 'r32', homeTeam: '1st Group G',          awayTeam: 'Runner-up Group H',    startsAt: '2026-06-30T23:00:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta' },
  { matchNumber: 79,  group: '-', stage: 'r32', homeTeam: 'Runner-up Group E',    awayTeam: '1st Group F',          startsAt: '2026-07-01T19:00:00Z', venue: 'Lumen Field',              city: 'Seattle' },
  { matchNumber: 80,  group: '-', stage: 'r32', homeTeam: 'Runner-up Group G',    awayTeam: '1st Group H',          startsAt: '2026-07-01T23:00:00Z', venue: 'BC Place',                 city: 'Vancouver' },
  { matchNumber: 81,  group: '-', stage: 'r32', homeTeam: '1st Group I',          awayTeam: 'Runner-up Group J',    startsAt: '2026-07-02T19:00:00Z', venue: 'Lincoln Financial Field',  city: 'Philadelphia' },
  { matchNumber: 82,  group: '-', stage: 'r32', homeTeam: '1st Group K',          awayTeam: 'Runner-up Group L',    startsAt: '2026-07-02T23:00:00Z', venue: 'Gillette Stadium',         city: 'Foxborough' },
  { matchNumber: 83,  group: '-', stage: 'r32', homeTeam: 'Runner-up Group I',    awayTeam: '1st Group J',          startsAt: '2026-07-03T19:00:00Z', venue: 'Arrowhead Stadium',        city: 'Kansas City' },
  { matchNumber: 84,  group: '-', stage: 'r32', homeTeam: 'Runner-up Group K',    awayTeam: '1st Group L',          startsAt: '2026-07-03T23:00:00Z', venue: 'BMO Field',                city: 'Toronto' },
  { matchNumber: 85,  group: '-', stage: 'r32', homeTeam: 'Best 3rd (A/B/C)',     awayTeam: 'Best 3rd (D/E/F)',     startsAt: '2026-07-04T01:00:00Z', venue: 'Estadio Azteca',           city: 'Mexico City' },
  { matchNumber: 86,  group: '-', stage: 'r32', homeTeam: 'Best 3rd (G/H/I)',     awayTeam: 'Best 3rd (J/K/L)',     startsAt: '2026-07-04T05:00:00Z', venue: 'Estadio Akron',            city: 'Guadalajara' },
  { matchNumber: 87,  group: '-', stage: 'r32', homeTeam: 'Best 3rd Qualifier',   awayTeam: 'Best 3rd Qualifier',   startsAt: '2026-07-04T21:00:00Z', venue: 'Estadio BBVA',             city: 'Monterrey' },
  { matchNumber: 88,  group: '-', stage: 'r32', homeTeam: 'Best 3rd Qualifier',   awayTeam: 'Best 3rd Qualifier',   startsAt: '2026-07-05T01:00:00Z', venue: 'Estadio Azteca',           city: 'Mexico City' },

  // ── Round of 16 ───────────────────────────────────────────────────────────
  { matchNumber: 89,  group: '-', stage: 'r16', homeTeam: 'Winner Match 73',      awayTeam: 'Winner Match 74',      startsAt: '2026-07-05T19:00:00Z', venue: 'MetLife Stadium',          city: 'East Rutherford' },
  { matchNumber: 90,  group: '-', stage: 'r16', homeTeam: 'Winner Match 75',      awayTeam: 'Winner Match 76',      startsAt: '2026-07-05T23:00:00Z', venue: 'AT&T Stadium',             city: 'Arlington' },
  { matchNumber: 91,  group: '-', stage: 'r16', homeTeam: 'Winner Match 77',      awayTeam: 'Winner Match 78',      startsAt: '2026-07-06T19:00:00Z', venue: 'SoFi Stadium',             city: 'Inglewood' },
  { matchNumber: 92,  group: '-', stage: 'r16', homeTeam: 'Winner Match 79',      awayTeam: 'Winner Match 80',      startsAt: '2026-07-06T23:00:00Z', venue: 'NRG Stadium',              city: 'Houston' },
  { matchNumber: 93,  group: '-', stage: 'r16', homeTeam: 'Winner Match 81',      awayTeam: 'Winner Match 82',      startsAt: '2026-07-07T19:00:00Z', venue: 'Hard Rock Stadium',        city: 'Miami' },
  { matchNumber: 94,  group: '-', stage: 'r16', homeTeam: 'Winner Match 83',      awayTeam: 'Winner Match 84',      startsAt: '2026-07-07T23:00:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta' },
  { matchNumber: 95,  group: '-', stage: 'r16', homeTeam: 'Winner Match 85',      awayTeam: 'Winner Match 86',      startsAt: '2026-07-08T19:00:00Z', venue: 'Lumen Field',              city: 'Seattle' },
  { matchNumber: 96,  group: '-', stage: 'r16', homeTeam: 'Winner Match 87',      awayTeam: 'Winner Match 88',      startsAt: '2026-07-08T23:00:00Z', venue: 'BC Place',                 city: 'Vancouver' },

  // ── Quarter-Finals ────────────────────────────────────────────────────────
  { matchNumber: 97,  group: '-', stage: 'qf',  homeTeam: 'Winner Match 89',      awayTeam: 'Winner Match 90',      startsAt: '2026-07-09T23:00:00Z', venue: 'MetLife Stadium',          city: 'East Rutherford' },
  { matchNumber: 98,  group: '-', stage: 'qf',  homeTeam: 'Winner Match 91',      awayTeam: 'Winner Match 92',      startsAt: '2026-07-10T23:00:00Z', venue: 'AT&T Stadium',             city: 'Arlington' },
  { matchNumber: 99,  group: '-', stage: 'qf',  homeTeam: 'Winner Match 93',      awayTeam: 'Winner Match 94',      startsAt: '2026-07-11T19:00:00Z', venue: 'SoFi Stadium',             city: 'Inglewood' },
  { matchNumber: 100, group: '-', stage: 'qf',  homeTeam: 'Winner Match 95',      awayTeam: 'Winner Match 96',      startsAt: '2026-07-11T23:00:00Z', venue: 'NRG Stadium',              city: 'Houston' },

  // ── Semi-Finals ───────────────────────────────────────────────────────────
  { matchNumber: 101, group: '-', stage: 'sf',  homeTeam: 'Winner Match 97',      awayTeam: 'Winner Match 98',      startsAt: '2026-07-14T23:00:00Z', venue: 'MetLife Stadium',          city: 'East Rutherford' },
  { matchNumber: 102, group: '-', stage: 'sf',  homeTeam: 'Winner Match 99',      awayTeam: 'Winner Match 100',     startsAt: '2026-07-15T23:00:00Z', venue: 'AT&T Stadium',             city: 'Arlington' },

  // ── Third-Place Play-Off ──────────────────────────────────────────────────
  { matchNumber: 103, group: '-', stage: 'third', homeTeam: 'Loser Match 101',    awayTeam: 'Loser Match 102',      startsAt: '2026-07-18T19:00:00Z', venue: 'Hard Rock Stadium',        city: 'Miami' },

  // ── Final ─────────────────────────────────────────────────────────────────
  { matchNumber: 104, group: '-', stage: 'final', homeTeam: 'Winner Match 101',   awayTeam: 'Winner Match 102',     startsAt: '2026-07-19T23:00:00Z', venue: 'MetLife Stadium',          city: 'East Rutherford' },
];
