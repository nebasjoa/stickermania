<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import api from './api.js';
import locations from './data/locations.json';

const { t, locale } = useI18n();
const stickerNumbers = Array.from({ length: 600 }, (_, index) => String(index + 1));
const countryOptions = Object.keys(locations);

const activeSection = ref('home');
const loading = ref(false);
const message = ref('');
const errorMessage = ref('');
const currentUser = ref(null);
const searchResults = ref([]);
const trades = ref([]);
const meetups = ref([]);
const verificationToken = ref('');

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  country: '',
  city: '',
  postalTradeEnabled: true,
  needs: [],
  offers: []
});

const loginForm = reactive({
  email: '',
  password: ''
});

const profileForm = reactive({
  country: '',
  city: '',
  postalTradeEnabled: true,
  needs: [],
  offers: []
});

const searchForm = reactive({
  numbers: '',
  country: '',
  city: ''
});

const meetupFilterForm = reactive({
  country: '',
  city: ''
});

const meetupForm = reactive({
  title: '',
  description: '',
  country: '',
  city: '',
  venue: '',
  startsAt: '',
  details: ''
});

const tradeDrafts = reactive({});

const isAuthenticated = computed(() => Boolean(currentUser.value));
const searchCityOptions = computed(() => locations[searchForm.country] || []);
const meetupFilterCityOptions = computed(() => locations[meetupFilterForm.country] || []);
const meetupFormCityOptions = computed(() => locations[meetupForm.country] || []);

function setStatus(nextMessage = '', nextError = '') {
  message.value = nextMessage;
  errorMessage.value = nextError;
}

function syncProfileForm(user) {
  profileForm.country = user?.country || '';
  profileForm.city = user?.city || '';
  profileForm.postalTradeEnabled = Boolean(user?.postalTradeEnabled);
  profileForm.needs = [...(user?.needs || [])];
  profileForm.offers = [...(user?.offers || [])];
}

function resetRegisterForm() {
  Object.assign(registerForm, {
    username: '',
    email: '',
    password: '',
    country: '',
    city: '',
    postalTradeEnabled: true,
    needs: [],
    offers: []
  });
}

function resetMeetupForm() {
  Object.assign(meetupForm, {
    title: '',
    description: '',
    country: '',
    city: '',
    venue: '',
    startsAt: '',
    details: ''
  });
}

function toggleSticker(form, key, stickerNumber) {
  const currentValues = form[key];
  const index = currentValues.indexOf(stickerNumber);

  if (index >= 0) {
    currentValues.splice(index, 1);
    return;
  }

  currentValues.push(stickerNumber);
  currentValues.sort((left, right) => Number(left) - Number(right));
}

function replaceStickerSelection(form, key, values) {
  form[key].splice(0, form[key].length, ...values);
}

function isStickerSelected(form, key, stickerNumber) {
  return form[key].includes(stickerNumber);
}

function selectAllStickers(form, key) {
  replaceStickerSelection(form, key, [...stickerNumbers]);
}

function clearAllStickers(form, key) {
  replaceStickerSelection(form, key, []);
}

watch(
  () => searchForm.country,
  (nextCountry, previousCountry) => {
    if (nextCountry !== previousCountry) {
      searchForm.city = '';
    }
  }
);

watch(
  () => meetupFilterForm.country,
  (nextCountry, previousCountry) => {
    if (nextCountry !== previousCountry) {
      meetupFilterForm.city = '';
    }
  }
);

watch(
  () => meetupForm.country,
  (nextCountry, previousCountry) => {
    if (nextCountry !== previousCountry) {
      meetupForm.city = '';
    }
  }
);

async function fetchMe() {
  try {
    const { data } = await api.get('/auth/me');
    currentUser.value = data.user;
    syncProfileForm(data.user);
  } catch (_error) {
    currentUser.value = null;
  }
}

async function fetchTrades() {
  if (!isAuthenticated.value) {
    trades.value = [];
    return;
  }

  const { data } = await api.get('/trades');
  trades.value = data.trades;
}

