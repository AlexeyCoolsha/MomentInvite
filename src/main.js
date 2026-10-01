import './styles/main.scss';
import './js/components/countdown.js';
import './js/components/audio-player.js';
import { RSVPForm } from './js/components/rsvp-form.js';
import { initTimelineStripe } from './js/components/timeline-stripe.js';
import { initCollageStripe } from './js/components/collage-stripe.js';

// Initialize RSVP Form
// tokens may come from environment variables (preferred) or data attributes as fallback
const rsvpElement = document.querySelector('.rsvp-form');

// read from Vite env first
const envBot = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const envChat = import.meta.env.VITE_TELEGRAM_CHAT_ID;

const botToken = envBot || rsvpElement?.dataset.botToken;
const rawChatIds = envChat || rsvpElement?.dataset.chatId;
const chatIds = rawChatIds
  ? rawChatIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  : [];

if (!botToken || chatIds.length === 0) {
  console.error('❌ bot token or chat id not provided: set VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHAT_ID in .env');
} else {
  new RSVPForm('.rsvp-form', botToken, chatIds);
}

initTimelineStripe();
initCollageStripe();

