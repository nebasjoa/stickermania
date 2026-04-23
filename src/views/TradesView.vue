<script setup>
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { currentUser, trades, loading, getTradeApprovalDraft, updateTradeStatus, deleteTrade } from '../store.js';

const { t } = useI18n();

// Per-trade cancel form state
const cancelForms = reactive({});

function getCancelForm(tradeId) {
  if (!cancelForms[tradeId]) {
    cancelForms[tradeId] = { open: false, reason: '' };
  }
  return cancelForms[tradeId];
}

function parseStickerList(value) {
  if (!value) return [];
  return String(value).split(/[,\s;]+/).map((s) => s.trim()).filter(Boolean);
}

function statusLabel(status) {
  const map = {
    pending:   t('tradeStatusPending'),
    accepted:  t('tradeStatusAccepted'),
    declined:  t('tradeStatusDeclined'),
    sent:      t('tradeStatusSent'),
    done:      t('tradeStatusDone'),
    cancelled: t('tradeStatusCancelled'),
  };
  return map[status] ?? status;
}

function isIncomingTrade(trade) {
  return Number(trade.target_user_id) === Number(currentUser.value?.id);
}

function isRequesterTrade(trade) {
  return Number(trade.requester_user_id) === Number(currentUser.value?.id);
}

function showRequesterPostalAddress(trade) {
  return trade.trade_method === 'post' && trade.status === 'accepted';
}

function showRecipientPostalAddress(trade) {
  return trade.trade_method === 'post' && ['accepted', 'sent', 'done'].includes(trade.status) && trade.recipient_postal_address;
}

function showRequesterFullName(trade) {
  return trade.trade_method === 'post' && ['accepted', 'sent', 'done'].includes(trade.status) && trade.requester_full_name;
}

function showRecipientFullName(trade) {
  return trade.trade_method === 'post' && ['accepted', 'sent', 'done'].includes(trade.status) && trade.recipient_full_name;
}

function approvalNote(trade) {
  if (trade.trade_method !== 'post') return '';
  const draft = getTradeApprovalDraft(trade.id);
  if (!draft.recipientFullName.trim() && !draft.recipientPostalAddress.trim()) return t('acceptTradeNeedsNameAndAddress');
  if (!draft.recipientFullName.trim()) return t('acceptTradeNeedsName');
  if (!draft.recipientPostalAddress.trim()) return t('acceptTradeNeedsAddress');
  return '';
}

function acceptTrade(trade) {
  const draft = getTradeApprovalDraft(trade.id);
  updateTradeStatus(trade.id, 'accepted', {
    recipientFullName: draft.recipientFullName,
    recipientPostalAddress: draft.recipientPostalAddress
  });
}

async function confirmCancel(trade) {
  const form = getCancelForm(trade.id);
  if (!form.reason.trim()) return;
  await updateTradeStatus(trade.id, 'cancelled', { cancellationReason: form.reason });
  form.open = false;
  form.reason = '';
}

