<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CountryLabel from '../components/CountryLabel.vue';
import {
  isAuthenticated, loading, predictions, predictionDrafts, predictionSaved,
  activePredictionGroup, activeKnockoutStage, savePrediction
} from '../store.js';

const { t, te } = useI18n();

const countrySearch = ref('');

const PREDICTION_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];
const KNOCKOUT_STAGES = computed(() => [
  { key: 'r32', label: t('knockoutR32') },
  { key: 'r16', label: t('knockoutR16') },
  { key: 'qf', label: t('knockoutQF') },
  { key: 'sf', label: t('knockoutSF') },
  { key: 'third', label: t('knockoutThird') },
  { key: 'final', label: t('knockoutFinal') },
]);

const gamesByGroup = computed(() => {
  const groups = {};
  for (const game of predictions.value) {
    if (game.stage !== 'group') continue;
    if (!groups[game.group]) groups[game.group] = [];
    groups[game.group].push(game);
  }
  return groups;
});

const knockoutByStage = computed(() => {
  const stages = {};
  for (const game of predictions.value) {
    if (!game.stage || game.stage === 'group') continue;
    if (!stages[game.stage]) stages[game.stage] = [];
    stages[game.stage].push(game);
  }
  return stages;
});

function teamMatchesCountrySearch(teamCode, query) {
  const code = String(teamCode || '');
  const translated = te(`countries.${code}`) ? t(`countries.${code}`) : '';
  return code.toLowerCase().includes(query) || translated.toLowerCase().includes(query);
}

function gameMatchesCountrySearch(game) {
  const query = countrySearch.value.trim().toLowerCase();
  if (!query) return true;
  return teamMatchesCountrySearch(game.homeTeam, query) || teamMatchesCountrySearch(game.awayTeam, query);
}

const visibleGroupGames = computed(() =>
  (gamesByGroup.value[activePredictionGroup.value] || []).filter(gameMatchesCountrySearch)
);

const visibleKnockoutGames = computed(() =>
  (knockoutByStage.value[activeKnockoutStage.value] || []).filter(gameMatchesCountrySearch)
);

const scoredPredictions = computed(() =>
  predictions.value.filter((game) => game.prediction?.points != null)
);

const totalPredictionPoints = computed(() =>
  scoredPredictions.value.reduce((sum, game) => sum + Number(game.prediction?.points || 0), 0)
);

const exactPredictionCount = computed(() =>
  scoredPredictions.value.filter((game) => Number(game.prediction?.points) === 3).length
);

const outcomePredictionCount = computed(() =>
  scoredPredictions.value.filter((game) => Number(game.prediction?.points) === 1).length
);

const pendingPredictionCount = computed(() =>
  predictions.value.filter((game) => game.prediction && game.prediction.points == null).length
);

function isGameLocked(game) {
  return new Date(game.startsAt) <= new Date();
}

function formatGameDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function canSubmitPrediction(game) {
  const draft = predictionDrafts[game.id];
  const isEmpty = draft.home === '' && draft.away === '';
  const hasBothScores = draft.home !== '' && draft.away !== '';
  if (!hasBothScores && !(isEmpty && Boolean(game.prediction))) {
    return false;
  }

  if (game.stage === 'group') {
    return true;
  }

  if (draft.penaltiesPlayed && !draft.extraTimePlayed) {
    return false;
  }

  if (draft.extraTimePlayed && (draft.extraHome === '' || draft.extraAway === '')) {
    return false;
  }

  if (draft.penaltiesPlayed && (draft.penaltiesHome === '' || draft.penaltiesAway === '')) {
    return false;
  }

  return true;
}

function predictionActionLabel(game) {
  const draft = predictionDrafts[game.id];
  if (draft.home === '' && draft.away === '' && game.prediction) {
    return t('predClear');
  }
  return t('predSave');
}

