import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';
import { Download, Filter, Search, X, QrCode, Link as LinkIcon, MousePointerClick, ChevronDown, Globe, Monitor } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

import { useAnalytics } from '../hooks/useAnalytics';
import { processAnalytics } from '../utils/analyticsHelpers';

export default function Analytics({ activeWorkspace }) {
  const { logs, qrcodes, smartlinks, loading } = useAnalytics(activeWorkspace?.id);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCodeId = searchParams.get('codeId');
  const urlType = searchParams.get('type');

  const [selectedMainTab, setSelectedMainTab] = useState(urlType || 'qr');
  const [selectedCodeId, setSelectedCodeId] = useState(urlCodeId || null);
  const [timeframe, setTimeframe] = useState('30d');
  
  useEffect(() => {
    if (urlCodeId) setSelectedCodeId(urlCodeId);
    if (urlType) setSelectedMainTab(urlType);
  }, [urlCodeId, urlType]);

  const clearFilter = () => {
    setSelectedCodeId(null);
    setSearchParams({});
  };
  const [hoveredMainTab, setHoveredMainTab] = useState(null);
  
  const [modalType, setModalType] = useState(null); // 'top' | 'geo' | 'tech' | null
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isTimeframeDropdownOpen, setIsTimeframeDropdownOpen] = useState(false);

  // Pod-zakładki dla kolumn
  const [geoTab, setGeoTab] = useState('Kontynenty');
  const [techTab, setTechTab] = useState('Urządzenia');

  const isQr = selectedMainTab === 'qr';
  const themeColor = isQr ? '#1ea2e4' : '#8b5cf6';
  const themeBg = isQr ? 'rgba(30, 162, 228, 0.1)' : 'rgba(139, 92, 246, 0.1)';

  // Dynamic data processing
  const activeItems = isQr ? qrcodes : smartlinks;
  
  const {
    topItems, geoData, techData, chartLabels, chartData, totalLogs, uniqueVisits
  } = useMemo(() => {
    if (!logs || loading) return { topItems: [], geoData: [], techData: [], chartLabels: [], chartData: [], totalLogs: 0, uniqueVisits: 0 };
    return processAnalytics(logs, activeItems, timeframe, selectedMainTab, selectedCodeId, geoTab, techTab);
  }, [logs, activeItems, timeframe, selectedMainTab, selectedCodeId, geoTab, techTab, loading]);

  // Chart data configuration
  const lineData = {
    labels: chartLabels,
    datasets: [
      {
        label: isQr ? 'Skanowania' : 'Kliknięcia',
        data: chartData,
        borderColor: themeColor,
        backgroundColor: themeBg,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#0a0a0b',
        pointBorderColor: themeColor,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#fff',
        bodyColor: '#a1a1aa',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      }
    },
    scales: { 
      y: { 
        grid: { color: '#27272a', borderDash: [5, 5] },
        ticks: { color: '#71717a' },
        border: { display: false }
      },
      x: { 
        grid: { display: false },
        ticks: { color: '#71717a' },
        border: { display: false }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const mainTabs = [
    { id: 'qr', label: 'Zeskanowane kody QR' },
    { id: 'smartlink', label: 'Kliknięcia Smart linki' }
  ];

  const getModalConfig = () => {
    if (modalType === 'top') return {
      tabs: isQr ? ['Kody QR'] : ['Smart linki'],
      activeTab: isQr ? 'Kody QR' : 'Smart linki',
      setActiveTab: () => {}, // No op since there is only one tab now
      items: topItems,
      icon: isQr ? QrCode : MousePointerClick
    };
    if (modalType === 'geo') return {
      tabs: ['Kontynenty', 'Kraje', 'Regiony', 'Miasta'],
      activeTab: geoTab,
      setActiveTab: setGeoTab,
      items: geoData,
      icon: Globe
    };
    if (modalType === 'tech') return {
      tabs: ['Urządzenia', 'Przeglądarki', 'System operacyjny'],
      activeTab: techTab,
      setActiveTab: setTechTab,
      items: techData,
      icon: Monitor
    };
    return null;
  };

  const modalConfig = getModalConfig();

  return (
    <div className="space-y-6 pb-20 relative min-h-[80vh]">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-semibold">Analityka</h1>
          
          <div className="flex bg-[#0a0a0b] rounded-lg border border-border p-1">
            {mainTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedMainTab(tab.id)}
                onMouseEnter={() => setHoveredMainTab(tab.id)}
                onMouseLeave={() => setHoveredMainTab(null)}
                className={`relative px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${selectedMainTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {hoveredMainTab === tab.id && (
                  <motion.div layoutId="analytics-tab-hover" className="absolute inset-0 bg-white/5 rounded-md -z-10" initial={false} transition={{ type: "spring", bounce: 0, duration: 0.2 }} />
                )}
                {selectedMainTab === tab.id && (
                  <motion.div layoutId="analytics-tab-active" className="absolute inset-0 bg-[#1a1a1c] border border-border rounded-md -z-10" initial={false} transition={{ type: "spring", bounce: 0, duration: 0.2 }} />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-40 z-20">
            <button 
              onClick={() => setIsTimeframeDropdownOpen(!isTimeframeDropdownOpen)}
              className={`relative flex items-center justify-between gap-2 px-4 py-2.5 w-full rounded-lg text-sm transition-colors border bg-[#18181b] ${isTimeframeDropdownOpen ? 'border-gray-500 text-white' : 'border-border text-gray-300 hover:border-gray-500 hover:text-white'}`}
            >
              <span className="truncate flex-1 text-left">
                {timeframe === '7d' ? 'Ostatnie 7 dni' : timeframe === '30d' ? 'Ostatnie 30 dni' : timeframe === '1y' ? 'Ostatni rok' : 'Cały okres'}
              </span>
              <ChevronDown size={14} className={`text-gray-500 shrink-0 pointer-events-none transition-transform ${isTimeframeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isTimeframeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsTimeframeDropdownOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-full bg-[#0a0a0b] border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-1 flex flex-col">
                      {[
                        { val: '7d', label: 'Ostatnie 7 dni' },
                        { val: '30d', label: 'Ostatnie 30 dni' },
                        { val: '1y', label: 'Ostatni rok' },
                        { val: 'all', label: 'Cały okres' }
                      ].map((opt) => (
                        <button 
                          key={opt.val}
                          onClick={() => {
                            setTimeframe(opt.val);
                            setIsTimeframeDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${timeframe === opt.val ? `bg-[${themeColor}]/10 text-[${themeColor}]` : 'text-gray-300 hover:bg-white/5'}`}
                          style={timeframe === opt.val ? { color: themeColor, backgroundColor: themeBg } : {}}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`flex items-center justify-center px-4 py-2.5 rounded-lg text-sm border bg-[#18181b] shrink-0 transition-colors ${isFilterDropdownOpen ? 'border-gray-500 text-white' : 'border-border text-gray-300 hover:border-gray-500 hover:text-white'}`}
            >
              <Filter size={16} className="mr-2" />
              <span className="hidden sm:inline">Filtruj</span>
            </button>
            <AnimatePresence>
              {isFilterDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 lg:left-0 lg:right-auto mt-2 w-48 bg-[#0a0a0b] border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-1">
                    <button 
                      onClick={() => {
                        setSelectedMainTab('qr');
                        setModalType('top');
                        setIsFilterDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#1ea2e4]/10 hover:text-[#1ea2e4] rounded-lg transition-colors flex items-center gap-2"
                    >
                      <QrCode size={14} /> Wybierz Kod QR
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedMainTab('smartlink');
                        setModalType('top');
                        setIsFilterDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#8b5cf6]/10 hover:text-[#8b5cf6] rounded-lg transition-colors flex items-center gap-2"
                    >
                      <MousePointerClick size={14} /> Wybierz Smart Link
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors border bg-white text-black border-transparent hover:bg-gray-200 shrink-0 font-semibold">
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-[#0a0a0b] border border-border rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-20 blur-[100px] pointer-events-none transition-colors duration-1000" style={{ backgroundColor: themeColor }} />
        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">{totalLogs.toLocaleString('pl-PL')}</h2>
            <p className="text-sm text-gray-400 mt-1">Suma {isQr ? 'skanowań' : 'kliknięć'} w wybranym okresie</p>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold text-white tracking-tight">{uniqueVisits.toLocaleString('pl-PL')}</h3>
            <p className="text-sm text-gray-400 mt-1">Unikalne wizyty (Cookieless)</p>
          </div>
        </div>
        <div className="h-[300px] w-full relative z-10">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Col 1: Top List */}
        <div className="bg-[#0a0a0b] border border-border rounded-xl flex flex-col relative overflow-hidden h-[420px]">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-medium text-white">{isQr ? 'Kody QR' : 'Smart linki'}</h3>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1">
               <QrCode size={12} />
               {isQr ? 'SKANY' : 'KLIKNIĘCIA'}
            </span>
          </div>
          <div 
            className="p-2 flex-1 overflow-hidden group/list space-y-1"
            style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}
          >
            {topItems.map((item, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedCodeId(item.id)}
                className="relative flex items-center justify-between py-1.5 px-3 rounded-lg transition-colors cursor-pointer group/item hover:bg-white/5 overflow-hidden z-0"
              >
                <div className="absolute inset-[3px] z-[-1]">
                  <div 
                    className="h-full rounded-md transition-all duration-1000"
                    style={{ width: `${item.percentage}%`, backgroundColor: themeColor }}
                  />
                </div>
                <div className="flex items-center gap-3 overflow-hidden relative z-10">
                  {isQr ? <QrCode size={16} className="text-white shrink-0 drop-shadow-md" /> : <MousePointerClick size={16} className="text-white shrink-0 drop-shadow-md" />}
                  <span className="text-sm font-semibold text-white truncate drop-shadow-md">{item.name}</span>
                </div>
                <div className="flex items-center justify-end overflow-hidden w-[90px] shrink-0 relative h-6 z-10">
                  <div className="absolute right-0 top-0 h-full flex items-center justify-end transition-transform duration-300 transform translate-x-12 group-hover/list:translate-x-0">
                    <span className="text-sm font-bold text-white leading-none drop-shadow-md">{item.count}</span>
                    <span className="text-sm font-medium w-12 text-right leading-none drop-shadow-md" style={{ color: item.percentage >= 80 ? 'white' : themeColor }}>{parseFloat(item.percentage) === 100 ? '100' : item.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {topItems.length > 7 && (
            <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end justify-center pb-4 z-10 pointer-events-none">
              <button 
                onClick={() => setModalType('top')}
                className="px-6 py-2 bg-[#18181b] border border-border rounded-full text-sm font-medium text-white hover:border-gray-500 transition-colors pointer-events-auto shadow-lg"
              >
                Zobacz wszystko
              </button>
            </div>
          )}
        </div>

        {/* Col 2: Geo */}
        <div className="bg-[#0a0a0b] border border-border rounded-xl flex flex-col relative overflow-hidden h-[420px]">
          <div className="p-4 border-b border-border flex items-center gap-4 overflow-x-auto no-scrollbar relative">
            {['Kontynenty', 'Kraje', 'Regiony', 'Miasta'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setGeoTab(tab)}
                className={`relative text-sm font-medium whitespace-nowrap transition-colors pb-1 ${geoTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {geoTab === tab && (
                  <motion.div layoutId="geo-tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white z-10" />
                )}
                {tab}
              </button>
            ))}
          </div>
          <div 
            className="p-2 flex-1 overflow-hidden group/list space-y-1"
            style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}
          >
            {geoData.map((item, i) => (
              <div 
                key={i} 
                className="relative flex items-center justify-between py-1.5 px-3 rounded-lg transition-colors cursor-default group/item hover:bg-white/5 overflow-hidden z-0"
              >
                <div className="absolute inset-[3px] z-[-1]">
                  <div 
                    className="h-full rounded-md transition-all duration-1000"
                    style={{ width: `${item.percentage}%`, backgroundColor: themeColor }}
                  />
                </div>
                <div className="flex items-center gap-3 overflow-hidden relative z-10">
                  <Globe size={16} className="text-white shrink-0 drop-shadow-md" />
                  <span className="text-sm font-semibold text-white truncate drop-shadow-md">{item.name}</span>
                </div>
                <div className="flex items-center justify-end overflow-hidden w-[90px] shrink-0 relative h-6 z-10">
                  <div className="absolute right-0 top-0 h-full flex items-center justify-end transition-transform duration-300 transform translate-x-12 group-hover/list:translate-x-0">
                    <span className="text-sm font-bold text-white leading-none drop-shadow-md">{item.count}</span>
                    <span className="text-sm font-medium w-12 text-right leading-none drop-shadow-md" style={{ color: item.percentage >= 80 ? 'white' : themeColor }}>{parseFloat(item.percentage) === 100 ? '100' : item.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {geoData.length > 7 && (
            <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end justify-center pb-4 z-10 pointer-events-none">
              <button 
                onClick={() => setModalType('geo')}
                className="px-6 py-2 bg-[#18181b] border border-border rounded-full text-sm font-medium text-white hover:border-gray-500 transition-colors pointer-events-auto shadow-lg"
              >
                Zobacz wszystko
              </button>
            </div>
          )}
        </div>

        {/* Col 3: Tech */}
        <div className="bg-[#0a0a0b] border border-border rounded-xl flex flex-col relative overflow-hidden h-[420px]">
          <div className="p-4 border-b border-border flex items-center gap-4 overflow-x-auto no-scrollbar relative">
            {['Urządzenia', 'Przeglądarki', 'System operacyjny'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setTechTab(tab)}
                className={`relative text-sm font-medium whitespace-nowrap transition-colors pb-1 ${techTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {techTab === tab && (
                  <motion.div layoutId="tech-tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white z-10" />
                )}
                {tab}
              </button>
            ))}
          </div>
          <div 
            className="p-2 flex-1 overflow-hidden group/list space-y-1"
            style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}
          >
            {techData.map((item, i) => (
              <div 
                key={i} 
                className="relative flex items-center justify-between py-1.5 px-3 rounded-lg transition-colors cursor-default group/item hover:bg-white/5 overflow-hidden z-0"
              >
                <div className="absolute inset-[3px] z-[-1]">
                  <div 
                    className="h-full rounded-md transition-all duration-1000"
                    style={{ width: `${item.percentage}%`, backgroundColor: themeColor }}
                  />
                </div>
                <div className="flex items-center gap-3 overflow-hidden relative z-10">
                  <Monitor size={16} className="text-white shrink-0 drop-shadow-md" />
                  <span className="text-sm font-semibold text-white truncate drop-shadow-md">{item.name}</span>
                </div>
                <div className="flex items-center justify-end overflow-hidden w-[90px] shrink-0 relative h-6 z-10">
                  <div className="absolute right-0 top-0 h-full flex items-center justify-end transition-transform duration-300 transform translate-x-12 group-hover/list:translate-x-0">
                    <span className="text-sm font-bold text-white leading-none drop-shadow-md">{item.count}</span>
                    <span className="text-sm font-medium w-12 text-right leading-none drop-shadow-md" style={{ color: item.percentage >= 80 ? 'white' : themeColor }}>{parseFloat(item.percentage) === 100 ? '100' : item.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {techData.length > 7 && (
            <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end justify-center pb-4 z-10 pointer-events-none">
              <button 
                onClick={() => setModalType('tech')}
                className="px-6 py-2 bg-[#18181b] border border-border rounded-full text-sm font-medium text-white hover:border-gray-500 transition-colors pointer-events-auto shadow-lg"
              >
                Zobacz wszystko
              </button>
            </div>
          )}
        </div>
      </div>


      {/* Zobacz Wszystko Modal */}
      <AnimatePresence>
        {modalType && modalConfig && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => { setModalType(null); setModalSearchQuery(''); }}
            />
            
            <div className="relative flex flex-col items-center w-full max-w-lg">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#0a0a0b] border border-border rounded-2xl w-full overflow-hidden flex flex-col shadow-2xl"
                style={{ height: '60vh' }}
              >
                {/* Modal Header Tabs */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#0a0a0b]">
                  <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                    {modalConfig.tabs.map(tab => (
                      <button 
                        key={tab}
                        onClick={() => modalConfig.setActiveTab(tab)}
                        className={`relative pb-2 text-sm font-semibold transition-colors whitespace-nowrap ${modalConfig.activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                        {modalConfig.activeTab === tab && (
                          <motion.div layoutId="modal-tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
                        )}
                        {tab}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 shrink-0 ml-4">
                    <QrCode size={14} />
                    {isQr ? 'SKANY' : 'KLIKNIĘCIA'}
                  </span>
                </div>

                {/* Modal Search */}
                <div className="p-4 border-b border-border bg-[#0a0a0b] shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Szukaj..."
                      value={modalSearchQuery}
                      onChange={(e) => setModalSearchQuery(e.target.value)}
                      autoFocus
                      className={`w-full bg-[#18181b] border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none transition-colors text-white placeholder:text-gray-500 ${isQr ? 'focus:border-[#1ea2e4]' : 'focus:border-[#8b5cf6]'}`}
                    />
                  </div>
                </div>

                {/* Modal List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-[#0a0a0b] group/list space-y-1">
                  {modalConfig.items.filter(item => item.name.toLowerCase().includes(modalSearchQuery.toLowerCase())).map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => {
                        if (modalType === 'top') {
                          setSelectedCodeId(item.id);
                          setModalType(null);
                        }
                      }}
                      className={`relative flex items-center justify-between py-1.5 px-3 rounded-lg transition-colors group/item overflow-hidden z-0 ${modalType === 'top' ? 'cursor-pointer hover:bg-white/5' : 'cursor-default hover:bg-white/5'}`}
                    >
                      <div className="absolute inset-[3px] z-[-1]">
                        <div 
                          className="h-full rounded-md transition-all duration-1000"
                          style={{ width: `${item.percentage}%`, backgroundColor: themeColor }}
                        />
                      </div>
                      <div className="flex items-center gap-3 overflow-hidden relative z-10">
                        <modalConfig.icon size={16} className="text-white shrink-0 drop-shadow-md" />
                        <span className="text-sm font-semibold text-white truncate drop-shadow-md">{item.name}</span>
                      </div>
                      <div className="flex items-center justify-end overflow-hidden w-[90px] shrink-0 relative h-6 z-10">
                        <div className="absolute right-0 top-0 h-full flex items-center justify-end transition-transform duration-300 transform translate-x-12 group-hover/list:translate-x-0">
                          <span className="text-sm font-bold text-white leading-none drop-shadow-md">{item.count}</span>
                          <span className="text-sm font-medium w-12 text-right leading-none drop-shadow-md" style={{ color: item.percentage >= 80 ? 'white' : themeColor }}>{parseFloat(item.percentage) === 100 ? '100' : item.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Close Button Outside */}
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.1 }}
                onClick={() => { setModalType(null); setModalSearchQuery(''); }}
                className="mt-6 w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-colors shadow-xl shrink-0"
              >
                <X size={24} strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>
        )}
      </AnimatePresence>
      {/* Bottom Floating Filter Pill */}
      <AnimatePresence>
        {selectedCodeId && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 left-6 z-50 border backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 shadow-lg ${isQr ? 'bg-[#1ea2e4]/10 border-[#1ea2e4]/30 text-[#1ea2e4] shadow-[#1ea2e4]/5' : 'bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-[#8b5cf6] shadow-[#8b5cf6]/5'}`}
          >
            <div className="flex items-center gap-2">
              <Filter size={14} />
              <span className="text-sm font-medium">
                Analizujesz: <span className="font-bold text-white ml-1">
                  {activeItems.find(item => item.id === selectedCodeId)?.title || activeItems.find(item => item.id === selectedCodeId)?.name || 'Link'}
                </span>
              </span>
            </div>
            <div className={`w-px h-4 mx-1 ${isQr ? 'bg-[#1ea2e4]/30' : 'bg-[#8b5cf6]/30'}`}></div>
            <button 
              onClick={clearFilter}
              className={`transition-colors hover:text-white ${isQr ? 'text-[#1ea2e4]' : 'text-[#8b5cf6]'}`}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
