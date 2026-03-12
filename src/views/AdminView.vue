<script setup>
import { computed, reactive } from 'vue';
import CountryLabel from '../components/CountryLabel.vue';
import { predictions, loading, saveResult } from '../store.js';

const KNOCKOUT_STAGES = [
  { key: 'r32', label: 'Round of 32' },
  { key: 'r16', label: 'Round of 16' },
  { key: 'qf', label: 'Quarter-Finals' },
  { key: 'sf', label: 'Semi-Finals' },
  { key: 'third', label: '3rd Place' },
  { key: 'final', label: 'Final' },
];

const groupGames = computed(() => {
  const groups = {};
  for (const game of predictions.value) {
    if (game.stage !== 'group') continue;
    if (!groups[game.group]) groups[game.group] = [];
    groups[game.group].push(game);
  }
  return groups;
});

const knockoutGames = computed(() => {
  const stages = {};
  for (const game of predictions.value) {
    if (!game.stage || game.stage === 'group') continue;
    if (!stages[game.stage]) stages[game.stage] = [];
    stages[game.stage].push(game);
  }
  return stages;
});

// Local drafts for result inputs, keyed by game id
const resultDrafts = reactive({});
function getResultDraft(game) {
  if (!resultDrafts[game.id]) {
    resultDrafts[game.id] = {
      home: game.actualHome ?? '',
      away: game.actualAway ?? '',
      extraTimePlayed: Boolean(game.actualExtraTimePlayed),
      extraHome: game.actualExtraHome ?? '',
      extraAway: game.actualExtraAway ?? '',
      penaltiesPlayed: Boolean(game.actualPenaltiesPlayed),
      penaltiesHome: game.actualPenaltiesHome ?? '',
      penaltiesAway: game.actualPenaltiesAway ?? ''
    };
  }
  return resultDrafts[game.id];
}

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function canSubmitResult(game) {
  const draft = getResultDraft(game);
  const isEmpty = draft.home === '' && draft.away === '';
  const hasBothScores = draft.home !== '' && draft.away !== '';
  if (!hasBothScores && !(isEmpty && game.actualHome != null)) {
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

function resultActionLabel(game) {
  const draft = getResultDraft(game);
  if (draft.home === '' && draft.away === '' && game.actualHome != null) {
    return 'Clear';
  }
  return game.actualHome != null ? 'Update' : 'Save';
}

function handleExtraTimeToggle(game) {
  const draft = getResultDraft(game);
  if (draft.extraTimePlayed) return;
  draft.extraHome = '';
  draft.extraAway = '';
  draft.penaltiesPlayed = false;
  draft.penaltiesHome = '';
  draft.penaltiesAway = '';
}

function handlePenaltiesToggle(game) {
  const draft = getResultDraft(game);
  if (draft.penaltiesPlayed) return;
  draft.penaltiesHome = '';
  draft.penaltiesAway = '';
}

async function submitResult(game) {
  const draft = getResultDraft(game);
  await saveResult(game.id, draft);
}
</script>

<template>
  <section class="stack">
    <article class="card">
      <h2>Admin - Enter Match Results</h2>
      <p class="card-intro">Set the final score for each game. Points are automatically awarded to all predictions.</p>
    </article>

    <template v-for="(games, group) in groupGames" :key="group">
      <article class="card">
        <h2>Group {{ group }}</h2>
        <div class="admin-games">
          <article v-for="game in games" :key="game.id" class="admin-game-row">
            <div class="admin-game-info">
              <span class="admin-game-num">Match {{ game.matchNumber }}</span>
              <div class="admin-game-meta">
                <span class="admin-game-date">{{ formatDate(game.startsAt) }}</span>
                <span class="admin-game-venue">{{ game.city }}</span>
              </div>
              </div>

            <div class="admin-game-result">
              <div class="admin-team admin-team-home">
                <CountryLabel class="admin-team-name" :country="game.homeTeam" />
              </div>

              <div class="admin-score-inputs">
                <input
                  v-model.number="getResultDraft(game).home"
                  type="number" min="0" max="20"
                  class="score-input admin-score-input"
                  :placeholder="game.actualHome ?? '-'"
                />
                <span class="pred-sep">:</span>
                <input
                  v-model.number="getResultDraft(game).away"
                  type="number" min="0" max="20"
                  class="score-input admin-score-input"
                  :placeholder="game.actualAway ?? '-'"
                />
              </div>

              <div class="admin-team admin-team-away">
                <CountryLabel class="admin-team-name" :country="game.awayTeam" />
              </div>

              <div class="admin-actions">
                <button
                  type="button"
                  class="admin-save-btn"
                  :disabled="loading || !canSubmitResult(game)"
                  @click="submitResult(game)"
                >{{ resultActionLabel(game) }}</button>
              </div>
            </div>
          </article>
        </div>
      </article>
    </template>

    <template v-for="stage in KNOCKOUT_STAGES" :key="stage.key">
      <article v-if="(knockoutGames[stage.key] || []).length" class="card">
        <h2>{{ stage.label }}</h2>
        <div class="admin-games">
          <article v-for="game in knockoutGames[stage.key]" :key="game.id" class="admin-game-row">
            <div class="admin-game-info">
              <span class="admin-game-num">Match {{ game.matchNumber }}</span>
              <div class="admin-game-meta">
                <span class="admin-game-date">{{ formatDate(game.startsAt) }}</span>
                <span class="admin-game-venue">{{ game.city }}</span>
              </div>
            </div>

            <div class="admin-game-result">
              <div class="admin-team admin-team-home">
                <CountryLabel class="admin-team-name" :country="game.homeTeam" />
              </div>

              <div class="admin-score-inputs">
                <input
                  v-model.number="getResultDraft(game).home"
                  type="number" min="0" max="20"
                  class="score-input admin-score-input"
                  :placeholder="game.actualHome ?? '-'"
                />
                <span class="pred-sep">:</span>
                <input
                  v-model.number="getResultDraft(game).away"
                  type="number" min="0" max="20"
                  class="score-input admin-score-input"
                  :placeholder="game.actualAway ?? '-'"
                />
              </div>

              <div class="admin-team admin-team-away">
                <CountryLabel class="admin-team-name" :country="game.awayTeam" />
              </div>

              <div class="admin-actions">
                <button
                  type="button"
                  class="admin-save-btn"
                  :disabled="loading || !canSubmitResult(game)"
                  @click="submitResult(game)"
                >{{ resultActionLabel(game) }}</button>
              </div>
            </div>

            <div class="knockout-prediction-options admin-knockout-options">
              <label class="knockout-toggle">
                <input v-model="getResultDraft(game).extraTimePlayed" type="checkbox" @change="handleExtraTimeToggle(game)" />
                <span>Extra time</span>
              </label>

              <div class="knockout-score-row" :class="{ disabled: !getResultDraft(game).extraTimePlayed }">
                <span class="knockout-score-label">After ET</span>
                <div class="pred-scores">
                  <input
                    v-model.number="getResultDraft(game).extraHome"
                    type="number" min="0" max="20"
                    class="score-input knockout-score-input"
                    :disabled="!getResultDraft(game).extraTimePlayed"
                    :placeholder="game.actualExtraHome ?? '-'"
                  />
                  <span class="pred-sep">:</span>
                  <input
                    v-model.number="getResultDraft(game).extraAway"
                    type="number" min="0" max="20"
                    class="score-input knockout-score-input"
                    :disabled="!getResultDraft(game).extraTimePlayed"
                    :placeholder="game.actualExtraAway ?? '-'"
                  />
                </div>
              </div>

              <label class="knockout-toggle">
                <input
                  v-model="getResultDraft(game).penaltiesPlayed"
                  type="checkbox"
                  :disabled="!getResultDraft(game).extraTimePlayed"
                  @change="handlePenaltiesToggle(game)"
                />
                <span>Penalties</span>
              </label>

              <div class="knockout-score-row" :class="{ disabled: !getResultDraft(game).penaltiesPlayed }">
                <span class="knockout-score-label">Pens</span>
                <div class="pred-scores">
                  <input
                    v-model.number="getResultDraft(game).penaltiesHome"
                    type="number" min="0" max="20"
                    class="score-input knockout-score-input"
                    :disabled="!getResultDraft(game).penaltiesPlayed"
                    :placeholder="game.actualPenaltiesHome ?? '-'"
                  />
                  <span class="pred-sep">:</span>
                  <input
                    v-model.number="getResultDraft(game).penaltiesAway"
                    type="number" min="0" max="20"
                    class="score-input knockout-score-input"
                    :disabled="!getResultDraft(game).penaltiesPlayed"
                    :placeholder="game.actualPenaltiesAway ?? '-'"
                  />
                </div>
              </div>
            </div>
          </article>
        </div>
      </article>
    </template>
  </section>
</template>
