<script setup>
import { computed } from 'vue';
import {
  isAuthenticated, loading, predictions, predictionDrafts, predictionSaved,
  activePredictionGroup, activeKnockoutStage, savePrediction
} from '../store.js';

const PREDICTION_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];
const KNOCKOUT_STAGES = [
  { key: 'r32',   label: 'Round of 32' },
  { key: 'r16',   label: 'Round of 16' },
  { key: 'qf',    label: 'Quarter-Finals' },
  { key: 'sf',    label: 'Semi-Finals' },
  { key: 'third', label: '3rd Place' },
  { key: 'final', label: 'Final' },
];

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

function isGameLocked(game) {
  return new Date(game.startsAt) <= new Date();
}

function formatGameDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
</script>

<template>
  <section>
    <article class="card">
      <h2>Match Predictions</h2>
      <p v-if="!isAuthenticated" style="margin:0">Login to submit your score predictions. All games are visible to everyone.</p>
      <div class="group-tabs">
        <button
          v-for="group in PREDICTION_GROUPS"
          :key="group"
          type="button"
          class="group-tab"
          :class="{ active: activePredictionGroup === group }"
          @click="activePredictionGroup = group"
        >
          <span class="group-tab-label">Group</span> {{ group }}
        </button>
        <button
          type="button"
          class="group-tab knockout-tab"
          :class="{ active: activePredictionGroup === 'KO' }"
          @click="activePredictionGroup = 'KO'"
        >
          Knockout
        </button>
      </div>
    </article>

    <!-- Group stage games -->
    <div v-if="activePredictionGroup !== 'KO'" class="prediction-list">
      <article
        v-for="game in (gamesByGroup[activePredictionGroup] || [])"
        :key="game.id"
        class="card prediction-game"
        :class="{ locked: isGameLocked(game) }"
      >
        <div class="prediction-game-meta">
          <span class="game-match-num">Match {{ game.matchNumber }}</span>
          <span class="game-datetime">{{ formatGameDate(game.startsAt) }}</span>
          <span class="game-venue">{{ game.venue }}, {{ game.city }}</span>
          <span v-if="isGameLocked(game)" class="pill muted">Locked</span>
        </div>

        <div class="prediction-matchup">
          <span class="pred-team home">{{ game.homeTeam }}</span>
          <div class="pred-scores">
            <input
              v-model="predictionDrafts[game.id].home"
              type="number" min="0" max="20"
              class="score-input"
              :disabled="isGameLocked(game) || !isAuthenticated"
              placeholder="–"
            />
            <span class="pred-sep">:</span>
            <input
              v-model="predictionDrafts[game.id].away"
              type="number" min="0" max="20"
              class="score-input"
              :disabled="isGameLocked(game) || !isAuthenticated"
              placeholder="–"
            />
          </div>
          <span class="pred-team away">{{ game.awayTeam }}</span>
        </div>

        <div class="prediction-footer">
          <span v-if="predictionSaved[game.id]" class="pred-saved">✓ Saved</span>
          <button
            v-if="!isGameLocked(game) && isAuthenticated"
            type="button"
            class="pred-save-btn"
            :disabled="loading || predictionDrafts[game.id].home === '' || predictionDrafts[game.id].away === ''"
            @click="savePrediction(game.id)"
          >Save</button>
        </div>
      </article>

      <article v-if="!(gamesByGroup[activePredictionGroup] || []).length" class="card">
        <p>No games found for Group {{ activePredictionGroup }}.</p>
      </article>
    </div>

    <!-- Knockout phase -->
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
            v-for="game in (knockoutByStage[stage.key] || [])"
            :key="game.id"
            class="card prediction-game"
            :class="{ locked: isGameLocked(game) }"
          >
            <div class="prediction-game-meta">
              <span class="game-match-num">Match {{ game.matchNumber }}</span>
              <span class="game-datetime">{{ formatGameDate(game.startsAt) }}</span>
              <span class="game-venue">{{ game.venue }}, {{ game.city }}</span>
              <span v-if="isGameLocked(game)" class="pill muted">Locked</span>
            </div>

            <div class="prediction-matchup">
              <span class="pred-team home">{{ game.homeTeam }}</span>
              <div class="pred-scores">
                <input
                  v-model="predictionDrafts[game.id].home"
                  type="number" min="0" max="20"
                  class="score-input"
                  :disabled="isGameLocked(game) || !isAuthenticated"
                  placeholder="–"
                />
                <span class="pred-sep">:</span>
                <input
                  v-model="predictionDrafts[game.id].away"
                  type="number" min="0" max="20"
                  class="score-input"
                  :disabled="isGameLocked(game) || !isAuthenticated"
                  placeholder="–"
                />
              </div>
              <span class="pred-team away">{{ game.awayTeam }}</span>
            </div>

            <div class="prediction-footer">
              <span v-if="predictionSaved[game.id]" class="pred-saved">✓ Saved</span>
              <button
                v-if="!isGameLocked(game) && isAuthenticated"
                type="button"
                class="pred-save-btn"
                :disabled="loading || predictionDrafts[game.id].home === '' || predictionDrafts[game.id].away === ''"
                @click="savePrediction(game.id)"
              >Save</button>
            </div>
          </article>

          <article v-if="!(knockoutByStage[stage.key] || []).length" class="card">
            <p>No games found for this stage.</p>
          </article>
        </template>
      </template>
    </div>
  </section>
</template>
