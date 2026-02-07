let sessionId: string | null = null;

function getSessionId(): string {
  if (sessionId) return sessionId;

  const stored = sessionStorage.getItem('analytics_session_id');
  if (stored) {
    sessionId = stored;
    return sessionId;
  }

  sessionId = crypto.randomUUID();
  sessionStorage.setItem('analytics_session_id', sessionId);
  return sessionId;
}

export async function trackPageView(path: string) {
  try {
    const sessionId = getSessionId();

    await fetch('/api/track-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        referrer: document.referrer,
        sessionId,
      }),
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}

export function initAnalytics() {
  trackPageView(window.location.pathname);

  let lastPath = window.location.pathname;
  setInterval(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      trackPageView(currentPath);
      lastPath = currentPath;
    }
  }, 1000);
}
