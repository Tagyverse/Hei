const onRequest = async (context) => {
  const { request, env } = context;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
  try {
    if (!env.ANALYTICS_KV) {
      throw new Error("ANALYTICS_KV binding not configured. Please add KV namespace binding in Cloudflare Dashboard.");
    }
    const list = await env.ANALYTICS_KV.list({ prefix: "view:" });
    const viewKeys = list.keys.map((k) => k.name);
    const views = [];
    for (const key of viewKeys) {
      const data = await env.ANALYTICS_KV.get(key);
      if (data) {
        views.push(JSON.parse(data));
      }
    }
    const now = Date.now();
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const todayStart = new Date(today).getTime();
    const todayViews = views.filter((v) => v.timestamp >= todayStart);
    const todayVisitors = new Set(todayViews.map((v) => v.sessionId)).size;
    const uniqueVisitors = new Set(views.map((v) => v.sessionId)).size;
    const pageCounts = views.reduce((acc, view) => {
      acc[view.path] = (acc[view.path] || 0) + 1;
      return acc;
    }, {});
    const topPages = Object.entries(pageCounts).map(([path, views2]) => ({ path, views: views2 })).sort((a, b) => b.views - a.views).slice(0, 5);
    const countryCounts = views.reduce((acc, view) => {
      if (view.country && view.country !== "Unknown") {
        acc[view.country] = (acc[view.country] || 0) + 1;
      }
      return acc;
    }, {});
    const countryFlags = {
      "IN": "\u{1F1EE}\u{1F1F3}",
      "US": "\u{1F1FA}\u{1F1F8}",
      "GB": "\u{1F1EC}\u{1F1E7}",
      "CA": "\u{1F1E8}\u{1F1E6}",
      "AU": "\u{1F1E6}\u{1F1FA}",
      "DE": "\u{1F1E9}\u{1F1EA}",
      "FR": "\u{1F1EB}\u{1F1F7}",
      "JP": "\u{1F1EF}\u{1F1F5}",
      "BR": "\u{1F1E7}\u{1F1F7}",
      "MX": "\u{1F1F2}\u{1F1FD}",
      "SG": "\u{1F1F8}\u{1F1EC}",
      "NL": "\u{1F1F3}\u{1F1F1}",
      "SE": "\u{1F1F8}\u{1F1EA}",
      "NO": "\u{1F1F3}\u{1F1F4}",
      "DK": "\u{1F1E9}\u{1F1F0}"
    };
    const topCountries = Object.entries(countryCounts).map(([country, visits]) => ({
      country,
      visits,
      flag: countryFlags[country] || "\u{1F30D}"
    })).sort((a, b) => b.visits - a.visits).slice(0, 5);
    const hourlyCounts = Array(24).fill(0);
    todayViews.forEach((view) => {
      const hour = new Date(view.timestamp).getHours();
      hourlyCounts[hour]++;
    });
    const hourlyData = hourlyCounts.map((views2, hour) => ({
      hour: `${hour}:00`,
      views: views2
    }));
    const weekAgo = now - 7 * 24 * 60 * 60 * 1e3;
    const weeklyViews = views.filter((v) => v.timestamp >= weekAgo);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyStats = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(now - i * 24 * 60 * 60 * 1e3);
      const dayName = dayNames[date.getDay()];
      weeklyStats[dayName] = { views: 0, sessions: /* @__PURE__ */ new Set() };
    }
    weeklyViews.forEach((view) => {
      const date = new Date(view.timestamp);
      const dayName = dayNames[date.getDay()];
      if (weeklyStats[dayName]) {
        weeklyStats[dayName].views++;
        weeklyStats[dayName].sessions.add(view.sessionId);
      }
    });
    const weeklyArray = Object.entries(weeklyStats).map(([day, stats]) => ({
      day,
      views: stats.views,
      visitors: stats.sessions.size
    })).sort((a, b) => {
      const order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return order.indexOf(a.day) - order.indexOf(b.day);
    });
    const browserCounts = views.reduce((acc, view) => {
      if (view.browser) {
        acc[view.browser] = (acc[view.browser] || 0) + 1;
      }
      return acc;
    }, {});
    const totalBrowserViews = views.length || 1;
    const browserData = Object.entries(browserCounts).map(([browser, count]) => ({
      browser,
      percentage: Math.round(count / totalBrowserViews * 100)
    })).sort((a, b) => b.percentage - a.percentage);
    const deviceCounts = views.reduce((acc, view) => {
      if (view.deviceType) {
        acc[view.deviceType] = (acc[view.deviceType] || 0) + 1;
      }
      return acc;
    }, {});
    const totalDeviceViews = views.length || 1;
    const deviceData = Object.entries(deviceCounts).map(([device, count]) => ({
      device,
      percentage: Math.round(count / totalDeviceViews * 100)
    })).sort((a, b) => b.percentage - a.percentage);
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
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Failed to get analytics:", error);
    return new Response(JSON.stringify({ error: "Failed to get analytics" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
export {
  onRequest
};
