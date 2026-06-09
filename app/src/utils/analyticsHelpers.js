export function processAnalytics(logs, activeItems, timeframe, selectedMainTab, selectedCodeId, geoTab, techTab) {
  // 1. Time filtering
  const now = new Date();
  let cutoff = null;
  let daysToShow = 30;

  if (timeframe === '7d') { cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7); daysToShow = 7; }
  else if (timeframe === '30d') { cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30); daysToShow = 30; }
  else if (timeframe === '1y') { cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()); daysToShow = 365; }

  let filteredLogs = logs.filter(log => log.type === selectedMainTab);
  
  if (cutoff) {
    filteredLogs = filteredLogs.filter(log => log.timestamp?.toDate() >= cutoff);
  }
  if (selectedCodeId) {
    filteredLogs = filteredLogs.filter(log => log.codeId === selectedCodeId);
  }

  // 2. Top Items
  const itemCounts = {};
  filteredLogs.forEach(log => {
    itemCounts[log.codeId] = (itemCounts[log.codeId] || 0) + 1;
  });

  const topItemsData = Object.entries(itemCounts)
    .map(([codeId, count]) => {
      const doc = activeItems.find(item => item.id === codeId);
      return {
        id: codeId,
        name: doc?.title || doc?.name || doc?.targetUrl || codeId,
        count
      };
    })
    .sort((a, b) => b.count - a.count);

  const topItemsTotal = topItemsData.reduce((acc, curr) => acc + curr.count, 0);
  const topItems = topItemsData.map(item => ({
    ...item,
    percentage: topItemsTotal > 0 ? ((item.count / topItemsTotal) * 100).toFixed(1) : 0
  }));

  // 3. Geo & Tech Aggregation
  const getAggregatedData = (field) => {
    const counts = {};
    filteredLogs.forEach(log => {
      const val = log[field] || 'Nieznane';
      counts[val] = (counts[val] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  const geoMap = { 'Kontynenty': 'continent', 'Kraje': 'country', 'Regiony': 'region', 'Miasta': 'city' };
  const techMap = { 'Urządzenia': 'device', 'Przeglądarki': 'browser', 'System operacyjny': 'os' };

  const geoData = getAggregatedData(geoMap[geoTab]);
  const techData = getAggregatedData(techMap[techTab]);

  // 4. Chart Data
  const labels = [];
  const chartDataArray = [];
  const chartMap = {};

  // Initialize empty chart slots
  if (timeframe !== 'all') {
    const step = daysToShow > 30 ? Math.ceil(daysToShow / 30) : 1; // Simplify x-axis if lots of days
    for (let i = daysToShow - 1; i >= 0; i -= step) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toLocaleDateString('pl-PL', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const label = d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
      labels.push(label);
      chartMap[key] = { index: labels.length - 1, count: 0 };
    }
    labels.forEach(() => chartDataArray.push(0));

    filteredLogs.forEach(log => {
      if (log.timestamp) {
        const logDate = log.timestamp.toDate();
        const key = logDate.toLocaleDateString('pl-PL', { year: 'numeric', month: '2-digit', day: '2-digit' });
        if (chartMap[key] !== undefined) {
          chartDataArray[chartMap[key].index]++;
        }
      }
    });
  } else {
    // For 'all' timeframe, group by month
    filteredLogs.forEach(log => {
      if (log.timestamp) {
        const d = log.timestamp.toDate();
        const key = d.toLocaleDateString('pl-PL', { year: 'numeric', month: 'short' });
        chartMap[key] = (chartMap[key] || 0) + 1;
      }
    });
    Object.entries(chartMap).forEach(([k, v]) => {
      labels.push(k);
      chartDataArray.push(v);
    });
  }

  // 5. Unique Visits
  const uniqueVisitorHashes = new Set();
  filteredLogs.forEach(log => {
    if (log.visitorHash) uniqueVisitorHashes.add(log.visitorHash);
  });

  return {
    topItems,
    geoData,
    techData,
    chartLabels: labels,
    chartData: chartDataArray,
    totalLogs: filteredLogs.length,
    uniqueVisits: uniqueVisitorHashes.size
  };
}
