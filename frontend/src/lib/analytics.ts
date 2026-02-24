const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function getSessionId() {
  if (typeof window === 'undefined') return undefined;
  try {
    let id = localStorage.getItem('qt_session_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('qt_session_id', id);
    }
    return id;
  } catch {
    return undefined;
  }
}

export async function trackPageView(path: string) {
  if (!API_BASE || typeof window === 'undefined') return;
  try {
    const sessionId = getSessionId();
    await fetch(`${API_BASE}/analytics/page-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        referrer: document.referrer || null,
        sessionId,
      }),
    });
  } catch {
    // swallow analytics errors
  }
}

export async function trackEvent(eventName: string, metadata: Record<string, any> = {}) {
  if (!API_BASE || typeof window === 'undefined') return;
  try {
    const sessionId = getSessionId();
    await fetch(`${API_BASE}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        page: window.location.pathname,
        sessionId,
        metadata,
      }),
    });
  } catch {
    // ignore
  }
}

