import { computed, reactive, ref } from 'vue';
import api from './api.js';

// ── State ─────────────────────────────────────────────────────────────────────
export const currentUser = ref(null);
export const loading = ref(false);
export const message = ref('');
export const errorMessage = ref('');

export const searchResults = ref([]);
export const trades = ref([]);
export const meetups = ref([]);
export const homeLeaderboard = ref([]);
export const homeRecentCollectors = ref([]);
export const upcomingGames = ref([]);
export const upcomingGamesDate = ref(null);
export const groupStandings = ref({});
export const predictions = ref([]);
export const predictionDrafts = reactive({});
export const predictionSaved = reactive({});
export const tradeDrafts = reactive({});
export const verificationToken = ref('');

export const registerForm = reactive({
  username: '', email: '', password: '', country: '', city: '',
  postalTradeEnabled: true, needs: [], offers: []
});

export const loginForm = reactive({ email: '', password: '' });

export const profileForm = reactive({
  country: '', city: '', postalTradeEnabled: true, needs: [], offers: []
});

export const searchForm = reactive({ numbers: '', country: '', city: '' });
export const meetupFilterForm = reactive({ country: '', city: '' });

export const meetupForm = reactive({
  title: '', description: '', country: '', city: '', venue: '', startsAt: '', details: ''
});

export const activePredictionGroup = ref('A');
export const activeKnockoutStage = ref('r32');

// ── Computed ──────────────────────────────────────────────────────────────────
export const isAuthenticated = computed(() => Boolean(currentUser.value));
export const isAdmin = computed(() => Boolean(currentUser.value?.isAdmin));

export const homeMeetups = computed(() =>
  [...meetups.value]
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
    .slice(0, 3)
);

export const completedPredictionsCount = computed(
  () => predictions.value.filter((g) => g.prediction).length
);

// ── Helpers ───────────────────────────────────────────────────────────────────
export function setStatus(nextMessage = '', nextError = '') {
  message.value = nextMessage;
  errorMessage.value = nextError;
}

export function syncProfileForm(user) {
  profileForm.country = user?.country || '';
  profileForm.city = user?.city || '';
  profileForm.postalTradeEnabled = Boolean(user?.postalTradeEnabled);
  profileForm.needs = [...(user?.needs || [])];
  profileForm.offers = [...(user?.offers || [])];
}

export function resetRegisterForm() {
  Object.assign(registerForm, {
    username: '', email: '', password: '', country: '', city: '',
    postalTradeEnabled: true, needs: [], offers: []
  });
}

export function resetMeetupForm() {
  Object.assign(meetupForm, {
    title: '', description: '', country: '', city: '', venue: '', startsAt: '', details: ''
  });
}

export function initPredictionDrafts() {
  for (const game of predictions.value) {
    predictionDrafts[game.id] = {
      home: game.prediction?.homeScore ?? '',
      away: game.prediction?.awayScore ?? ''
    };
  }
}

export function getTradeDraft(userId) {
  if (!tradeDrafts[userId]) {
    tradeDrafts[userId] = {
      requestedStickers: '', offeredStickers: '', tradeMethod: 'in_person', locationNote: ''
    };
  }
  return tradeDrafts[userId];
}

// ── API ───────────────────────────────────────────────────────────────────────
export async function fetchMe() {
  try {
    const { data } = await api.get('/auth/me');
    currentUser.value = data.user;
    syncProfileForm(data.user);
  } catch {
    currentUser.value = null;
  }
}

export async function fetchTrades() {
  if (!isAuthenticated.value) { trades.value = []; return; }
  const { data } = await api.get('/trades');
  trades.value = data.trades;
}

export async function fetchMeetups() {
  const { data } = await api.get('/meetups', {
    params: { country: meetupFilterForm.country, city: meetupFilterForm.city }
  });
  meetups.value = data.meetups;
}

export async function fetchHomeLeaderboard() {
  const { data } = await api.get('/predictions/leaderboard');
  homeLeaderboard.value = data.leaderboard;
}

export async function fetchRecentCollectors() {
  const { data } = await api.get('/users/recent');
  homeRecentCollectors.value = data.users;
}

export async function fetchUpcomingGames() {
  const { data } = await api.get('/predictions/upcoming');
  upcomingGames.value = data.games;
  upcomingGamesDate.value = data.date;
}

