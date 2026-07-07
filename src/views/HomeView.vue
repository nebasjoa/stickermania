<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import CountryLabel from '../components/CountryLabel.vue';
import LocationLabel from '../components/LocationLabel.vue';
import api from '../api.js';
import { STICKER_CODES } from '../data/stickers.js';
import {
  homeMeetups,
  homeLeaderboard,
  homeRecentCollectors,
  groupStandings,
  predictions
} from '../store.js';

const { t } = useI18n();

const TOTAL_STICKERS = STICKER_CODES.length;
function collectorProgress(needsCount) {
  return Math.round(Math.max(0, (TOTAL_STICKERS - Number(needsCount)) / TOTAL_STICKERS * 100));
}

const KICKOFF = new Date('2026-06-11T19:00:00.000Z');
const FINAL = new Date('2026-07-19T20:00:00.000Z');
const TOURNAMENT_TABS = {
  standings: 'standings',
  knockout: 'knockout'
};
const knockoutStageLabelMap = computed(() => ({
  r32: t('knockoutR32'),
  r16: t('knockoutR16'),
  qf: t('knockoutQF'),
  sf: t('knockoutSF'),
  third: t('knockoutThird'),
  final: t('knockoutFinal')
}));

const countdown = reactive({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
const activeTournamentTab = ref(TOURNAMENT_TABS.standings);

const tournamentDay = computed(() =>
  Math.min(39, Math.floor((Date.now() - KICKOFF.getTime()) / 86_400_000) + 1)
);
const daysToFinal = computed(() =>
  Math.max(0, Math.ceil((FINAL.getTime() - Date.now()) / 86_400_000))
);
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
  Object.entries(knockoutStageLabelMap.value)
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
    return `${knockoutStageLabelMap.value[game.stage] || t('predKnockout')} - #${game.matchNumber}`;
  }
  return `${t('standingsGroupLabel', { group: game.group })} - #${game.matchNumber}`;
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

const suggestionOpen = ref(false);
const suggestionMessage = ref('');
const suggestionSending = ref(false);
const suggestionDone = ref(false);

async function submitSuggestion() {
  if (!suggestionMessage.value.trim() || suggestionSending.value) return;
  suggestionSending.value = true;
  try {
    await api.post('/suggestions', { message: suggestionMessage.value });
    suggestionDone.value = true;
    suggestionMessage.value = '';
  } finally {
    suggestionSending.value = false;
  }
}

function openSuggestion() {
  suggestionDone.value = false;
  suggestionMessage.value = '';
  suggestionOpen.value = true;
}

function closeSuggestion() {
  suggestionOpen.value = false;
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

    <div v-if="!countdown.expired" class="countdown-wrap">
      <p class="countdown-label">{{ t('countdownIn') }}</p>
      <div class="countdown-tiles">
        <div class="countdown-tile">
          <span class="countdown-value">{{ String(countdown.days).padStart(2, '0') }}</span>
          <span class="countdown-unit">{{ t('countdownDays') }}</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-tile">
          <span class="countdown-value">{{ String(countdown.hours).padStart(2, '0') }}</span>
          <span class="countdown-unit">{{ t('countdownHrs') }}</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-tile">
          <span class="countdown-value">{{ String(countdown.minutes).padStart(2, '0') }}</span>
          <span class="countdown-unit">{{ t('countdownMin') }}</span>
        </div>
        <span class="countdown-sep">:</span>
        <div class="countdown-tile">
          <span class="countdown-value">{{ String(countdown.seconds).padStart(2, '0') }}</span>
          <span class="countdown-unit">{{ t('countdownSec') }}</span>
        </div>
      </div>
      <p class="countdown-localtime">{{ localKickoffTime }}</p>
    </div>

    <div v-else class="live-banner">
      <span class="live-badge">LIVE</span>
      <p class="live-banner-label">{{ t('liveBannerLabel') }}</p>
      <div class="live-banner-stats">
        <div class="live-stat">
          <span class="live-stat-value">{{ tournamentDay }}</span>
          <span class="live-stat-unit">/ 39</span>
          <span class="live-stat-label">{{ t('liveTournamentDay') }}</span>
        </div>
        <div class="live-stat-divider"></div>
        <div class="live-stat">
          <span class="live-stat-value">{{ daysToFinal }}</span>
          <span class="live-stat-label">{{ t('liveDaysToFinal') }}</span>
        </div>
      </div>
      <RouterLink to="/predictions" class="live-banner-cta btn">{{ t('livePredictCta') }}</RouterLink>
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
      <h2>{{ t('paniniTitle') }}</h2>
      <p>{{ t('paniniBody') }}</p>
    </div>
    <a href="https://paninistore.com/shp_int_en/catalog/category/view/s/albums-stickers-and-cards/id/12721/" target="_blank" rel="noopener noreferrer" class="btn">{{ t('paniniShop') }}</a>
  </section>

  <section v-if="allMatchDates.length" class="card">
    <div class="card-top">
      <div>
        <p class="eyebrow">World Cup 2026</p>
        <h2>{{ t('matchesHeading') }} - {{ formatMatchDate(selectedMatchDate) }}</h2>
      </div>
      <RouterLink to="/predictions" class="btn secondary">{{ t('matchPredict') }}</RouterLink>
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
        <span>{{ t('matchesDate') }}</span>
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
      {{ t('matchesNoGames', { date: formatMatchDate(selectedMatchDate) }) }}
    </p>
  </section>

  <section v-if="Object.keys(groupStandings).length || orderedKnockoutStages.length" class="card stack">
    <div class="card-top">
      <div>
        <p class="eyebrow">World Cup 2026</p>
        <h2>{{ activeTournamentTab === TOURNAMENT_TABS.standings ? t('groupStandings') : t('knockoutPhase') }}</h2>
      </div>
    </div>

    <div class="home-tournament-tabs">
      <button
        type="button"
        class="home-tournament-tab"
        :class="{ active: activeTournamentTab === TOURNAMENT_TABS.standings }"
        @click="activeTournamentTab = TOURNAMENT_TABS.standings"
      >
        {{ t('groupStandings') }}
      </button>
      <button
        type="button"
        class="home-tournament-tab"
        :class="{ active: activeTournamentTab === TOURNAMENT_TABS.knockout }"
        @click="activeTournamentTab = TOURNAMENT_TABS.knockout"
      >
        {{ t('knockoutPhase') }}
      </button>
    </div>

    <div v-if="activeTournamentTab === TOURNAMENT_TABS.standings" class="standings-grid">
      <div v-for="(teams, group) in groupStandings" :key="group" class="standings-group">
        <div class="standings-group-header">{{ t('standingsGroupLabel', { group }) }}</div>
        <table class="standings-table">
          <thead>
            <tr>
              <th class="col-team">{{ t('lbColUser') }}</th>
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
              <span>{{ t('predMatchNum', { n: game.matchNumber }) }}</span>
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
          <span class="pill">{{ meetup.attendee_count }} {{ t('attendeeGoing') }}</span>
        </div>
        <p class="home-panel-item-sub"><LocationLabel :city="meetup.city" :country="meetup.country" /></p>
        <p class="home-panel-item-date">{{ formatMeetupDate(meetup.starts_at) }}</p>
      </article>
    </section>

    <section class="card stack">
      <div class="card-top">
        <div>
          <p class="eyebrow">{{ t('lbEyebrow') }}</p>
          <h2>{{ t('topPredictors') }}</h2>
        </div>
        <div class="home-card-actions">
          <RouterLink to="/predictions/leaderboard" class="btn secondary">{{ t('showAll') }}</RouterLink>
          <RouterLink to="/predictions" class="btn secondary">{{ t('matchPredict') }}</RouterLink>
        </div>
      </div>
      <div v-if="!homeLeaderboard.length" class="home-panel-empty">{{ t('noPredictionsYet') }}</div>
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
          <p class="eyebrow">{{ t('communityEyebrow') }}</p>
          <h2>{{ t('newCollectors') }}</h2>
        </div>
        <RouterLink to="/search" class="btn secondary">{{ t('navSearch') }}</RouterLink>
      </div>
      <div v-if="!homeRecentCollectors.length" class="home-panel-empty">{{ t('noCollectorsYet') }}</div>
      <article v-for="collector in homeRecentCollectors.slice(0, 3)" :key="`collector-${collector.id}`" class="home-panel-item">
        <div class="home-panel-item-top">
          <RouterLink :to="`/profile/${collector.username}`" class="collector-username-link">{{ collector.username }}</RouterLink>
        </div>
        <p class="home-panel-item-sub"><LocationLabel :city="collector.city" :country="collector.country" /></p>
        <p class="home-panel-item-progress">Progress: {{ collectorProgress(collector.needs_count) }}%</p>
      </article>
    </section>
  </div>

  <Teleport to="body">
    <button class="suggestion-fab" type="button" @click="openSuggestion" :aria-label="t('suggestionButtonLabel')">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <span>{{ t('suggestionButtonLabel') }}</span>
    </button>

    <transition name="modal">
      <div v-if="suggestionOpen" class="modal-overlay" @click.self="closeSuggestion">
        <div class="modal-box suggestion-modal" role="dialog" :aria-label="t('suggestionTitle')">
          <div class="modal-header">
            <h2>{{ t('suggestionTitle') }}</h2>
            <button type="button" class="modal-close" @click="closeSuggestion" aria-label="Close">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div v-if="suggestionDone" class="suggestion-sent">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="suggestion-sent-icon">
              <circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>
            </svg>
            <p>{{ t('suggestionSent') }}</p>
            <button type="button" class="secondary" @click="closeSuggestion">{{ t('cancel') }}</button>
          </div>

          <form v-else class="suggestion-form" @submit.prevent="submitSuggestion">
            <p class="suggestion-subtitle">{{ t('suggestionSubtitle') }}</p>
            <textarea
              v-model="suggestionMessage"
              class="suggestion-textarea"
              :placeholder="t('suggestionPlaceholder')"
              rows="5"
              maxlength="2000"
              required
              autofocus
            ></textarea>
            <div class="suggestion-footer">
              <span class="suggestion-count">{{ suggestionMessage.length }} / 2000</span>
              <button type="submit" :disabled="suggestionSending || !suggestionMessage.trim()">{{ t('suggestionSend') }}</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </Teleport>
</template>