async function fetchMeetups() {
  const { data } = await api.get('/meetups', {
    params: {
      country: meetupFilterForm.country,
      city: meetupFilterForm.city
    }
  });

  meetups.value = data.meetups;
}

async function handleRegister() {
  loading.value = true;
  setStatus();

  try {
    const { data } = await api.post('/auth/register', registerForm);
    setStatus(data.verificationToken ? `${data.message} Token: ${data.verificationToken}` : data.message);
    resetRegisterForm();
    activeSection.value = 'account';
  } catch (error) {
    setStatus('', error.response?.data?.message || 'Registration failed.');
  } finally {
    loading.value = false;
  }
}

async function handleVerify() {
  loading.value = true;
  setStatus();

  try {
    const { data } = await api.post('/auth/verify-email', { token: verificationToken.value });
    setStatus(data.message);
    verificationToken.value = '';
  } catch (error) {
    setStatus('', error.response?.data?.message || 'Verification failed.');
  } finally {
    loading.value = false;
  }
}

async function handleLogin() {
  loading.value = true;
  setStatus();

  try {
    await api.post('/auth/login', loginForm);
    await fetchMe();
    await fetchTrades();
    await fetchMeetups();
    setStatus('Logged in successfully.');
    activeSection.value = 'search';
    loginForm.password = '';
  } catch (error) {
    setStatus('', error.response?.data?.message || 'Login failed.');
  } finally {
    loading.value = false;
  }
}

async function handleLogout() {
  await api.post('/auth/logout');
  currentUser.value = null;
  trades.value = [];
  searchResults.value = [];
  await fetchMeetups();
  activeSection.value = 'home';
  setStatus('Logged out.');
}

async function saveProfile() {
  loading.value = true;
  setStatus();

  try {
    await api.put('/users/me/profile', {
      country: profileForm.country,
      city: profileForm.city,
      postalTradeEnabled: profileForm.postalTradeEnabled
    });
    await api.put('/users/me/stickers', {
      needs: profileForm.needs,
      offers: profileForm.offers
    });
    await fetchMe();
    setStatus('Profile updated.');
  } catch (error) {
    setStatus('', error.response?.data?.message || 'Could not save profile.');
  } finally {
    loading.value = false;
  }
}

async function searchCollectors() {
  loading.value = true;
  setStatus();

  try {
    const { data } = await api.get('/users/search', {
      params: {
        numbers: searchForm.numbers,
        country: searchForm.country,
        city: searchForm.city
      }
    });
    searchResults.value = data.users;
    if (!data.users.length) {
      setStatus(t('noSearchResults'));
    }
  } catch (error) {
    searchResults.value = [];
    setStatus('', error.response?.data?.message || 'Search failed.');
  } finally {
    loading.value = false;
  }
}

async function searchMeetups() {
  loading.value = true;
  setStatus();

  try {
    await fetchMeetups();
    if (!meetups.value.length) {
      setStatus(t('meetupEmpty'));
    }
  } catch (error) {
    setStatus('', error.response?.data?.message || 'Meetup search failed.');
  } finally {
    loading.value = false;
  }
}

function getTradeDraft(userId) {
  if (!tradeDrafts[userId]) {
    tradeDrafts[userId] = {
      requestedStickers: '',
      offeredStickers: '',
      tradeMethod: 'in_person',
      locationNote: ''
    };
  }

  return tradeDrafts[userId];
}

async function sendTradeRequest(targetUserId) {
  loading.value = true;
  setStatus();

  try {
    const draft = getTradeDraft(targetUserId);
    const { data } = await api.post('/trades', {
      targetUserId,
      requestedStickers: draft.requestedStickers,
      offeredStickers: draft.offeredStickers,
      tradeMethod: draft.tradeMethod,
      locationNote: draft.locationNote
    });
    setStatus(data.message);
    tradeDrafts[targetUserId] = {
      requestedStickers: '',
      offeredStickers: '',
      tradeMethod: 'in_person',
      locationNote: ''
    };
    await fetchTrades();
  } catch (error) {
    setStatus('', error.response?.data?.message || 'Could not send trade request.');
  } finally {
    loading.value = false;
  }
}