export async function fetchGroupStandings() {
  const { data } = await api.get('/predictions/standings');
  groupStandings.value = data.standings;
}

export async function fetchPredictions() {
  const { data } = await api.get('/predictions/games');
  predictions.value = data.games;
  initPredictionDrafts();
}

export async function handleRegister() {
  loading.value = true;
  setStatus();
  try {
    const { data } = await api.post('/auth/register', registerForm);
    setStatus(data.verificationToken ? `${data.message} Token: ${data.verificationToken}` : data.message);
    resetRegisterForm();
    return true;
  } catch (error) {
    setStatus('', error.response?.data?.message || 'Registration failed.');
    return false;
  } finally {
    loading.value = false;
  }
}

export async function handleVerify(token) {
  loading.value = true;
  setStatus();
  try {
    const { data } = await api.post('/auth/verify-email', { token });
    setStatus(data.message);
    verificationToken.value = '';
    return true;
  } catch (error) {
    setStatus('', error.response?.data?.message || 'Verification failed.');
    return false;
  } finally {
    loading.value = false;
  }
}

export async function handleLogin() {
  loading.value = true;
  setStatus();
  try {
    await api.post('/auth/login', loginForm);
    await fetchMe();
    await fetchTrades();
    await fetchMeetups();
    await fetchPredictions();
    await fetchHomeLeaderboard();
    await fetchRecentCollectors();
    setStatus('Logged in successfully.');
    loginForm.password = '';
    return true;
  } catch (error) {
    setStatus('', error.response?.data?.message || 'Login failed.');
    return false;
  } finally {
    loading.value = false;
  }
}

export async function handleLogout() {
  await api.post('/auth/logout');
  currentUser.value = null;
  trades.value = [];
  searchResults.value = [];
  await fetchMeetups();
  await fetchPredictions();
  await fetchHomeLeaderboard();
  await fetchRecentCollectors();
  setStatus('Logged out.');
}

export async function saveProfile() {
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

export async function searchCollectors() {
  loading.value = true;
  setStatus();
  try {
    const { data } = await api.get('/users/search', {
      params: { numbers: searchForm.numbers, country: searchForm.country, city: searchForm.city }
    });
    searchResults.value = data.users;
    return data.users.length > 0;
  } catch (error) {
    searchResults.value = [];
    setStatus('', error.response?.data?.message || 'Search failed.');
    return false;
  } finally {
    loading.value = false;
  }
}

export async function sendTradeRequest(targetUserId) {
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
      requestedStickers: '', offeredStickers: '', tradeMethod: 'in_person', locationNote: ''
    };
    await fetchTrades();
  } catch (error) {
    setStatus('', error.response?.data?.message || 'Could not send trade request.');
  } finally {
    loading.value = false;
  }
}

export async function updateTradeStatus(id, status) {
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

export async function createMeetup() {
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

export async function toggleMeetupAttendance(meetup) {
  loading.value = true;
  setStatus();
  try {
    const { data } = await api.post(`/meetups/${meetup.id}/attend`, { attending: !meetup.isAttending });
    setStatus(data.message);
    await fetchMeetups();
  } catch (error) {
    setStatus('', error.response?.data?.message || 'Could not update meetup attendance.');
  } finally {
    loading.value = false;
  }
}

export async function savePrediction(gameId) {
  loading.value = true;
  setStatus();
  const draft = predictionDrafts[gameId];
  try {
    await api.put(`/predictions/games/${gameId}`, {
      homeScore: draft.home === '' ? '' : Number(draft.home),
      awayScore: draft.away === '' ? '' : Number(draft.away)
    });
    predictionSaved[gameId] = true;
    setTimeout(() => { predictionSaved[gameId] = false; }, 2500);
    await fetchPredictions();
  } catch (error) {
    setStatus('', error.response?.data?.message || 'Could not save prediction.');
  } finally {
    loading.value = false;
  }
}

export async function saveResult(gameId, homeScore, awayScore) {
  loading.value = true;
  setStatus();
  try {
    const { data } = await api.put(`/predictions/games/${gameId}/result`, { homeScore, awayScore });
    setStatus(data.message);
    await fetchPredictions();
    await fetchGroupStandings();
    await fetchHomeLeaderboard();
  } catch (error) {
    setStatus('', error.response?.data?.message || 'Could not save result.');
  } finally {
    loading.value = false;
  }
}
