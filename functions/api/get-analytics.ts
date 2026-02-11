import type { RequestContext } from '@cloudflare/workers-types';

interface Env {
  ANALYTICS_KV: KVNamespace;
}

interface PageView {
  path: string;
  referrer: string | null;
  userAgent: string;
  country: string;
  city: string;
  deviceType: string;
  browser: string;
  sessionId: string;
  timestamp: number;
}

// Generate sample data for development/demo
function generateSampleData() {
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  
  // Sample hourly data
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    views: Math.floor(Math.random() * 50) + (i >= 9 && i <= 18 ? 30 : 10)
  }));
  
  // Sample weekly data
  const weeklyData = [
    { day: 'Mon', views: Math.floor(Math.random() * 200) + 100, visitors: Math.floor(Math.random() * 80) + 40 },
    { day: 'Tue', views: Math.floor(Math.random() * 200) + 100, visitors: Math.floor(Math.random() * 80) + 40 },
    { day: 'Wed', views: Math.floor(Math.random() * 200) + 100, visitors: Math.floor(Math.random() * 80) + 40 },
    { day: 'Thu', views: Math.floor(Math.random() * 200) + 100, visitors: Math.floor(Math.random() * 80) + 40 },
    { day: 'Fri', views: Math.floor(Math.random() * 200) + 100, visitors: Math.floor(Math.random() * 80) + 40 },
    { day: 'Sat', views: Math.floor(Math.random() * 150) + 80, visitors: Math.floor(Math.random() * 60) + 30 },
    { day: 'Sun', views: Math.floor(Math.random() * 150) + 80, visitors: Math.floor(Math.random() * 60) + 30 },
  ];
  
  return {
    todayViews: Math.floor(Math.random() * 500) + 200,
    todayVisitors: Math.floor(Math.random() * 150) + 80,
    totalViews: Math.floor(Math.random() * 10000) + 5000,
    uniqueVisitors: Math.floor(Math.random() * 3000) + 1500,
    topPages: [
      { path: '/', views: Math.floor(Math.random() * 500) + 300 },
      { path: '/shop', views: Math.floor(Math.random() * 400) + 200 },
      { path: '/categories', views: Math.floor(Math.random() * 300) + 150 },
      { path: '/cart', views: Math.floor(Math.random() * 200) + 100 },
      { path: '/checkout', views: Math.floor(Math.random() * 150) + 80 },
    ],
    topCountries: [
      { country: 'IN', visits: Math.floor(Math.random() * 2000) + 1000, flag: '🇮🇳' },
      { country: 'US', visits: Math.floor(Math.random() * 500) + 200, flag: '🇺🇸' },
      { country: 'GB', visits: Math.floor(Math.random() * 300) + 100, flag: '🇬🇧' },
      { country: 'CA', visits: Math.floor(Math.random() * 200) + 80, flag: '🇨🇦' },
      { country: 'AU', visits: Math.floor(Math.random() * 150) + 50, flag: '🇦🇺' },
    ],
    hourlyData,
    weeklyData,
    browserData: [
      { browser: 'Chrome', percentage: 55 },
      { browser: 'Safari', percentage: 25 },
      { browser: 'Firefox', percentage: 12 },
      { browser: 'Edge', percentage: 5 },
      { browser: 'Other', percentage: 3 },
    ],
    deviceData: [
      { device: 'Mobile', percentage: 65 },
      { device: 'Desktop', percentage: 30 },
      { device: 'Tablet', percentage: 5 },
    ],
  };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context as RequestContext<Env>;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    // If ANALYTICS_KV is not configured, return sample data
    if (!env.ANALYTICS_KV) {
      const sampleData = generateSampleData();
      return new Response(JSON.stringify(sampleData), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Dev-Mode': 'true',
        },
      });
    }

    const list = await env.ANALYTICS_KV.list({ prefix: 'view:' });
    const viewKeys = list.keys.map(k => k.name);

    const views: PageView[] = [];
    for (const key of viewKeys) {
      const data = await env.ANALYTICS_KV.get(key);
      if (data) {
        views.push(JSON.parse(data));
      }
    }

    // If no views yet, return sample data
    if (views.length === 0) {
      const sampleData = generateSampleData();
      return new Response(JSON.stringify(sampleData), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Dev-Mode': 'true',
        },
      });
    }

    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const todayStart = new Date(today).getTime();

    const todayViews = views.filter(v => v.timestamp >= todayStart);
    const todayVisitors = new Set(todayViews.map(v => v.sessionId)).size;

    const uniqueVisitors = new Set(views.map(v => v.sessionId)).size;

    const pageCounts = views.reduce((acc: Record<string, number>, view) => {
      acc[view.path] = (acc[view.path] || 0) + 1;
      return acc;
    }, {});

    const topPages = Object.entries(pageCounts)
      .map(([path, views]) => ({ path, views: views as number }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    const countryCounts = views.reduce((acc: Record<string, number>, view) => {
      if (view.country && view.country !== 'Unknown') {
        acc[view.country] = (acc[view.country] || 0) + 1;
      }
      return acc;
    }, {});

    const countryFlags: Record<string, string> = {
      'IN': '🇮🇳', 'US': '🇺🇸', 'GB': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺',
      'DE': '🇩🇪', 'FR': '🇫🇷', 'JP': '🇯🇵', 'BR': '🇧🇷', 'MX': '🇲🇽',
      'SG': '🇸🇬', 'NL': '🇳🇱', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰'
    };

    const topCountries = Object.entries(countryCounts)
      .map(([country, visits]) => ({
        country,
        visits: visits as number,
        flag: countryFlags[country] || '🌍'
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);

    const hourlyCounts = Array(24).fill(0);
    todayViews.forEach(view => {
      const hour = new Date(view.timestamp).getHours();
      hourlyCounts[hour]++;
    });

    const hourlyData = hourlyCounts.map((views, hour) => ({
      hour: `${hour}:00`,
      views
    }));

    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const weeklyViews = views.filter(v => v.timestamp >= weekAgo);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyStats: Record<string, { views: number; sessions: Set<string> }> = {};

    for (let i = 0; i < 7; i++) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayName = dayNames[date.getDay()];
      weeklyStats[dayName] = { views: 0, sessions: new Set() };
    }

    weeklyViews.forEach(view => {
      const date = new Date(view.timestamp);
      const dayName = dayNames[date.getDay()];
      if (weeklyStats[dayName]) {
        weeklyStats[dayName].views++;
        weeklyStats[dayName].sessions.add(view.sessionId);
      }
    });

    const weeklyArray = Object.entries(weeklyStats)
      .map(([day, stats]) => ({
        day,
        views: stats.views,
        visitors: stats.sessions.size
      }))
      .sort((a, b) => {
        const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return order.indexOf(a.day) - order.indexOf(b.day);
      });

    const browserCounts = views.reduce((acc: Record<string, number>, view) => {
      if (view.browser) {
        acc[view.browser] = (acc[view.browser] || 0) + 1;
      }
      return acc;
    }, {});

    const totalBrowserViews = views.length || 1;
    const browserData = Object.entries(browserCounts)
      .map(([browser, count]) => ({
        browser,
        percentage: Math.round((count as number / totalBrowserViews) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const deviceCounts = views.reduce((acc: Record<string, number>, view) => {
      if (view.deviceType) {
        acc[view.deviceType] = (acc[view.deviceType] || 0) + 1;
      }
      return acc;
    }, {});

    const totalDeviceViews = views.length || 1;
    const deviceData = Object.entries(deviceCounts)
      .map(([device, count]) => ({
        device,
        percentage: Math.round((count as number / totalDeviceViews) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const analyticsData = {
      todayViews: todayViews.length,
      todayVisitors,
      totalViews: views.length,
      uniqueVisitors,
      topPages,
      topCountries,
      hourlyData,
      weeklyData: weeklyArray,
      browserData,
      deviceData
    };

    return new Response(JSON.stringify(analyticsData), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Failed to get analytics:', error);
    return new Response(JSON.stringify({ error: 'Failed to get analytics' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