function handleExtraTimeToggle(gameId) {
  const draft = predictionDrafts[gameId];
  if (draft.extraTimePlayed) return;
  draft.extraHome = '';
  draft.extraAway = '';
  draft.penaltiesPlayed = false;
  draft.penaltiesHome = '';
  draft.penaltiesAway = '';
}

function handlePenaltiesToggle(gameId) {
  const draft = predictionDrafts[gameId];
  if (draft.penaltiesPlayed) return;
  draft.penaltiesHome = '';
  draft.penaltiesAway = '';
}

function knockoutActualSummary(game) {
  const parts = [];

  if (game.actualHome != null) {
    parts.push(`90': ${game.actualHome} - ${game.actualAway}`);
  }

  if (game.actualExtraTimePlayed && game.actualExtraHome != null) {
    parts.push(`AET: ${game.actualExtraHome} - ${game.actualExtraAway}`);
  }

  if (game.actualPenaltiesPlayed && game.actualPenaltiesHome != null) {
    parts.push(`Pens: ${game.actualPenaltiesHome} - ${game.actualPenaltiesAway}`);
  }

  return parts.join(' | ');
}
</script>

<template>
  <section>
    <article class="card">
      <h2>{{ t('predMatchesTitle') }}</h2>
      <p v-if="!isAuthenticated" class="card-intro">{{ t('predLoginNotice') }}</p>
      <div class="group-tabs">
        <button
          v-for="group in PREDICTION_GROUPS"
          :key="group"
          type="button"
          class="group-tab"
          :class="{ active: activePredictionGroup === group }"
          @click="activePredictionGroup = group"
        >
          <span class="group-tab-label">{{ t('predGroup') }}</span> {{ group }}
        </button>
        <button
          type="button"
          class="group-tab knockout-tab"
          :class="{ active: activePredictionGroup === 'KO' }"
          @click="activePredictionGroup = 'KO'"
        >
          {{ t('predKnockout') }}
        </button>
      </div>
    </article>

    <article class="card prediction-points-card">
      <div class="prediction-points-head">
        <div>
          <h3>{{ t('predictionPointsTitle') }}</h3>
          <p>{{ t('predictionPointsScored', { scored: scoredPredictions.length, pending: pendingPredictionCount }) }}</p>
        </div>
        <strong class="prediction-points-total">
          {{ totalPredictionPoints }} {{ t('predictionPointsUnit', totalPredictionPoints) }}
        </strong>
      </div>
      <div class="prediction-points-grid">
        <div class="prediction-points-item">
          <span class="prediction-points-value">{{ exactPredictionCount }}</span>
          <span class="prediction-points-label">{{ t('predictionPointsExact') }}</span>
        </div>
        <div class="prediction-points-item">
          <span class="prediction-points-value">{{ outcomePredictionCount }}</span>
          <span class="prediction-points-label">{{ t('predictionPointsOutcome') }}</span>
        </div>
        <div class="prediction-points-item">
          <span class="prediction-points-value">{{ pendingPredictionCount }}</span>
          <span class="prediction-points-label">{{ t('predictionPointsPending') }}</span>
        </div>
      </div>
      <p class="prediction-points-rules">{{ t('predictionPointsRulesTitle') }}</p>
      <ul class="prediction-points-rules-list">
        <li>{{ t('predictionPointsRuleExact') }}</li>
        <li>{{ t('predictionPointsRuleOutcome') }}</li>
        <li>{{ t('predictionPointsRuleMiss') }}</li>
      </ul>
    </article>

    <article class="card country-search-card">
      <label for="country-search" class="country-search-label">{{ t('predCountrySearchLabel') }}</label>
      <input
        id="country-search"
        v-model="countrySearch"
        type="text"
        class="country-search-input"
        :placeholder="t('predCountrySearchPlaceholder')"
      />
    </article>

    <div v-if="activePredictionGroup !== 'KO'" class="prediction-list">
      <article
        v-for="game in visibleGroupGames"
        :key="game.id"
        class="card prediction-game"
        :class="{ locked: isGameLocked(game) }"
      >
        <div class="prediction-game-meta">
          <span class="game-match-num">{{ t('predMatchNum', { n: game.matchNumber }) }}</span>
          <span class="game-datetime">{{ formatGameDate(game.startsAt) }}</span>
          <span class="game-venue">{{ game.venue }}, {{ game.city }}</span>
          <span v-if="isGameLocked(game)" class="pill muted">{{ t('predLocked') }}</span>
        </div>

        <div class="prediction-matchup">
          <CountryLabel class="pred-team home" :country="game.homeTeam" />
          <input
            v-model="predictionDrafts[game.id].home"
            type="number" min="0" max="20"
            class="score-input home-score"
            :disabled="isGameLocked(game) || !isAuthenticated"
            placeholder="-"
          />
          <span class="pred-sep">:</span>
          <input
            v-model="predictionDrafts[game.id].away"
            type="number" min="0" max="20"
            class="score-input away-score"
            :disabled="isGameLocked(game) || !isAuthenticated"
            placeholder="-"
          />
          <CountryLabel class="pred-team away" :country="game.awayTeam" />
          <div v-if="game.actualHome != null" class="actual-result">
            {{ t('predFinalScore', { home: game.actualHome, away: game.actualAway }) }}
          </div>
        </div>

        <div class="prediction-footer">
          <span v-if="game.prediction?.points != null" :class="['points-badge', `points-badge--${game.prediction.points}`]">
            {{ game.prediction.points }} pt{{ game.prediction.points !== 1 ? 's' : '' }}
          </span>
          <span v-else-if="predictionSaved[game.id]" class="pred-saved">{{ t('predSaved') }}</span>
          <button
            v-if="!isGameLocked(game) && isAuthenticated"
            type="button"
            class="pred-save-btn"
            :disabled="loading || !canSubmitPrediction(game)"
            @click="savePrediction(game.id)"
          >{{ predictionActionLabel(game) }}</button>
        </div>
      </article>

      <article v-if="!visibleGroupGames.length" class="card">
        <p v-if="countrySearch.trim()">{{ t('predNoGamesSearch', { query: countrySearch.trim() }) }}</p>
        <p v-else>{{ t('predNoGamesGroup', { group: activePredictionGroup }) }}</p>
      </article>
    </div>

    <div v-else class="prediction-list">
      <article class="card knockout-stage-nav">
        <div class="knockout-stage-tabs">
          <button
            v-for="stage in KNOCKOUT_STAGES"
            :key="stage.key"
            type="button"
            class="knockout-stage-tab"
            :class="{ active: activeKnockoutStage === stage.key }"
            @click="activeKnockoutStage = stage.key"
          >
            {{ stage.label }}
          </button>
        </div>
      </article>

      <template v-for="stage in KNOCKOUT_STAGES" :key="stage.key">
        <template v-if="activeKnockoutStage === stage.key">
          <h3 class="knockout-stage-header">{{ stage.label }}</h3>
          <article
            v-for="game in visibleKnockoutGames"
            :key="game.id"
            class="card prediction-game"
            :class="{ locked: isGameLocked(game) }"
          >
            <div class="prediction-game-meta">
              <span class="game-match-num">{{ t('predMatchNum', { n: game.matchNumber }) }}</span>
              <span class="game-datetime">{{ formatGameDate(game.startsAt) }}</span>
              <span class="game-venue">{{ game.venue }}, {{ game.city }}</span>
              <span v-if="isGameLocked(game)" class="pill muted">{{ t('predLocked') }}</span>
            </div>

            <div class="prediction-matchup">
              <CountryLabel class="pred-team home" :country="game.homeTeam" />
              <input
                v-model="predictionDrafts[game.id].home"
                type="number" min="0" max="20"
                class="score-input home-score"
                :disabled="isGameLocked(game) || !isAuthenticated"
                placeholder="-"
              />
              <span class="pred-sep">:</span>
              <input
                v-model="predictionDrafts[game.id].away"
                type="number" min="0" max="20"
                class="score-input away-score"
                :disabled="isGameLocked(game) || !isAuthenticated"
                placeholder="-"
              />
              <CountryLabel class="pred-team away" :country="game.awayTeam" />
              <div v-if="game.actualHome != null" class="actual-result">
                {{ knockoutActualSummary(game) }}
              </div>
            </div>

            <div class="knockout-prediction-options">
              <label class="knockout-toggle">
                <input
                  v-model="predictionDrafts[game.id].extraTimePlayed"
                  type="checkbox"
                  :disabled="isGameLocked(game) || !isAuthenticated"
                  @change="handleExtraTimeToggle(game.id)"
                />
                <span>{{ t('predExtraTime') }}</span>
              </label>

              <div class="knockout-score-row" :class="{ disabled: !predictionDrafts[game.id].extraTimePlayed }">
                <span class="knockout-score-label">{{ t('predAfterET') }}</span>
                <div class="pred-scores">
                  <input
                    v-model="predictionDrafts[game.id].extraHome"
                    type="number" min="0" max="20"
                    class="score-input knockout-score-input"
                    :disabled="!predictionDrafts[game.id].extraTimePlayed || isGameLocked(game) || !isAuthenticated"
                    placeholder="-"
                  />
                  <span class="pred-sep">:</span>
                  <input
                    v-model="predictionDrafts[game.id].extraAway"
                    type="number" min="0" max="20"
                    class="score-input knockout-score-input"
                    :disabled="!predictionDrafts[game.id].extraTimePlayed || isGameLocked(game) || !isAuthenticated"
                    placeholder="-"
                  />
                </div>
              </div>

              <label class="knockout-toggle">
                <input
                  v-model="predictionDrafts[game.id].penaltiesPlayed"
                  type="checkbox"
                  :disabled="!predictionDrafts[game.id].extraTimePlayed || isGameLocked(game) || !isAuthenticated"
                  @change="handlePenaltiesToggle(game.id)"
                />
                <span>{{ t('predPenalties') }}</span>
              </label>

              <div class="knockout-score-row" :class="{ disabled: !predictionDrafts[game.id].penaltiesPlayed }">
                <span class="knockout-score-label">{{ t('predPens') }}</span>
                <div class="pred-scores">
                  <input
                    v-model="predictionDrafts[game.id].penaltiesHome"
                    type="number" min="0" max="20"
                    class="score-input knockout-score-input"
                    :disabled="!predictionDrafts[game.id].penaltiesPlayed || isGameLocked(game) || !isAuthenticated"
                    placeholder="-"
                  />
                  <span class="pred-sep">:</span>
                  <input
                    v-model="predictionDrafts[game.id].penaltiesAway"
                    type="number" min="0" max="20"
                    class="score-input knockout-score-input"
                    :disabled="!predictionDrafts[game.id].penaltiesPlayed || isGameLocked(game) || !isAuthenticated"
                    placeholder="-"
                  />
                </div>
              </div>
            </div>

            <div class="prediction-footer">
              <span v-if="game.prediction?.points != null" :class="['points-badge', `points-badge--${game.prediction.points}`]">
                {{ game.prediction.points }} pt{{ game.prediction.points !== 1 ? 's' : '' }}
              </span>
              <span v-else-if="predictionSaved[game.id]" class="pred-saved">{{ t('predSaved') }}</span>
              <button
                v-if="!isGameLocked(game) && isAuthenticated"
                type="button"
                class="pred-save-btn"
                :disabled="loading || !canSubmitPrediction(game)"
                @click="savePrediction(game.id)"
              >{{ predictionActionLabel(game) }}</button>
            </div>
          </article>

          <article v-if="!visibleKnockoutGames.length" class="card">
            <p v-if="countrySearch.trim()">{{ t('predNoGamesSearch', { query: countrySearch.trim() }) }}</p>
            <p v-else>{{ t('predNoGamesStage') }}</p>
          </article>
        </template>
      </template>
    </div>
  </section>
</template>