async function updateTradeStatus(id, status) {
  loading.value = true;
  setStatus();

  try {
    const { data } = await api.put(`/trades/${id}/status`, { status });
    setStatus(data.message);
    await fetchTrades();
    await fetchMe();
  } catch (error) {
    setStatus('', error.response?.data?.message || 'Could not update trade request.');
  } finally {
    loading.value = false;
  }
}

async function createMeetup() {
  loading.value = true;
  setStatus();

  try {
    const { data } = await api.post('/meetups', meetupForm);
    setStatus(data.message);
    resetMeetupForm();
    await fetchMeetups();
  } catch (error) {
    setStatus('', error.response?.data?.message || 'Could not create meetup.');
  } finally {
    loading.value = false;
  }
}

async function toggleMeetupAttendance(meetup) {
  loading.value = true;
  setStatus();

  try {
    const { data } = await api.post(`/meetups/${meetup.id}/attend`, {
      attending: !meetup.isAttending
    });
    setStatus(data.message);
    await fetchMeetups();
  } catch (error) {
    setStatus('', error.response?.data?.message || 'Could not update meetup attendance.');
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('verify');

  if (token) {
    verificationToken.value = token;
    activeSection.value = 'account';
    await handleVerify();
    window.history.replaceState({}, '', '/');
  }

  await fetchMe();
  await fetchTrades();
  await fetchMeetups();
});
</script>

