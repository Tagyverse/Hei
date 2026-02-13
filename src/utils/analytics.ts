import { db } from '../lib/firebase';
import { ref, push } from 'firebase/database';

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

/**
 * Track page view with both API and Firebase
 */
export async function trackPageView(path: string, metadata?: Record<string, any>) {
  try {
    const sessionId = getSessionId();
    const userId = localStorage.getItem('userId');
    const timestamp = new Date().toISOString();

    // Log to API endpoint
    await fetch('/api/track-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        referrer: document.referrer,
        sessionId,
        userId,
        timestamp,
        metadata,
      }),
    });

    // Also log to Firebase for persistent tracking
    await logToFirebase('page_view', {
      path,
      referrer: document.referrer,
      sessionId,
      userId,
      metadata,
    });

    console.log('[Analytics] Page view tracked:', path);
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}

/**
 * Track custom events to Firebase
 */
export async function trackEvent(
  eventType: string,
  eventData?: Record<string, any>
): Promise<void> {
  try {
    const sessionId = getSessionId();
    const userId = localStorage.getItem('userId');

    await logToFirebase(eventType, {
      ...eventData,
      sessionId,
      userId,
    });

    console.log('[Analytics] Event tracked:', eventType, eventData);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

/**
 * Log to Firebase analytics collection
 */
async function logToFirebase(
  eventType: string,
  data: Record<string, any>
): Promise<void> {
  try {
    const analyticsRef = ref(db, 'analytics');
    await push(analyticsRef, {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      ...data,
    });
  } catch (error) {
    console.error('[Firebase Analytics] Error logging:', error);
  }
}

/**
 * Track bill generation
 */
export async function trackBillGenerated(
  orderId: string,
  itemCount: number,
  totalAmount: number
): Promise<void> {
  await trackEvent('bill_generated', {
    order_id: orderId,
    item_count: itemCount,
    total_amount: totalAmount,
  });
}

/**
 * Track bill download
 */
export async function trackBillDownload(
  orderId: string,
  format: 'pdf' | 'jpg' | 'print'
): Promise<void> {
  await trackEvent('bill_download', {
    order_id: orderId,
    format,
  });
}

/**
 * Track admin action
 */
export async function trackAdminAction(
  action: string,
  details?: Record<string, any>
): Promise<void> {
  const adminId = localStorage.getItem('adminId');
  await trackEvent('admin_action', {
    action,
    admin_id: adminId,
    ...details,
  });
}

/**
 * Track try-on usage
 */
export async function trackTryOn(
  productId: string,
  method: 'camera' | 'upload'
): Promise<void> {
  await trackEvent('try_on_used', {
    product_id: productId,
    method,
  });
}

/**
 * Track product interaction
 */
export async function trackProductView(
  productId: string,
  productName: string
): Promise<void> {
  await trackEvent('product_viewed', {
    product_id: productId,
    product_name: productName,
  });
}

/**
 * Track add to cart
 */
export async function trackAddToCart(
  productId: string,
  quantity: number,
  price: number
): Promise<void> {
  await trackEvent('add_to_cart', {
    product_id: productId,
    quantity,
    price,
  });
}

/**
 * Track purchase
 */
export async function trackPurchase(
  orderId: string,
  totalAmount: number,
  itemCount: number
): Promise<void> {
  await trackEvent('purchase_completed', {
    order_id: orderId,
    total_amount: totalAmount,
    item_count: itemCount,
  });
}

/**
 * Initialize analytics tracking
 */
export function initAnalytics() {
  trackPageView(window.location.pathname);

  let lastPath = window.location.pathname;
  const checkPathInterval = setInterval(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      trackPageView(currentPath);
      lastPath = currentPath;
    }
  }, 1000);

  // Track user session start
  trackEvent('session_start', {
    user_agent: navigator.userAgent,
    language: navigator.language,
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(checkPathInterval);
    trackEvent('session_end');
  });

  return { clearInterval };
}
