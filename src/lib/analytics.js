const visitorKey = 'stream-world-visitor-id';

export function getVisitorId() {
  try {
    let id = localStorage.getItem(visitorKey);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(visitorKey, id);
    }
    return id;
  } catch {
    return null;
  }
}

export function trackEvent(event) {
  const visitorId = getVisitorId();
  if (!visitorId) return;
  const payload = JSON.stringify({ action: 'event', visitorId, ...event });
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', new Blob([payload], { type: 'application/json' }));
  } else {
    fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
  }
}
