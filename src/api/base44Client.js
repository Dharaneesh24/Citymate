const ANALYTICS_STORAGE_KEY = 'citymate_local_events_v1';
const FEEDBACK_STORAGE_KEY = 'citymate_local_feedback_v1';
const MAX_SESSION_EVENTS = 100;
const FEEDBACK_TYPES = new Set(['improvement', 'place_suggestion', 'general']);

function readRecords(storage, key) {
  const records = JSON.parse(storage.getItem(key) || '[]');
  return Array.isArray(records) ? records : [];
}

function track({ eventName, properties }) {
  try {
    const events = readRecords(sessionStorage, ANALYTICS_STORAGE_KEY);
    events.push({ eventName, properties, timestamp: new Date().toISOString() });
    sessionStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(events.slice(-MAX_SESSION_EVENTS)));
  } catch {
    // Tracking is optional when the browser blocks storage.
  }
}

async function createFeedback({ feedback_type, feedback_text }) {
  if (!FEEDBACK_TYPES.has(feedback_type) || typeof feedback_text !== 'string' || !feedback_text.trim()) {
    throw new TypeError('Choose a feedback type and enter a message.');
  }

  const record = {
    id: crypto.randomUUID(),
    feedback_type,
    feedback_text: feedback_text.trim(),
    created_date: new Date().toISOString(),
  };
  const persist = () => {
    const records = readRecords(localStorage, FEEDBACK_STORAGE_KEY);
    records.push(record);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(records));
  };

  if (navigator.locks) {
    await navigator.locks.request(FEEDBACK_STORAGE_KEY, persist);
  } else {
    persist();
  }
  return record;
}

export const base44 = {
  analytics: { track },
  entities: { Feedback: { create: createFeedback } },
};
