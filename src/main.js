import { createApp } from 'vue';
import App from './App.vue';
import router from './router.js';
import { i18n } from './i18n.js';
import 'flag-icons/css/flag-icons.min.css';
import './styles.css';

createApp(App).use(i18n).use(router).mount('#app');
