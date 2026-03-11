<script setup>
import { useI18n } from 'vue-i18n';
import { currentUser, trades, loading, getTradeApprovalDraft, updateTradeStatus, deleteTrade } from '../store.js';

const { t } = useI18n();

function parseStickerList(value) {
  if (!value) return [];
  return String(value)
    .split(/[,\s;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function tradeNeedsLabel(trade) {
  return t('tradeUserNeeds', { username: trade.requester_username });
}

function tradeOffersLabel(trade) {
  return t('tradeUserOffers', { username: trade.requester_username });
}

function isIncomingTrade(trade) {
  return Number(trade.target_user_id) === Number(currentUser.value?.id);
}

function showRequesterPostalAddress(trade) {
  return trade.trade_method === 'post' && trade.status === 'accepted';
}

function showRecipientPostalAddress(trade) {
  return trade.trade_method === 'post' && trade.status === 'accepted' && trade.recipient_postal_address;
}

function showRequesterFullName(trade) {
  return trade.trade_method === 'post' && trade.status === 'accepted' && trade.requester_full_name;
}

function showRecipientFullName(trade) {
  return trade.trade_method === 'post' && trade.status === 'accepted' && trade.recipient_full_name;
}

function approvalNote(trade) {
  if (trade.trade_method !== 'post') return '';
  const draft = getTradeApprovalDraft(trade.id);
  if (!draft.recipientFullName.trim() && !draft.recipientPostalAddress.trim()) {
    return t('acceptTradeNeedsNameAndAddress');
  }
  if (!draft.recipientFullName.trim()) {
    return t('acceptTradeNeedsName');
  }
  if (!draft.recipientPostalAddress.trim()) {
    return t('acceptTradeNeedsAddress');
  }
  return '';
}

function acceptTrade(trade) {
  const draft = getTradeApprovalDraft(trade.id);
  updateTradeStatus(trade.id, 'accepted', {
    recipientFullName: draft.recipientFullName,
    recipientPostalAddress: draft.recipientPostalAddress
  });
}

function canRemoveTrade(trade) {
  return trade.status === 'declined';
}
</script>

<template>
  <section class="card stack">
    <h2>{{ t('tradesTitle') }}</h2>
    <div v-if="!trades.length">{{ t('noTrades') }}</div>
    <article v-for="trade in trades" :key="trade.id" class="trade-row">
      <div class="trade-main">
        <div class="trade-header">
          <strong>
            {{ Number(trade.target_user_id) === Number(currentUser?.id) ? t('incoming') : t('outgoing') }}
          </strong>
          <span class="status" :class="`status--${trade.status}`">{{ trade.status }}</span>
        </div>
        <p>{{ trade.requester_username }} to {{ trade.target_username }}</p>
        <div class="trade-sticker-row">
          <strong>{{ tradeNeedsLabel(trade) }}:</strong>
          <div class="trade-sticker-values">
            <span v-for="sticker in parseStickerList(trade.requested_stickers)" :key="`trade-need-${trade.id}-${sticker}`" class="sticker-chip need">
              {{ sticker }}
            </span>
          </div>
        </div>
        <div class="trade-sticker-row">
          <strong>{{ tradeOffersLabel(trade) }}:</strong>
          <div class="trade-sticker-values">
            <span v-for="sticker in parseStickerList(trade.offered_stickers)" :key="`trade-offer-${trade.id}-${sticker}`" class="sticker-chip offer">
              {{ sticker }}
            </span>
          </div>
        </div>
        <p><strong>{{ t('tradeMethod') }}:</strong> {{ trade.trade_method === 'post' ? t('byPost') : t('inPerson') }}</p>
        <p><strong>{{ t('phoneNumber') }}:</strong> {{ trade.phone_number || '-' }}</p>
        <p v-if="showRequesterFullName(trade)"><strong>{{ t('requesterFullName') }}:</strong> {{ trade.requester_full_name }}</p>
        <p v-if="showRequesterPostalAddress(trade)"><strong>{{ t('requesterPostalAddress') }}:</strong> {{ trade.postal_address || '-' }}</p>
        <p v-if="showRecipientFullName(trade)"><strong>{{ t('recipientFullName') }}:</strong> {{ trade.recipient_full_name }}</p>
        <p v-if="showRecipientPostalAddress(trade)"><strong>{{ t('recipientPostalAddress') }}:</strong> {{ trade.recipient_postal_address }}</p>
        <p><strong>{{ t('locationNote') }}:</strong> {{ trade.location_note || '-' }}</p>

        <div
          v-if="isIncomingTrade(trade) && trade.status === 'pending' && trade.trade_method === 'post'"
          class="trade-approval-fields"
        >
          <input
            v-model="getTradeApprovalDraft(trade.id).recipientFullName"
            :placeholder="t('recipientFullNameInput')"
          />
          <input
            v-model="getTradeApprovalDraft(trade.id).recipientPostalAddress"
            :placeholder="t('recipientPostalAddressInput')"
          />
        </div>
      </div>

      <div
        v-if="isIncomingTrade(trade) && trade.status === 'pending'"
        class="action-column"
      >
        <button
          type="button"
          :disabled="loading || (trade.trade_method === 'post' && (!getTradeApprovalDraft(trade.id).recipientFullName.trim() || !getTradeApprovalDraft(trade.id).recipientPostalAddress.trim()))"
          @click="acceptTrade(trade)"
        >{{ t('accept') }}</button>
        <small v-if="approvalNote(trade)" class="trade-approval-note">{{ approvalNote(trade) }}</small>
        <button type="button" class="secondary" @click="updateTradeStatus(trade.id, 'declined')">
          {{ t('decline') }}
        </button>
      </div>

      <div v-else-if="canRemoveTrade(trade)" class="action-column">
        <button type="button" class="secondary" :disabled="loading" @click="deleteTrade(trade.id)">
          {{ t('removeTrade') }}
        </button>
      </div>
    </article>
  </section>
</template>
