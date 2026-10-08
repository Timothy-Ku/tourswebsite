// Google Analytics 4 (GA4) & Engagement Tracker Utility

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

// Default GA4 Measurement ID
export const DEFAULT_GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-KAGZSAFARI';

// In-memory & LocalStorage event buffer for live Admin Dashboard Analytics
export interface AnalyticsEventRecord {
  id: string;
  eventName: string;
  params: Record<string, any>;
  timestamp: string;
}

const ANALYTICS_STORAGE_KEY = 'kagz_analytics_logs';
const GA_ID_STORAGE_KEY = 'kagz_ga_measurement_id';

export function getStoredGaId(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(GA_ID_STORAGE_KEY) || DEFAULT_GA_ID;
  }
  return DEFAULT_GA_ID;
}

export function setStoredGaId(id: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GA_ID_STORAGE_KEY, id);
    initGoogleAnalytics(id);
  }
}

let isGaInitialized = false;

// Initialize Google Analytics (gtag.js)
export function initGoogleAnalytics(measurementId?: string): void {
  if (typeof window === 'undefined') return;

  const gaId = measurementId || getStoredGaId();
  if (!gaId) return;

  // Setup dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  // Check if script is already added
  const existingScript = document.getElementById('ga-gtag-script');
  if (existingScript) {
    existingScript.remove();
  }

  // Inject Google Tag script
  const script = document.createElement('script');
  script.id = 'ga-gtag-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', gaId, {
    send_page_view: false, // We handle SPA page views manually
    cookie_flags: 'SameSite=None;Secure',
  });

  isGaInitialized = true;
  console.log(`[Google Analytics 4] Initialized with ID: ${gaId}`);
}

// Get analytics log buffer
export function getAnalyticsLogs(): AnalyticsEventRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Log event locally for Admin Dashboard GA Inspector
function logEventLocally(eventName: string, params: Record<string, any> = {}): void {
  if (typeof window === 'undefined') return;
  try {
    const logs = getAnalyticsLogs();
    const newRecord: AnalyticsEventRecord = {
      id: 'ga-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      eventName,
      params,
      timestamp: new Date().toISOString(),
    };
    const updated = [newRecord, ...logs].slice(0, 300); // Keep last 300 events
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Analytics local log error:', e);
  }
}

// Track GA4 Page Views
export function trackPageView(pagePath: string, pageTitle?: string): void {
  if (typeof window === 'undefined') return;

  if (!isGaInitialized) {
    initGoogleAnalytics();
  }

  const gaId = getStoredGaId();
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      send_to: gaId,
    });
  }

  logEventLocally('page_view', { page_path: pagePath, page_title: pageTitle || document.title });
}

// Track Generic GA4 Event
export function trackEvent(eventName: string, params: Record<string, any> = {}): void {
  if (typeof window === 'undefined') return;

  if (!isGaInitialized) {
    initGoogleAnalytics();
  }

  if (window.gtag) {
    window.gtag('event', eventName, params);
  }

  logEventLocally(eventName, params);
}

// Domain Specific Tracking Helpers
export function trackDestinationView(destId: string, destName: string): void {
  trackEvent('view_item', {
    item_type: 'destination',
    item_id: destId,
    item_name: destName,
  });
}

export function trackTourView(tourId: string, tourTitle: string): void {
  trackEvent('view_item', {
    item_type: 'tour',
    item_id: tourId,
    item_name: tourTitle,
  });
}

export function trackArticleView(articleId: string, articleTitle: string): void {
  trackEvent('select_content', {
    content_type: 'article',
    item_id: articleId,
    title: articleTitle,
  });
}

export function trackEnquirySubmit(destination: string, travelers: string, style: string): void {
  trackEvent('generate_lead', {
    event_category: 'engagement',
    destination,
    travelers,
    safari_style: style,
    value: 100, // Estimated lead value score
    currency: 'USD',
  });
}

export function trackEmailSent(recipient: string, templateKey: string): void {
  trackEvent('send_email_direct', {
    event_category: 'curator_action',
    recipient_domain: recipient.split('@')[1] || 'client',
    template_key: templateKey,
  });
}

export function trackWhatsAppClick(guestName?: string): void {
  trackEvent('contact_whatsapp', {
    event_category: 'conversion',
    guest_name: guestName || 'Anonymous',
  });
}

// Summary Statistics for GA Dashboard in Admin Console
export function getAnalyticsSummary() {
  const logs = getAnalyticsLogs();
  const pageViews = logs.filter(l => l.eventName === 'page_view');
  const leadsGenerated = logs.filter(l => l.eventName === 'generate_lead');
  const emailDispatches = logs.filter(l => l.eventName === 'send_email_direct');
  const whatsAppClicks = logs.filter(l => l.eventName === 'contact_whatsapp');

  // Count top visited pages
  const pageCounts: Record<string, number> = {};
  pageViews.forEach(pv => {
    const path = pv.params?.page_path || '/';
    pageCounts[path] = (pageCounts[path] || 0) + 1;
  });

  const topPages = Object.entries(pageCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalEvents: logs.length,
    totalPageViews: pageViews.length,
    leadsGenerated: leadsGenerated.length,
    emailDispatches: emailDispatches.length,
    whatsAppClicks: whatsAppClicks.length,
    topPages,
    recentEvents: logs.slice(0, 20),
  };
}
