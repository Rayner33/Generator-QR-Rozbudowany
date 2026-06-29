export function processAnalytics(logs, activeItems, timeframe, selectedMainTab, activeFilters, geoTab, techTab, utmTab) {
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
  
  if (activeFilters && activeFilters.length > 0) {
    filteredLogs = filteredLogs.filter(log => {
      return activeFilters.every(filter => {
        if (filter.id.startsWith('utm.')) {
          const utmKey = filter.id.split('.')[1];
          return log.utm && log.utm[utmKey] === filter.value;
        }
        return log[filter.id] === filter.value;
      });
    });
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
  // Słownik normalizujący i tłumaczący na język polski (dla starych logów geoip-lite i anglojęzycznych wpisów MaxMind)
  const geoNormalizationMap = {
    // Kontynenty
    'EU': 'Europa',
    'Europe': 'Europa',
    'NA': 'Ameryka Północna',
    'North America': 'Ameryka Północna',
    'SA': 'Ameryka Południowa',
    'South America': 'Ameryka Południowa',
    'AS': 'Azja',
    'Asia': 'Azja',
    'AF': 'Afryka',
    'Africa': 'Afryka',
    'OC': 'Oceania',
    'Oceania': 'Oceania',
    'Antarctica': 'Antarktyda',
    
    // Popularne Kraje (MaxMind domyślnie wysyła po angielsku)
    'Poland': 'Polska',
    'Germany': 'Niemcy',
    'United Kingdom': 'Wielka Brytania',
    'United States': 'Stany Zjednoczone',
    'France': 'Francja',
    'Italy': 'Włochy',
    'Spain': 'Hiszpania',
    'Czechia': 'Czechy',
    'Slovakia': 'Słowacja',
    'Ukraine': 'Ukraina',
    
    // Miasta (Naprawa braku polskich znaków lub łączenie duplikatów)
    'Warsaw': 'Warszawa',
    'Krakow': 'Kraków',
    'Wroclaw': 'Wrocław',
    'Gdansk': 'Gdańsk',
    'Poznan': 'Poznań',
    'Lodz': 'Łódź'
  };

  const getAggregatedData = (field) => {
    const counts = {};
    filteredLogs.forEach(log => {
      let val = log[field] || 'Nieznane';
      if (geoNormalizationMap[val]) {
        val = geoNormalizationMap[val];
      }
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

  const utmMap = { 'Source': 'source', 'Medium': 'medium', 'Campaign': 'campaign', 'Content': 'content' };
  const getUtmAggregatedData = (field) => {
    const counts = {};
    filteredLogs.forEach(log => {
      if (log.utm && log.utm[field]) {
        const val = log.utm[field];
        counts[val] = (counts[val] || 0) + 1;
      }
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
  const utmData = getUtmAggregatedData(utmMap[utmTab]);

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
    utmData,
    chartLabels: labels,
    chartData: chartDataArray,
    totalLogs: filteredLogs.length,
    uniqueVisits: uniqueVisitorHashes.size,
    filteredLogs
  };
}

export function buildUrlWithUtm(url, utm) {
  if (!url) return '';

  
  try {
    let urlToParse = url;
    if (!urlToParse.startsWith('http://') && !urlToParse.startsWith('https://')) {
      urlToParse = 'https://' + urlToParse;
    }
    const urlObj = new URL(urlToParse);
    
    // Clear existing to avoid duplicates if they exist
    urlObj.searchParams.delete('utm_source');
    urlObj.searchParams.delete('utm_medium');
    urlObj.searchParams.delete('utm_campaign');
    urlObj.searchParams.delete('utm_content');
    
    // Add new ones if they exist
    if (utm) {
      if (utm.source) urlObj.searchParams.set('utm_source', utm.source);
      if (utm.medium) urlObj.searchParams.set('utm_medium', utm.medium);
      if (utm.campaign) urlObj.searchParams.set('utm_campaign', utm.campaign);
      if (utm.content) urlObj.searchParams.set('utm_content', utm.content);
    }
    
    let finalString = urlObj.toString();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
       finalString = finalString.replace(/^https:\/\//, '');
    }
    
    return finalString;
  } catch (e) {
    return url;
  }
}
