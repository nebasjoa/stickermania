// All 72 FIFA World Cup 2026 group stage fixtures + knockout stage.
// Kickoff times stored in UTC (source times were BST = UTC+1).
export const games = [
  // ── Group A: Mexico · South Africa · Korea Republic · Czechia ───────────
  { matchNumber: 1,  group: 'A', homeTeam: 'Mexico',           awayTeam: 'South Africa',    startsAt: '2026-06-11T19:00:00Z', venue: 'Estadio Azteca',           city: 'Mexico City' },
  { matchNumber: 2,  group: 'A', homeTeam: 'Korea Republic',   awayTeam: 'Czechia',          startsAt: '2026-06-12T02:00:00Z', venue: 'Estadio Akron',            city: 'Guadalajara' },
  { matchNumber: 19, group: 'A', homeTeam: 'Czechia',          awayTeam: 'South Africa',    startsAt: '2026-06-18T16:00:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta' },
  { matchNumber: 20, group: 'A', homeTeam: 'Mexico',           awayTeam: 'Korea Republic',  startsAt: '2026-06-19T01:00:00Z', venue: 'Estadio Akron',            city: 'Guadalajara' },
  { matchNumber: 37, group: 'A', homeTeam: 'Czechia',          awayTeam: 'Mexico',          startsAt: '2026-06-25T01:00:00Z', venue: 'Estadio Azteca',           city: 'Mexico City' },
  { matchNumber: 38, group: 'A', homeTeam: 'South Africa',     awayTeam: 'Korea Republic',  startsAt: '2026-06-25T01:00:00Z', venue: 'Estadio BBVA',             city: 'Monterrey' },

  // ── Group B: Canada · Bosnia and Herzegovina · Qatar · Switzerland ───────
  { matchNumber: 3,  group: 'B', homeTeam: 'Canada',                  awayTeam: 'Bosnia and Herzegovina', startsAt: '2026-06-12T19:00:00Z', venue: 'BMO Field',                city: 'Toronto' },
  { matchNumber: 4,  group: 'B', homeTeam: 'Qatar',                   awayTeam: 'Switzerland',            startsAt: '2026-06-13T19:00:00Z', venue: "Levi's Stadium",           city: 'Santa Clara' },
  { matchNumber: 21, group: 'B', homeTeam: 'Switzerland',             awayTeam: 'Bosnia and Herzegovina', startsAt: '2026-06-18T19:00:00Z', venue: 'SoFi Stadium',             city: 'Inglewood' },
  { matchNumber: 22, group: 'B', homeTeam: 'Canada',                  awayTeam: 'Qatar',                  startsAt: '2026-06-18T22:00:00Z', venue: 'BC Place',                 city: 'Vancouver' },
  { matchNumber: 39, group: 'B', homeTeam: 'Switzerland',             awayTeam: 'Canada',                 startsAt: '2026-06-24T19:00:00Z', venue: 'BC Place',                 city: 'Vancouver' },
  { matchNumber: 40, group: 'B', homeTeam: 'Bosnia and Herzegovina',  awayTeam: 'Qatar',                  startsAt: '2026-06-24T19:00:00Z', venue: 'Lumen Field',              city: 'Seattle' },

  // ── Group C: Brazil · Morocco · Haiti · Scotland ─────────────────────────
  { matchNumber: 5,  group: 'C', homeTeam: 'Brazil',           awayTeam: 'Morocco',         startsAt: '2026-06-13T22:00:00Z', venue: 'MetLife Stadium',          city: 'East Rutherford' },
  { matchNumber: 6,  group: 'C', homeTeam: 'Haiti',            awayTeam: 'Scotland',        startsAt: '2026-06-14T01:00:00Z', venue: 'Gillette Stadium',         city: 'Foxborough' },
  { matchNumber: 23, group: 'C', homeTeam: 'Scotland',         awayTeam: 'Morocco',         startsAt: '2026-06-19T22:00:00Z', venue: 'Gillette Stadium',         city: 'Foxborough' },
  { matchNumber: 24, group: 'C', homeTeam: 'Brazil',           awayTeam: 'Haiti',           startsAt: '2026-06-20T00:30:00Z', venue: 'Lincoln Financial Field',  city: 'Philadelphia' },
  { matchNumber: 41, group: 'C', homeTeam: 'Scotland',         awayTeam: 'Brazil',          startsAt: '2026-06-24T22:00:00Z', venue: 'Hard Rock Stadium',        city: 'Miami' },
  { matchNumber: 42, group: 'C', homeTeam: 'Morocco',          awayTeam: 'Haiti',           startsAt: '2026-06-24T22:00:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta' },

  // ── Group D: United States · Paraguay · Australia · Türkiye ─────────────
  { matchNumber: 7,  group: 'D', homeTeam: 'United States',    awayTeam: 'Paraguay',        startsAt: '2026-06-13T01:00:00Z', venue: 'SoFi Stadium',             city: 'Inglewood' },
  { matchNumber: 8,  group: 'D', homeTeam: 'Australia',        awayTeam: 'Türkiye',         startsAt: '2026-06-14T04:00:00Z', venue: 'BC Place',                 city: 'Vancouver' },
  { matchNumber: 25, group: 'D', homeTeam: 'Türkiye',          awayTeam: 'Paraguay',        startsAt: '2026-06-20T03:00:00Z', venue: "Levi's Stadium",           city: 'Santa Clara' },
  { matchNumber: 26, group: 'D', homeTeam: 'United States',    awayTeam: 'Australia',       startsAt: '2026-06-19T19:00:00Z', venue: 'Lumen Field',              city: 'Seattle' },
  { matchNumber: 43, group: 'D', homeTeam: 'Türkiye',          awayTeam: 'United States',   startsAt: '2026-06-26T02:00:00Z', venue: 'SoFi Stadium',             city: 'Inglewood' },
  { matchNumber: 44, group: 'D', homeTeam: 'Paraguay',         awayTeam: 'Australia',       startsAt: '2026-06-26T02:00:00Z', venue: "Levi's Stadium",           city: 'Santa Clara' },

  // ── Group E: Germany · Curaçao · Ivory Coast · Ecuador ───────────────────
  { matchNumber: 9,  group: 'E', homeTeam: 'Germany',          awayTeam: 'Curaçao',         startsAt: '2026-06-14T17:00:00Z', venue: 'NRG Stadium',              city: 'Houston' },
  { matchNumber: 10, group: 'E', homeTeam: 'Ivory Coast',      awayTeam: 'Ecuador',         startsAt: '2026-06-14T23:00:00Z', venue: 'Lincoln Financial Field',  city: 'Philadelphia' },
  { matchNumber: 27, group: 'E', homeTeam: 'Germany',          awayTeam: 'Ivory Coast',     startsAt: '2026-06-20T20:00:00Z', venue: 'BMO Field',                city: 'Toronto' },
  { matchNumber: 28, group: 'E', homeTeam: 'Ecuador',          awayTeam: 'Curaçao',         startsAt: '2026-06-21T00:00:00Z', venue: 'Arrowhead Stadium',        city: 'Kansas City' },
  { matchNumber: 45, group: 'E', homeTeam: 'Curaçao',          awayTeam: 'Ivory Coast',     startsAt: '2026-06-25T20:00:00Z', venue: 'Lincoln Financial Field',  city: 'Philadelphia' },
  { matchNumber: 46, group: 'E', homeTeam: 'Ecuador',          awayTeam: 'Germany',         startsAt: '2026-06-25T20:00:00Z', venue: 'MetLife Stadium',          city: 'East Rutherford' },

  // ── Group F: Netherlands · Japan · Sweden · Tunisia ─────────────────────
  { matchNumber: 11, group: 'F', homeTeam: 'Netherlands',      awayTeam: 'Japan',           startsAt: '2026-06-14T20:00:00Z', venue: 'AT&T Stadium',             city: 'Arlington' },
  { matchNumber: 12, group: 'F', homeTeam: 'Sweden',           awayTeam: 'Tunisia',         startsAt: '2026-06-15T02:00:00Z', venue: 'Estadio BBVA',             city: 'Monterrey' },
  { matchNumber: 29, group: 'F', homeTeam: 'Netherlands',      awayTeam: 'Sweden',          startsAt: '2026-06-20T17:00:00Z', venue: 'NRG Stadium',              city: 'Houston' },
  { matchNumber: 30, group: 'F', homeTeam: 'Tunisia',          awayTeam: 'Japan',           startsAt: '2026-06-21T04:00:00Z', venue: 'Estadio BBVA',             city: 'Monterrey' },
  { matchNumber: 47, group: 'F', homeTeam: 'Japan',            awayTeam: 'Sweden',          startsAt: '2026-06-25T23:00:00Z', venue: 'AT&T Stadium',             city: 'Arlington' },
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

  // ── Group I: France · Senegal · Iraq · Norway ────────────────────────────
  { matchNumber: 17, group: 'I', homeTeam: 'France',           awayTeam: 'Senegal',         startsAt: '2026-06-16T19:00:00Z', venue: 'MetLife Stadium',          city: 'East Rutherford' },
  { matchNumber: 18, group: 'I', homeTeam: 'Iraq',             awayTeam: 'Norway',          startsAt: '2026-06-16T22:00:00Z', venue: 'Gillette Stadium',         city: 'Foxborough' },
  { matchNumber: 35, group: 'I', homeTeam: 'France',           awayTeam: 'Iraq',            startsAt: '2026-06-22T21:00:00Z', venue: 'Lincoln Financial Field',  city: 'Philadelphia' },
  { matchNumber: 36, group: 'I', homeTeam: 'Norway',           awayTeam: 'Senegal',         startsAt: '2026-06-23T00:00:00Z', venue: 'MetLife Stadium',          city: 'East Rutherford' },
  { matchNumber: 53, group: 'I', homeTeam: 'Norway',           awayTeam: 'France',          startsAt: '2026-06-26T19:00:00Z', venue: 'Gillette Stadium',         city: 'Foxborough' },
  { matchNumber: 54, group: 'I', homeTeam: 'Senegal',          awayTeam: 'Iraq',            startsAt: '2026-06-26T19:00:00Z', venue: 'BMO Field',                city: 'Toronto' },

  // ── Group J: Argentina · Algeria · Austria · Jordan ──────────────────────
  { matchNumber: 55, group: 'J', homeTeam: 'Argentina',        awayTeam: 'Algeria',         startsAt: '2026-06-17T01:00:00Z', venue: 'Arrowhead Stadium',        city: 'Kansas City' },
  { matchNumber: 56, group: 'J', homeTeam: 'Austria',          awayTeam: 'Jordan',          startsAt: '2026-06-17T04:00:00Z', venue: "Levi's Stadium",           city: 'Santa Clara' },
  { matchNumber: 57, group: 'J', homeTeam: 'Argentina',        awayTeam: 'Austria',         startsAt: '2026-06-22T17:00:00Z', venue: 'AT&T Stadium',             city: 'Arlington' },
  { matchNumber: 58, group: 'J', homeTeam: 'Jordan',           awayTeam: 'Algeria',         startsAt: '2026-06-23T03:00:00Z', venue: "Levi's Stadium",           city: 'Santa Clara' },
  { matchNumber: 59, group: 'J', homeTeam: 'Jordan',           awayTeam: 'Argentina',       startsAt: '2026-06-28T02:00:00Z', venue: 'AT&T Stadium',             city: 'Arlington' },
  { matchNumber: 60, group: 'J', homeTeam: 'Algeria',          awayTeam: 'Austria',         startsAt: '2026-06-28T02:00:00Z', venue: 'Arrowhead Stadium',        city: 'Kansas City' },

  // ── Group K: Portugal · DR Congo · Uzbekistan · Colombia ────────────────
  { matchNumber: 61, group: 'K', homeTeam: 'Portugal',         awayTeam: 'DR Congo',        startsAt: '2026-06-17T17:00:00Z', venue: 'NRG Stadium',              city: 'Houston' },
  { matchNumber: 62, group: 'K', homeTeam: 'Uzbekistan',       awayTeam: 'Colombia',        startsAt: '2026-06-18T02:00:00Z', venue: 'Estadio Azteca',           city: 'Mexico City' },
  { matchNumber: 63, group: 'K', homeTeam: 'Portugal',         awayTeam: 'Uzbekistan',      startsAt: '2026-06-23T17:00:00Z', venue: 'NRG Stadium',              city: 'Houston' },
  { matchNumber: 64, group: 'K', homeTeam: 'Colombia',         awayTeam: 'DR Congo',        startsAt: '2026-06-24T02:00:00Z', venue: 'Estadio Akron',            city: 'Guadalajara' },
  { matchNumber: 65, group: 'K', homeTeam: 'Colombia',         awayTeam: 'Portugal',        startsAt: '2026-06-27T23:30:00Z', venue: 'Hard Rock Stadium',        city: 'Miami' },
  { matchNumber: 66, group: 'K', homeTeam: 'DR Congo',         awayTeam: 'Uzbekistan',      startsAt: '2026-06-27T23:30:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta' },

  // ── Group L: England · Croatia · Ghana · Panama ───────────────────────────
  { matchNumber: 67, group: 'L', homeTeam: 'England',          awayTeam: 'Croatia',         startsAt: '2026-06-17T20:00:00Z', venue: 'AT&T Stadium',             city: 'Arlington' },
  { matchNumber: 68, group: 'L', homeTeam: 'Ghana',            awayTeam: 'Panama',          startsAt: '2026-06-17T23:00:00Z', venue: 'BMO Field',                city: 'Toronto' },
  { matchNumber: 69, group: 'L', homeTeam: 'England',          awayTeam: 'Ghana',           startsAt: '2026-06-23T20:00:00Z', venue: 'Gillette Stadium',         city: 'Foxborough' },
  { matchNumber: 70, group: 'L', homeTeam: 'Panama',           awayTeam: 'Croatia',         startsAt: '2026-06-23T23:00:00Z', venue: 'BMO Field',                city: 'Toronto' },
  { matchNumber: 71, group: 'L', homeTeam: 'Panama',           awayTeam: 'England',         startsAt: '2026-06-27T21:00:00Z', venue: 'MetLife Stadium',          city: 'East Rutherford' },
  { matchNumber: 72, group: 'L', homeTeam: 'Croatia',          awayTeam: 'Ghana',           startsAt: '2026-06-27T21:00:00Z', venue: 'Lincoln Financial Field',  city: 'Philadelphia' },

  // ── Round of 32 ───────────────────────────────────────────────────────────
  { matchNumber: 73,  group: '-', stage: 'r32', homeTeam: 'South Africa',         awayTeam: 'Canada',                   startsAt: '2026-06-28T19:00:00Z', venue: 'SoFi Stadium',             city: 'Inglewood' },
  { matchNumber: 74,  group: '-', stage: 'r32', homeTeam: 'Germany',              awayTeam: 'Paraguay',                 startsAt: '2026-06-29T20:30:00Z', venue: 'Gillette Stadium',         city: 'Foxborough' },
  { matchNumber: 75,  group: '-', stage: 'r32', homeTeam: 'Netherlands',          awayTeam: 'Morocco',                  startsAt: '2026-06-30T01:00:00Z', venue: 'Estadio Akron',            city: 'Guadalajara' },
  { matchNumber: 76,  group: '-', stage: 'r32', homeTeam: 'Brazil',               awayTeam: 'Japan',                    startsAt: '2026-06-29T17:00:00Z', venue: 'NRG Stadium',              city: 'Houston' },
  { matchNumber: 77,  group: '-', stage: 'r32', homeTeam: 'France',               awayTeam: 'Sweden',                   startsAt: '2026-06-30T21:00:00Z', venue: 'MetLife Stadium',          city: 'East Rutherford' },
  { matchNumber: 78,  group: '-', stage: 'r32', homeTeam: 'Ivory Coast',          awayTeam: 'Norway',                   startsAt: '2026-06-30T17:00:00Z', venue: 'AT&T Stadium',             city: 'Arlington' },
  { matchNumber: 79,  group: '-', stage: 'r32', homeTeam: 'Mexico',               awayTeam: 'Ecuador',                  startsAt: '2026-07-01T01:00:00Z', venue: 'Estadio Azteca',           city: 'Mexico City' },
  { matchNumber: 80,  group: '-', stage: 'r32', homeTeam: 'England',              awayTeam: 'DR Congo',                 startsAt: '2026-07-01T16:00:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta' },
  { matchNumber: 81,  group: '-', stage: 'r32', homeTeam: 'United States',        awayTeam: 'Bosnia and Herzegovina',   startsAt: '2026-07-02T00:00:00Z', venue: "Levi's Stadium",           city: 'Santa Clara' },
  { matchNumber: 82,  group: '-', stage: 'r32', homeTeam: 'Belgium',              awayTeam: 'Senegal',                  startsAt: '2026-07-01T20:00:00Z', venue: 'Lumen Field',              city: 'Seattle' },
  { matchNumber: 83,  group: '-', stage: 'r32', homeTeam: 'Portugal',             awayTeam: 'Croatia',                  startsAt: '2026-07-02T23:00:00Z', venue: 'BMO Field',                city: 'Toronto' },
  { matchNumber: 84,  group: '-', stage: 'r32', homeTeam: 'Spain',                awayTeam: 'Austria',                  startsAt: '2026-07-02T19:00:00Z', venue: 'SoFi Stadium',             city: 'Inglewood' },
  { matchNumber: 85,  group: '-', stage: 'r32', homeTeam: 'Switzerland',          awayTeam: 'Algeria',                  startsAt: '2026-07-03T03:00:00Z', venue: 'BC Place',                 city: 'Vancouver' },
  { matchNumber: 86,  group: '-', stage: 'r32', homeTeam: 'Argentina',            awayTeam: 'Cape Verde',               startsAt: '2026-07-03T22:00:00Z', venue: 'Hard Rock Stadium',        city: 'Miami' },
  { matchNumber: 87,  group: '-', stage: 'r32', homeTeam: 'Colombia',             awayTeam: 'Ghana',                    startsAt: '2026-07-04T01:30:00Z', venue: 'Arrowhead Stadium',        city: 'Kansas City' },
  { matchNumber: 88,  group: '-', stage: 'r32', homeTeam: 'Australia',            awayTeam: 'Egypt',                    startsAt: '2026-07-03T18:00:00Z', venue: 'AT&T Stadium',             city: 'Arlington' },

  // ── Round of 16 ───────────────────────────────────────────────────────────
  { matchNumber: 89,  group: '-', stage: 'r16', homeTeam: 'Paraguay',             awayTeam: 'France',               startsAt: '2026-07-04T21:00:00Z', venue: 'Lincoln Financial Field',  city: 'Philadelphia' },
  { matchNumber: 90,  group: '-', stage: 'r16', homeTeam: 'Canada',               awayTeam: 'Morocco',              startsAt: '2026-07-04T17:00:00Z', venue: 'NRG Stadium',              city: 'Houston' },
  { matchNumber: 91,  group: '-', stage: 'r16', homeTeam: 'Brazil',               awayTeam: 'Norway',               startsAt: '2026-07-05T20:00:00Z', venue: 'MetLife Stadium',          city: 'East Rutherford' },
  { matchNumber: 92,  group: '-', stage: 'r16', homeTeam: 'Mexico',               awayTeam: 'England',              startsAt: '2026-07-06T00:00:00Z', venue: 'Estadio Azteca',           city: 'Mexico City' },
  { matchNumber: 93,  group: '-', stage: 'r16', homeTeam: 'Portugal',             awayTeam: 'Spain',                startsAt: '2026-07-06T19:00:00Z', venue: 'AT&T Stadium',             city: 'Arlington' },
  { matchNumber: 94,  group: '-', stage: 'r16', homeTeam: 'United States',        awayTeam: 'Belgium',              startsAt: '2026-07-07T00:00:00Z', venue: 'Lumen Field',              city: 'Seattle' },
  { matchNumber: 95,  group: '-', stage: 'r16', homeTeam: 'Argentina',            awayTeam: 'Egypt',                startsAt: '2026-07-07T16:00:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta' },
  { matchNumber: 96,  group: '-', stage: 'r16', homeTeam: 'Switzerland',          awayTeam: 'Colombia',             startsAt: '2026-07-07T20:00:00Z', venue: 'BC Place',                 city: 'Vancouver' },

  // ── Quarter-Finals ────────────────────────────────────────────────────────
  { matchNumber: 97,  group: '-', stage: 'qf',  homeTeam: 'Winner Match 89',      awayTeam: 'Winner Match 90',      startsAt: '2026-07-09T20:00:00Z', venue: 'Gillette Stadium',         city: 'Foxborough' },
  { matchNumber: 98,  group: '-', stage: 'qf',  homeTeam: 'Winner Match 93',      awayTeam: 'Winner Match 94',      startsAt: '2026-07-10T19:00:00Z', venue: 'SoFi Stadium',             city: 'Inglewood' },
  { matchNumber: 99,  group: '-', stage: 'qf',  homeTeam: 'Winner Match 91',      awayTeam: 'Winner Match 92',      startsAt: '2026-07-11T21:00:00Z', venue: 'Hard Rock Stadium',        city: 'Miami' },
  { matchNumber: 100, group: '-', stage: 'qf',  homeTeam: 'Winner Match 95',      awayTeam: 'Winner Match 96',      startsAt: '2026-07-12T01:00:00Z', venue: 'Arrowhead Stadium',        city: 'Kansas City' },

  // ── Semi-Finals ───────────────────────────────────────────────────────────
  { matchNumber: 101, group: '-', stage: 'sf',  homeTeam: 'Winner Match 97',      awayTeam: 'Winner Match 98',      startsAt: '2026-07-14T19:00:00Z', venue: 'AT&T Stadium',             city: 'Arlington' },
  { matchNumber: 102, group: '-', stage: 'sf',  homeTeam: 'Winner Match 99',      awayTeam: 'Winner Match 100',     startsAt: '2026-07-15T19:00:00Z', venue: 'Mercedes-Benz Stadium',    city: 'Atlanta' },

  // ── Third-Place Play-Off ──────────────────────────────────────────────────
  { matchNumber: 103, group: '-', stage: 'third', homeTeam: 'Loser Match 101',    awayTeam: 'Loser Match 102',      startsAt: '2026-07-18T21:00:00Z', venue: 'Hard Rock Stadium',        city: 'Miami' },

  // ── Final ─────────────────────────────────────────────────────────────────
  { matchNumber: 104, group: '-', stage: 'final', homeTeam: 'Winner Match 101',   awayTeam: 'Winner Match 102',     startsAt: '2026-07-19T19:00:00Z', venue: 'MetLife Stadium',          city: 'East Rutherford' },
];