<template>
  <div class="shell">
    <header class="navbar">
      <div>
        <div class="brand">{{ t('appName') }}</div>
        <p class="tagline">{{ t('tagline') }}</p>
      </div>

      <nav class="nav-links">
        <button type="button" @click="activeSection = 'home'">{{ t('navHome') }}</button>
        <button type="button" @click="activeSection = 'search'">{{ t('navSearch') }}</button>
        <button type="button" @click="activeSection = 'meetups'">{{ t('navMeetups') }}</button>
        <button type="button" @click="activeSection = 'trades'">{{ t('navTrades') }}</button>
        <button type="button" @click="activeSection = 'account'">{{ t('navAccount') }}</button>
      </nav>

      <div class="toolbar">
        <label class="language-picker">
          <span>{{ t('language') }}</span>
          <select v-model="locale">
            <option value="en">EN</option>
            <option value="de">DE</option>
            <option value="sr">SR</option>
          </select>
        </label>

        <button v-if="isAuthenticated" type="button" class="secondary" @click="handleLogout">
          {{ t('logout') }}
        </button>
      </div>
    </header>

    <main class="main-content">
      <section v-if="activeSection === 'home'" class="hero card">
        <div>
          <p class="eyebrow">FIFA WORLD CUP STICKER EXCHANGE</p>
          <h1>{{ t('heroTitle') }}</h1>
          <p>{{ t('heroBody') }}</p>
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

      <section v-if="message" class="notice success">{{ message }}</section>
      <section v-if="errorMessage" class="notice error">{{ errorMessage }}</section>

      <section v-if="activeSection === 'account' && !isAuthenticated" class="grid-two">
        <article class="card">
          <h2>{{ t('register') }}</h2>
          <form class="stack" @submit.prevent="handleRegister">
            <input v-model="registerForm.username" :placeholder="t('username')" required />
            <input v-model="registerForm.email" :placeholder="t('email')" type="email" required />
            <input v-model="registerForm.password" :placeholder="t('password')" type="password" required />
            <input v-model="registerForm.country" :placeholder="t('country')" />
            <input v-model="registerForm.city" :placeholder="t('city')" />
            <details class="picker-panel">
              <summary>{{ t('neededStickers') }} | {{ t('selectedCount') }}: {{ registerForm.needs.length }}</summary>
              <div class="picker-actions">
                <button type="button" class="secondary" @click="selectAllStickers(registerForm, 'needs')">{{ t('selectAll') }}</button>
                <button type="button" class="secondary" @click="clearAllStickers(registerForm, 'needs')">{{ t('deselectAll') }}</button>
              </div>
              <div class="sticker-grid">
                <button
                  v-for="sticker in stickerNumbers"
                  :key="`register-needs-${sticker}`"
                  type="button"
                  class="sticker-tile"
                  :class="{ selected: isStickerSelected(registerForm, 'needs', sticker) }"
                  @click="toggleSticker(registerForm, 'needs', sticker)"
                >
                  {{ sticker }}
                </button>
              </div>
            </details>
            <details class="picker-panel">
              <summary>{{ t('offeredStickers') }} | {{ t('selectedCount') }}: {{ registerForm.offers.length }}</summary>
              <div class="picker-actions">
                <button type="button" class="secondary" @click="selectAllStickers(registerForm, 'offers')">{{ t('selectAll') }}</button>
                <button type="button" class="secondary" @click="clearAllStickers(registerForm, 'offers')">{{ t('deselectAll') }}</button>
              </div>
              <div class="sticker-grid">
                <button
                  v-for="sticker in stickerNumbers"
                  :key="`register-offers-${sticker}`"
                  type="button"
                  class="sticker-tile"
                  :class="{ selected: isStickerSelected(registerForm, 'offers', sticker) }"
                  @click="toggleSticker(registerForm, 'offers', sticker)"
                >
                  {{ sticker }}
                </button>
              </div>
            </details>
            <label class="checkbox-row">
              <input v-model="registerForm.postalTradeEnabled" type="checkbox" />
              <span>{{ t('postalTrade') }}</span>
            </label>
            <button type="submit" :disabled="loading">{{ t('register') }}</button>
          </form>
        </article>

        <article class="card">
          <h2>{{ t('login') }}</h2>
          <form class="stack" @submit.prevent="handleLogin">
            <input v-model="loginForm.email" :placeholder="t('email')" type="email" required />
            <input v-model="loginForm.password" :placeholder="t('password')" type="password" required />
            <button type="submit" :disabled="loading">{{ t('login') }}</button>
          </form>

          <div class="divider"></div>

          <h3>{{ t('verifyNotice') }}</h3>
          <form class="stack" @submit.prevent="handleVerify">
            <input v-model="verificationToken" placeholder="Verification token" />
            <button type="submit" class="secondary" :disabled="loading">Verify email</button>
          </form>
        </article>
      </section>

      <section v-if="activeSection === 'search'" class="stack">
        <article class="card">
          <h2>{{ t('searchTitle') }}</h2>
          <form class="search-row" @submit.prevent="searchCollectors">
            <div class="search-fields">
              <input
                v-model="searchForm.numbers"
                :placeholder="t('searchPlaceholder')"
                :disabled="!isAuthenticated"
              />
              <select v-model="searchForm.country" :disabled="!isAuthenticated">
                <option value="">{{ t('anyCountry') }}</option>
                <option v-for="country in countryOptions" :key="country" :value="country">
                  {{ country }}
                </option>
              </select>
              <select v-model="searchForm.city" :disabled="!isAuthenticated || !searchForm.country">
                <option value="">{{ t('anyCity') }}</option>
                <option v-for="city in searchCityOptions" :key="city" :value="city">
                  {{ city }}
                </option>
              </select>
            </div>
            <button type="submit" :disabled="loading || !isAuthenticated">{{ t('searchButton') }}</button>
          </form>
          <small>{{ t('searchHelp') }}</small>
        </article>

        <div v-if="isAuthenticated" class="results-grid">
          <article v-for="user in searchResults" :key="user.id" class="card">
            <div class="card-top">
              <div>
                <h3>{{ user.username }}</h3>
                <p>{{ user.city }}, {{ user.country }}</p>
              </div>
              <span class="pill" :class="{ muted: !user.postalTradeEnabled }">
                {{ user.postalTradeEnabled ? t('byPost') : t('inPerson') }}
              </span>
            </div>

            <p><strong>{{ t('neededStickers') }}:</strong> {{ user.needs.join(', ') || '-' }}</p>
            <p><strong>{{ t('offeredStickers') }}:</strong> {{ user.offers.join(', ') || '-' }}</p>

            <form class="stack compact" @submit.prevent="sendTradeRequest(user.id)">
              <input v-model="getTradeDraft(user.id).requestedStickers" :placeholder="t('neededStickers')" />
              <input v-model="getTradeDraft(user.id).offeredStickers" :placeholder="t('offeredStickers')" />
              <select v-model="getTradeDraft(user.id).tradeMethod">
                <option value="in_person">{{ t('inPerson') }}</option>
                <option value="post">{{ t('byPost') }}</option>
              </select>
              <input v-model="getTradeDraft(user.id).locationNote" :placeholder="t('locationNote')" />
              <button type="submit" :disabled="loading">{{ t('sendTrade') }}</button>
            </form>
          </article>
        </div>
      </section>

      <section v-if="activeSection === 'meetups'" class="stack">
        <article class="card">
          <h2>{{ t('meetupBrowseTitle') }}</h2>
          <form class="search-row" @submit.prevent="searchMeetups">
            <div class="search-fields">
              <select v-model="meetupFilterForm.country">
                <option value="">{{ t('anyCountry') }}</option>
                <option v-for="country in countryOptions" :key="`meetup-filter-${country}`" :value="country">
                  {{ country }}
                </option>
              </select>
              <select v-model="meetupFilterForm.city" :disabled="!meetupFilterForm.country">
                <option value="">{{ t('anyCity') }}</option>
                <option v-for="city in meetupFilterCityOptions" :key="`meetup-city-${city}`" :value="city">
                  {{ city }}
                </option>
              </select>
            </div>
            <button type="submit" :disabled="loading">{{ t('meetupSearchButton') }}</button>
          </form>
        </article>

        <article v-if="isAuthenticated" class="card">
          <h2>{{ t('meetupCreateTitle') }}</h2>
          <form class="stack" @submit.prevent="createMeetup">
            <input v-model="meetupForm.title" :placeholder="t('meetupTitle')" required />
            <textarea v-model="meetupForm.description" :placeholder="t('meetupDescription')" required></textarea>
            <select v-model="meetupForm.country" required>
              <option disabled value="">{{ t('searchCountry') }}</option>
              <option v-for="country in countryOptions" :key="`meetup-form-country-${country}`" :value="country">
                {{ country }}
              </option>
            </select>
            <select v-model="meetupForm.city" :disabled="!meetupForm.country" required>
              <option disabled value="">{{ t('searchCity') }}</option>
              <option v-for="city in meetupFormCityOptions" :key="`meetup-form-city-${city}`" :value="city">
                {{ city }}
              </option>
            </select>
            <input v-model="meetupForm.venue" :placeholder="t('meetupVenue')" />
            <input v-model="meetupForm.startsAt" type="datetime-local" required />
            <input v-model="meetupForm.details" :placeholder="t('meetupDetails')" />
            <button type="submit" :disabled="loading">{{ t('meetupCreateButton') }}</button>
          </form>
        </article>

        <div class="results-grid">
          <article v-for="meetup in meetups" :key="meetup.id" class="card meetup-card">
            <div class="card-top">
              <div>
                <h3>{{ meetup.title }}</h3>
                <p>{{ meetup.city }}, {{ meetup.country }}</p>
              </div>
              <span class="status">{{ new Date(meetup.starts_at).toLocaleString() }}</span>
            </div>
            <p>{{ meetup.description }}</p>
            <div class="meetup-meta">
              <span><strong>{{ t('meetupCreator') }}:</strong> {{ meetup.creator_username }}</span>
              <span><strong>{{ t('meetupVenue') }}:</strong> {{ meetup.venue || '-' }}</span>
              <span><strong>{{ t('meetupAttendees') }}:</strong> {{ meetup.attendee_count }}</span>
            </div>
            <p><strong>{{ t('meetupDetails') }}:</strong> {{ meetup.details || '-' }}</p>
            <button
              v-if="isAuthenticated"
              type="button"
              :class="{ secondary: meetup.isAttending }"
              @click="toggleMeetupAttendance(meetup)"
            >
              {{ meetup.isAttending ? t('meetupCancelAttend') : t('meetupAttend') }}
            </button>
          </article>
          <article v-if="!meetups.length" class="card">
            <p>{{ t('meetupEmpty') }}</p>
          </article>
        </div>
      </section>

      <section v-if="activeSection === 'trades'" class="card stack">
        <h2>{{ t('tradesTitle') }}</h2>
        <div v-if="!trades.length">{{ t('noTrades') }}</div>
        <article v-for="trade in trades" :key="trade.id" class="trade-row">
          <div>
            <div class="trade-header">
              <strong>
                {{ Number(trade.target_user_id) === Number(currentUser?.id) ? t('incoming') : t('outgoing') }}
              </strong>
              <span class="status">{{ trade.status }}</span>
            </div>
            <p>{{ trade.requester_username }} to {{ trade.target_username }}</p>
            <p><strong>{{ t('neededStickers') }}:</strong> {{ trade.requested_stickers }}</p>
            <p><strong>{{ t('offeredStickers') }}:</strong> {{ trade.offered_stickers }}</p>
            <p><strong>{{ t('tradeMethod') }}:</strong> {{ trade.trade_method === 'post' ? t('byPost') : t('inPerson') }}</p>
            <p><strong>{{ t('locationNote') }}:</strong> {{ trade.location_note || '-' }}</p>
          </div>

          <div
            v-if="isAuthenticated && Number(trade.target_user_id) === Number(currentUser?.id) && trade.status === 'pending'"
            class="action-column"
          >
            <button type="button" @click="updateTradeStatus(trade.id, 'accepted')">{{ t('accept') }}</button>
            <button type="button" class="secondary" @click="updateTradeStatus(trade.id, 'declined')">
              {{ t('decline') }}
            </button>
          </div>
        </article>
      </section>

      <section v-if="activeSection === 'account' && isAuthenticated" class="card">
        <h2>{{ t('profileTitle') }}</h2>
        <form class="stack" @submit.prevent="saveProfile">
          <input v-model="profileForm.country" :placeholder="t('country')" />
          <input v-model="profileForm.city" :placeholder="t('city')" />
          <details class="picker-panel">
            <summary>{{ t('neededStickers') }} | {{ t('selectedCount') }}: {{ profileForm.needs.length }}</summary>
            <div class="picker-actions">
              <button type="button" class="secondary" @click="selectAllStickers(profileForm, 'needs')">{{ t('selectAll') }}</button>
              <button type="button" class="secondary" @click="clearAllStickers(profileForm, 'needs')">{{ t('deselectAll') }}</button>
            </div>
            <div class="sticker-grid">
              <button
                v-for="sticker in stickerNumbers"
                :key="`profile-needs-${sticker}`"
                type="button"
                class="sticker-tile"
                :class="{ selected: isStickerSelected(profileForm, 'needs', sticker) }"
                @click="toggleSticker(profileForm, 'needs', sticker)"
              >
                {{ sticker }}
              </button>
            </div>
          </details>
          <details class="picker-panel">
            <summary>{{ t('offeredStickers') }} | {{ t('selectedCount') }}: {{ profileForm.offers.length }}</summary>
            <div class="picker-actions">
              <button type="button" class="secondary" @click="selectAllStickers(profileForm, 'offers')">{{ t('selectAll') }}</button>
              <button type="button" class="secondary" @click="clearAllStickers(profileForm, 'offers')">{{ t('deselectAll') }}</button>
            </div>
            <div class="sticker-grid">
              <button
                v-for="sticker in stickerNumbers"
                :key="`profile-offers-${sticker}`"
                type="button"
                class="sticker-tile"
                :class="{ selected: isStickerSelected(profileForm, 'offers', sticker) }"
                @click="toggleSticker(profileForm, 'offers', sticker)"
              >
                {{ sticker }}
              </button>
            </div>
          </details>
          <label class="checkbox-row">
            <input v-model="profileForm.postalTradeEnabled" type="checkbox" />
            <span>{{ t('postalTrade') }}</span>
          </label>
          <button type="submit" :disabled="loading">{{ t('saveProfile') }}</button>
        </form>
      </section>
    </main>

    <footer class="footer">
      <span>{{ t('footer') }}</span>
      <span v-if="currentUser">{{ currentUser.username }}</span>
    </footer>
  </div>
</template>
