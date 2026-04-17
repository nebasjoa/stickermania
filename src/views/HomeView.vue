<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import CountryLabel from '../components/CountryLabel.vue';
import LocationLabel from '../components/LocationLabel.vue';
import {
  homeMeetups,
  homeLeaderboard,
  homeRecentCollectors,
  groupStandings,
  predictions
} from '../store.js';

const { t } = useI18n();

const KICKOFF = new Date('2026-06-11T19:00:00.000Z');
const TOURNAMENT_TABS = {
  standings: 'standings',
  knockout: 'knockout'
};
const KNOCKOUT_STAGE_LABELS = {
  r32: 'Round of 32',
  r16: 'Round of 16',
  qf: 'Quarter-Finals',
  sf: 'Semi-Finals',
  third: '3rd Place',
  final: 'Final'
};

const countdown = reactive({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
const activeTournamentTab = ref(TOURNAMENT_TABS.standings);
const selectedMatchDate = ref('');
const localKickoffTime = KICKOFF.toLocaleString(undefined, {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
});

const allMatchDates = computed(() =>
  [...new Set(predictions.value.map((game) => new Date(game.startsAt).toISOString().slice(0, 10)))]
    .sort((a, b) => a.localeCompare(b))
);

const matchesByDate = computed(() => {
  const grouped = {};
  for (const game of predictions.value) {
    const dateKey = new Date(game.startsAt).toISOString().slice(0, 10);
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(game);
  }
  return grouped;
});

const selectedMatchDateIndex = computed(() => allMatchDates.value.indexOf(selectedMatchDate.value));

const selectedMatches = computed(() =>
  matchesByDate.value[selectedMatchDate.value] || []
);

const knockoutGamesByStage = computed(() => {
  const stages = {};
  for (const game of predictions.value) {
    if (!game.stage || game.stage === 'group') continue;
    if (!stages[game.stage]) stages[game.stage] = [];
    stages[game.stage].push(game);
  }
  return stages;
});

const orderedKnockoutStages = computed(() =>
  Object.entries(KNOCKOUT_STAGE_LABELS)
    .map(([key, label]) => ({
      key,
      label,
      games: knockoutGamesByStage.value[key] || []
    }))
    .filter((stage) => stage.games.length)
);

let countdownInterval = null;

function updateCountdown() {
  const diff = KICKOFF - Date.now();
  if (diff <= 0) {
    countdown.expired = true;
    countdown.days = countdown.hours = countdown.minutes = countdown.seconds = 0;
    clearInterval(countdownInterval);
    return;
  }
  countdown.days = Math.floor(diff / 86_400_000);
  countdown.hours = Math.floor((diff % 86_400_000) / 3_600_000);
  countdown.minutes = Math.floor((diff % 3_600_000) / 60_000);
  countdown.seconds = Math.floor((diff % 60_000) / 1_000);
}

function formatMeetupDate(iso) {
  return new Date(iso).toLocaleString();
}

function formatKickoff(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatFullKickoff(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatMatchDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00Z').toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
  });
}

function matchLabel(game) {
  if (game.stage && game.stage !== 'group') {
    return `${KNOCKOUT_STAGE_LABELS[game.stage] || 'Knockout'} - #${game.matchNumber}`;
  }
  return `Group ${game.group} - #${game.matchNumber}`;
}

function moveMatchDate(step) {
  if (selectedMatchDateIndex.value < 0) return;
  const nextIndex = selectedMatchDateIndex.value + step;
  if (nextIndex < 0 || nextIndex >= allMatchDates.value.length) return;
  selectedMatchDate.value = allMatchDates.value[nextIndex];
}

watch(
  allMatchDates,
  (dates) => {
    if (!dates.length) {
      selectedMatchDate.value = '';
      return;
    }

    if (dates.includes(selectedMatchDate.value)) {
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    selectedMatchDate.value = dates.find((date) => date >= today) || dates[0];
  },
  { immediate: true }
);

function knockoutScore(game) {
  if (game.actualHome == null) return 'vs';
  return `${game.actualHome} - ${game.actualAway}`;
}

onMounted(() => {
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
  clearInterval(countdownInterval);
});
</script>

<template>
  <section class="hero card">
    <div>
      <p class="eyebrow">{{ t('heroEyebrow') }}</p>
      <h1>{{ t('heroTitle') }}</h1>
      <p>{{ t('heroBody') }}</p>
    </div>

    <div class="countdown-wrap">
      <p class="countdown-label">
        <template v-if="!countdown.expired">KICKOFF IN</template>
        <template v-else>THE WORLD CUP HAS STARTED!</template>
      </p>
      <div v-if="!countdown.expired" class="countdown-tiles">
        <div class="countdown-tile">
          <span class="countdown-value">{{ String(countdown.days).padStart(2, '0') }}</span>
          <span class="countdown-unit">days</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-tile">
          <span class="countdown-value">{{ String(countdown.hours).padStart(2, '0') }}</span>
          <span class="countdown-unit">hrs</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-tile">
          <span class="countdown-value">{{ String(countdown.minutes).padStart(2, '0') }}</span>
          <span class="countdown-unit">min</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-tile">
          <span class="countdown-value">{{ String(countdown.seconds).padStart(2, '0') }}</span>
          <span class="countdown-unit">sec</span>
        </div>
      </div>
      <p class="countdown-localtime">{{ localKickoffTime }}</p>
    </div>

    <div class="hero-grid">
      <div class="info-box">
        <strong>{{ t('searchTitle') }}</strong>
        <p>{{ t('searchHelp') }}</p>
      </div>
      <div class="info-box">
        <strong>{{ t('meetupsTitle') }}</strong>
        <p>{{ t('meetupHelp') }}</p>
      </div>
    </div>
  </section>

  <section class="panini-promo card">
    <img src="https://paninistore.com/media/logo/Panini.png" alt="Panini" class="panini-logo" />
    <div class="panini-promo-text">
      <h2>Get the Official Album</h2>
      <p>Order the official Panini FIFA World Cup 2026™ sticker album and starter pack.</p>
    </div>
    <a href="https://paninistore.com/shp_int_en/catalog/category/view/s/albums-stickers-and-cards/id/12721/" target="_blank" rel="noopener noreferrer" class="btn">Shop Panini</a>
  </section>

  <section v-if="allMatchDates.length" class="card">
    <div class="card-top">
      <div>
        <p class="eyebrow">World Cup 2026</p>
        <h2>Matches - {{ formatMatchDate(selectedMatchDate) }}</h2>
      </div>
      <RouterLink to="/predictions" class="btn secondary">Predict</RouterLink>
    </div>
    <div class="matches-carousel-toolbar">
      <div class="matches-carousel-nav">
        <button
          type="button"
          class="matches-carousel-arrow"
          :disabled="selectedMatchDateIndex <= 0"
          aria-label="Previous match date"
          @click="moveMatchDate(-1)"
        >
          ‹
        </button>
        <button
          type="button"
          class="matches-carousel-arrow"
          :disabled="selectedMatchDateIndex === -1 || selectedMatchDateIndex >= allMatchDates.length - 1"
          aria-label="Next match date"
          @click="moveMatchDate(1)"
        >
          ›
        </button>
      </div>

      <label class="matches-date-picker">
        <span>Date</span>
        <input
          v-model="selectedMatchDate"
          type="date"
          :min="allMatchDates[0]"
          :max="allMatchDates[allMatchDates.length - 1]"
        />
      </label>
    </div>
    <div class="matches-grid">
      <article v-for="game in selectedMatches" :key="game.id" class="match-card">
        <div class="match-group">{{ matchLabel(game) }}</div>
        <div class="match-teams">
          <CountryLabel class="match-team home" :country="game.homeTeam" />
          <span class="match-sep">vs</span>
          <CountryLabel class="match-team away" :country="game.awayTeam" />
        </div>
        <div class="match-meta">
          <span class="match-time">{{ formatKickoff(game.startsAt) }}</span>
          <span class="match-venue">{{ game.city }}</span>
        </div>
      </article>
    </div>
    <p v-if="selectedMatchDate && !selectedMatches.length" class="home-panel-empty">
      No games scheduled for {{ formatMatchDate(selectedMatchDate) }}.
    </p>
  </section>

  <section v-if="Object.keys(groupStandings).length || orderedKnockoutStages.length" class="card stack">
    <div class="card-top">
      <div>
        <p class="eyebrow">World Cup 2026</p>
        <h2>{{ activeTournamentTab === TOURNAMENT_TABS.standings ? 'Group Standings' : 'Knockout Phase' }}</h2>
      </div>
    </div>

    <div class="home-tournament-tabs">
      <button
        type="button"
        class="home-tournament-tab"
        :class="{ active: activeTournamentTab === TOURNAMENT_TABS.standings }"
        @click="activeTournamentTab = TOURNAMENT_TABS.standings"
      >
        Group Standings
      </button>
      <button
        type="button"
        class="home-tournament-tab"
        :class="{ active: activeTournamentTab === TOURNAMENT_TABS.knockout }"
        @click="activeTournamentTab = TOURNAMENT_TABS.knockout"
      >
        Knockout Phase
      </button>
    </div>

    <div v-if="activeTournamentTab === TOURNAMENT_TABS.standings" class="standings-grid">
      <div v-for="(teams, group) in groupStandings" :key="group" class="standings-group">
        <div class="standings-group-header">Group {{ group }}</div>
        <table class="standings-table">
          <thead>
            <tr>
              <th class="col-team">Team</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(team, i) in teams" :key="team.name" :class="{ 'qualify-row': i < 2 }">
              <td class="col-team"><CountryLabel :country="team.name" /></td>
              <td>{{ team.played }}</td>
              <td>{{ team.won }}</td>
              <td>{{ team.drawn }}</td>
              <td>{{ team.lost }}</td>
              <td>{{ team.gd > 0 ? '+' + team.gd : team.gd }}</td>
              <td class="col-pts">{{ team.pts }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="home-knockout-stages">
      <section v-for="stage in orderedKnockoutStages" :key="stage.key" class="home-knockout-stage">
        <h3 class="knockout-stage-header">{{ stage.label }}</h3>
        <div class="home-knockout-grid">
          <article v-for="game in stage.games" :key="game.id" class="home-knockout-card">
            <div class="home-knockout-meta">
              <span>Match {{ game.matchNumber }}</span>
              <span>{{ formatFullKickoff(game.startsAt) }}</span>
            </div>
            <div class="home-knockout-teams">
              <CountryLabel class="home-knockout-team" :country="game.homeTeam" />
              <span class="home-knockout-score">{{ knockoutScore(game) }}</span>
              <CountryLabel class="home-knockout-team" :country="game.awayTeam" />
            </div>
            <div class="home-knockout-venue">{{ game.venue }}, {{ game.city }}</div>
          </article>
        </div>
      </section>
    </div>
  </section>

  <div class="home-panels-grid">
    <section class="card stack">
      <div class="card-top">
        <div>
          <p class="eyebrow">{{ t('navMeetups') }}</p>
          <h2>{{ t('meetupBrowseTitle') }}</h2>
        </div>
        <RouterLink to="/meetups" class="btn secondary">{{ t('navMeetups') }}</RouterLink>
      </div>
      <div v-if="!homeMeetups.length" class="home-panel-empty">{{ t('meetupEmpty') }}</div>
      <article v-for="meetup in homeMeetups" :key="`home-meetup-${meetup.id}`" class="home-panel-item">
        <div class="home-panel-item-top">
          <strong>{{ meetup.title }}</strong>
          <span class="pill">{{ meetup.attendee_count }} going</span>
        </div>
        <p class="home-panel-item-sub"><LocationLabel :city="meetup.city" :country="meetup.country" /></p>
        <p class="home-panel-item-date">{{ formatMeetupDate(meetup.starts_at) }}</p>
      </article>
    </section>

    <section class="card stack">
      <div class="card-top">
        <div>
          <p class="eyebrow">Predictions</p>
          <h2>Top Predictors</h2>
        </div>
        <div class="home-card-actions">
          <RouterLink to="/predictions/leaderboard" class="btn secondary">Show all</RouterLink>
          <RouterLink to="/predictions" class="btn secondary">Predict</RouterLink>
        </div>
      </div>
      <div v-if="!homeLeaderboard.length" class="home-panel-empty">No predictions yet.</div>
      <article v-for="(entry, index) in homeLeaderboard" :key="`lb-${entry.username}`" class="home-panel-item">
        <div class="home-panel-item-top">
          <span class="home-rank">{{ index + 1 }}</span>
          <strong>{{ entry.username }}</strong>
          <span class="pill">{{ entry.points }} pts</span>
        </div>
        <p class="home-panel-item-sub"><LocationLabel :city="entry.city" :country="entry.country" /></p>
      </article>
    </section>

    <section class="card stack">
      <div class="card-top">
        <div>
          <p class="eyebrow">Community</p>
          <h2>New Collectors</h2>
        </div>
        <RouterLink to="/search" class="btn secondary">{{ t('navSearch') }}</RouterLink>
      </div>
      <div v-if="!homeRecentCollectors.length" class="home-panel-empty">No collectors yet.</div>
      <article v-for="collector in homeRecentCollectors" :key="`collector-${collector.id}`" class="home-panel-item">
        <div class="home-panel-item-top">
          <strong>{{ collector.username }}</strong>
        </div>
        <p class="home-panel-item-sub"><LocationLabel :city="collector.city" :country="collector.country" /></p>
      </article>
    </section>
  </div>
</template>