function canRemoveTrade(trade) {
  return ['declined', 'cancelled', 'done'].includes(trade.status);
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
            {{ isIncomingTrade(trade) ? t('incoming') : t('outgoing') }}
          </strong>
          <span class="status" :class="`status--${trade.status}`">{{ statusLabel(trade.status) }}</span>
        </div>
        <p>{{ trade.requester_username }} to {{ trade.target_username }}</p>
        <div class="trade-sticker-row">
          <strong>{{ t('tradeUserNeeds', { username: trade.requester_username }) }}:</strong>
          <div class="trade-sticker-values">
            <span v-for="s in parseStickerList(trade.requested_stickers)" :key="`tn-${trade.id}-${s}`" class="sticker-chip need">{{ s }}</span>
          </div>
        </div>
        <div class="trade-sticker-row">
          <strong>{{ t('tradeUserOffers', { username: trade.requester_username }) }}:</strong>
          <div class="trade-sticker-values">
            <span v-for="s in parseStickerList(trade.offered_stickers)" :key="`to-${trade.id}-${s}`" class="sticker-chip offer">{{ s }}</span>
          </div>
        </div>
        <p><strong>{{ t('tradeMethod') }}:</strong> {{ trade.trade_method === 'post' ? t('byPost') : t('inPerson') }}</p>
        <p><strong>{{ t('phoneNumber') }}:</strong> {{ trade.phone_number || '-' }}</p>
        <p v-if="showRequesterFullName(trade)"><strong>{{ t('requesterFullName') }}:</strong> {{ trade.requester_full_name }}</p>
        <p v-if="showRequesterPostalAddress(trade)"><strong>{{ t('requesterPostalAddress') }}:</strong> {{ trade.postal_address || '-' }}</p>
        <p v-if="showRecipientFullName(trade)"><strong>{{ t('recipientFullName') }}:</strong> {{ trade.recipient_full_name }}</p>
        <p v-if="showRecipientPostalAddress(trade)"><strong>{{ t('recipientPostalAddress') }}:</strong> {{ trade.recipient_postal_address }}</p>
        <p><strong>{{ t('locationNote') }}:</strong> {{ trade.location_note || '-' }}</p>
        <p v-if="trade.cancellation_reason" class="trade-cancel-reason">
          <strong>{{ t('tradeCancelledReason') }}:</strong> {{ trade.cancellation_reason }}
        </p>

        <!-- Postal acceptance fields -->
        <div
          v-if="isIncomingTrade(trade) && trade.status === 'pending' && trade.trade_method === 'post'"
          class="trade-approval-fields"
        >
          <input v-model="getTradeApprovalDraft(trade.id).recipientFullName" :placeholder="t('recipientFullNameInput')" />
          <input v-model="getTradeApprovalDraft(trade.id).recipientPostalAddress" :placeholder="t('recipientPostalAddressInput')" />
        </div>

        <!-- Cancel form -->
        <div v-if="getCancelForm(trade.id).open" class="trade-cancel-form">
          <label class="trade-cancel-label">{{ t('cancellationReason') }}</label>
          <textarea
            v-model="getCancelForm(trade.id).reason"
            :placeholder="t('cancellationReasonPlaceholder')"
            rows="2"
            class="trade-cancel-textarea"
          ></textarea>
          <div class="trade-cancel-actions">
            <button
              type="button"
              :disabled="loading || !getCancelForm(trade.id).reason.trim()"
              @click="confirmCancel(trade)"
            >{{ t('cancelTradeConfirm') }}</button>
            <button type="button" class="secondary" :disabled="loading" @click="getCancelForm(trade.id).open = false">
              {{ t('cancel') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Action column: pending incoming -->
      <div v-if="isIncomingTrade(trade) && trade.status === 'pending'" class="action-column">
        <button
          type="button"
          :disabled="loading || (trade.trade_method === 'post' && (!getTradeApprovalDraft(trade.id).recipientFullName.trim() || !getTradeApprovalDraft(trade.id).recipientPostalAddress.trim()))"
          @click="acceptTrade(trade)"
        >{{ t('accept') }}</button>
        <small v-if="approvalNote(trade)" class="trade-approval-note">{{ approvalNote(trade) }}</small>
        <button type="button" class="secondary" :disabled="loading" @click="updateTradeStatus(trade.id, 'declined')">
          {{ t('decline') }}
        </button>
      </div>

      <!-- Action column: accepted -->
      <div v-else-if="trade.status === 'accepted'" class="action-column">
        <button
          v-if="isRequesterTrade(trade)"
          type="button"
          class="secondary"
          :disabled="loading"
          @click="updateTradeStatus(trade.id, 'sent')"
        >{{ t('markSent') }}</button>
        <button type="button" :disabled="loading" @click="updateTradeStatus(trade.id, 'done')">
          {{ t('markDone') }}
        </button>
        <button
          v-if="!getCancelForm(trade.id).open"
          type="button"
          class="secondary danger"
          :disabled="loading"
          @click="getCancelForm(trade.id).open = true"
        >{{ t('cancelTrade') }}</button>
      </div>

      <!-- Action column: sent -->
      <div v-else-if="trade.status === 'sent'" class="action-column">
        <button type="button" :disabled="loading" @click="updateTradeStatus(trade.id, 'done')">
          {{ t('markDone') }}
        </button>
        <button
          v-if="!getCancelForm(trade.id).open"
          type="button"
          class="secondary danger"
          :disabled="loading"
          @click="getCancelForm(trade.id).open = true"
        >{{ t('cancelTrade') }}</button>
      </div>

      <!-- Action column: terminal states -->
      <div v-else-if="canRemoveTrade(trade)" class="action-column">
        <button type="button" class="secondary" :disabled="loading" @click="deleteTrade(trade.id)">
          {{ t('removeTrade') }}
        </button>
      </div>
    </article>
  </section>
</template>
