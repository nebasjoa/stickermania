<script setup>
import { computed, reactive } from 'vue';
import CountryLabel from '../components/CountryLabel.vue';
import { predictions, loading, saveResult } from '../store.js';

const groupGames = computed(() => {
  const groups = {};
  for (const game of predictions.value) {
    if (game.stage !== 'group') continue;
    if (!groups[game.group]) groups[game.group] = [];
    groups[game.group].push(game);
  }
  return groups;
});

// Local drafts for result inputs, keyed by game id
const resultDrafts = reactive({});
function getResultDraft(game) {
  if (!resultDrafts[game.id]) {
    resultDrafts[game.id] = {
      home: game.actualHome ?? '',
      away: game.actualAway ?? ''
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
  return hasBothScores || (isEmpty && game.actualHome != null);
}

function resultActionLabel(game) {
  const draft = getResultDraft(game);
  if (draft.home === '' && draft.away === '' && game.actualHome != null) {
    return 'Clear';
  }
  return game.actualHome != null ? 'Update' : 'Save';
}

async function submitResult(game) {
  const draft = getResultDraft(game);
  await saveResult(game.id, draft.home, draft.away);
}
</script>

<template>
  <section class="stack">
    <article class="card">
      <h2>Admin - Enter Match Results</h2>
      <p style="margin:0">Set the final score for each game. Points are automatically awarded to all predictions.</p>
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
  </section>
</template>
