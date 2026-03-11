<script setup>
import { useI18n } from 'vue-i18n';
import { currentUser, trades, loading, updateTradeStatus } from '../store.js';

const { t } = useI18n();
</script>

<template>
  <section class="card stack">
    <h2>{{ t('tradesTitle') }}</h2>
    <div v-if="!trades.length">{{ t('noTrades') }}</div>
    <article v-for="trade in trades" :key="trade.id" class="trade-row">
      <div>
        <div class="trade-header">
          <strong>
            {{ Number(trade.target_user_id) === Number(currentUser?.id) ? t('incoming') : t('outgoing') }}
          </strong>
          <span class="status" :class="`status--${trade.status}`">{{ trade.status }}</span>
        </div>
        <p>{{ trade.requester_username }} to {{ trade.target_username }}</p>
        <p><strong>{{ t('neededStickers') }}:</strong> {{ trade.requested_stickers }}</p>
        <p><strong>{{ t('offeredStickers') }}:</strong> {{ trade.offered_stickers }}</p>
        <p><strong>{{ t('tradeMethod') }}:</strong> {{ trade.trade_method === 'post' ? t('byPost') : t('inPerson') }}</p>
        <p><strong>{{ t('locationNote') }}:</strong> {{ trade.location_note || '-' }}</p>
      </div>

      <div
        v-if="Number(trade.target_user_id) === Number(currentUser?.id) && trade.status === 'pending'"
        class="action-column"
      >
        <button type="button" @click="updateTradeStatus(trade.id, 'accepted')">{{ t('accept') }}</button>
        <button type="button" class="secondary" @click="updateTradeStatus(trade.id, 'declined')">
          {{ t('decline') }}
        </button>
      </div>
    </article>
  </section>
</template>
