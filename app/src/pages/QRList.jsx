import React, { useState, useEffect } from 'react';
import { Download, MoreVertical, QrCode, Check, X, Wifi } from 'lucide-react';
import TagManagerModal from '../components/tags/TagManagerModal';
import { getTagColorInfo } from '../utils/tagColors';
import { Line } from 'react-chartjs-2';
import QRCodeStyling from 'qr-code-styling';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import QRModal from '../components/QRModal';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
);

const sparklineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false }
  },
  scales: {
    x: { display: false },
    y: { display: false, min: 0 }
  },
  elements: {
    point: { radius: 0 },
    line: { tension: 0.4, borderWidth: 2 }
  }
};

export default function QRList({ activeWorkspace, onEdit, onDuplicate, onAnalytics }) {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  const [sortFilter, setSortFilter] = useState('recent');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState({});
  
  // Tagi
  const [allTags, setAllTags] = useState([]);
  const [activeTagFilters, setActiveTagFilters] = useState([]);
  const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [codeForTagManager, setCodeForTagManager] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLinkId, setCopiedLinkId] = useState(null);
  
  // Modale potwierdzające
  const [codeToArchive, setCodeToArchive] = useState(null);
  const [codeToReset, setCodeToReset] = useState(null);

  // Zamykanie dropdowna przy kliknięciu gdziekolwiek
  useEffect(() => {
    const handleClick = () => {
      setOpenDropdownId(null);
      setIsFilterOpen(false);
      setIsTagsDropdownOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (!activeWorkspace) return;
    setLoading(true);

    const q = query(collection(db, "qrcodes"), where("workspaceId", "==", activeWorkspace.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let codesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt ? new Date(doc.data().createdAt.toDate()).toLocaleDateString() : 'Brak daty'
      }));
      setCodes(codesData);
      setLoading(false);
    });

    const tagsQ = query(collection(db, "tags"), where("workspaceId", "==", activeWorkspace.id));
    const unsubTags = onSnapshot(tagsQ, (snapshot) => {
      setAllTags(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribe();
      unsubTags();
    };
  }, [activeWorkspace]);

  useEffect(() => {
    if (activeWorkspace?.type === 'team') {
      getDocs(collection(db, "users")).then(snap => {
        const usersMap = {};
        snap.docs.forEach(doc => {
          usersMap[doc.id] = doc.data();
        });
        setTeamMembers(usersMap);
      }).catch(console.error);
    }
  }, [activeWorkspace]);

  const getQrDataToEncode = (code) => {
    if (code.contentType === 'wifi') {
      const { ssid, password, type } = code.wifiData || {};
      const auth = type === 'nopass' ? '' : `T:${type};`;
      return `WIFI:S:${ssid};${auth}P:${password};;`;
    }
    return `https://${window.location.host}/U${code.id.slice(0, 5)}v4S`;
  };

  const handleDownload = (code, extension) => {
    const dotsColor = code.dotsColor || "#000000";
    const eyeColor = code.eyeColor || dotsColor;
    const backgroundColor = code.backgroundColor || "#ffffff";
    
    const qrCode = new QRCodeStyling({
      width: 1024,
      height: 1024,
      data: getQrDataToEncode(code),
      image: code.logoBase64 || undefined,
      margin: 10,
      qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: "Q" },
      imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 10, crossOrigin: "anonymous" },
      dotsOptions: { color: dotsColor, type: code.styleType || "rounded" },
      backgroundOptions: { color: backgroundColor },
      cornersSquareOptions: { color: eyeColor, type: code.styleType === 'dots' ? 'dot' : (code.styleType === 'square' ? 'square' : 'extra-rounded') },
      cornersDotOptions: { color: eyeColor, type: code.styleType === 'square' ? 'square' : 'dot' }
    });

    qrCode.download({ name: `QR_${code.title || 'kod'}_${code.id}`, extension });
  };

  const handleArchive = (code) => {
    updateDoc(doc(db, "qrcodes", code.id), { archived: true });
    setCodeToArchive(null);
  };

  const handleRestore = (code) => {
    updateDoc(doc(db, "qrcodes", code.id), { archived: false });
  };

  const handleResetAnalytics = (code) => {
    updateDoc(doc(db, "qrcodes", code.id), { scans: 0 });
    setCodeToReset(null);
  };

  const processedCodes = codes
    .filter(c => sortFilter === 'archived' ? c.archived : !c.archived)
    .filter(c => activeTagFilters.length > 0 ? activeTagFilters.some(id => c.tags?.includes(id)) : true)
    .filter(c => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchUrl = c.url?.toLowerCase().includes(q);
      const matchEmail = c.emailData?.address?.toLowerCase().includes(q);
      return matchTitle || matchUrl || matchEmail;
    })
    .sort((a, b) => {
      if (sortFilter === 'scans') {
        return (b.scans || 0) - (a.scans || 0);
      }
      const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });

  const getFilterLabel = () => {
    if (sortFilter === 'scans') return 'Najwięcej skanów';
    if (sortFilter === 'archived') return 'Zarchiwizowane';
    return 'Ostatnio utworzone';
  };

  if (loading) {
    return <div className="text-gray-400 p-4 text-center">Ładowanie kodów z bazy...</div>;
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Szukaj kodów QR..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181b] border border-border rounded-lg py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsTagsDropdownOpen(!isTagsDropdownOpen); setIsFilterOpen(false); setOpenDropdownId(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors border ${activeTagFilters.length > 0 ? 'bg-black text-white border-blue-600' : 'bg-[#18181b] border-border text-gray-300 hover:bg-border'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            {activeTagFilters.length > 0 ? (activeTagFilters.length === 1 ? (allTags.find(t => t.id === activeTagFilters[0])?.name || 'Tagi') : `Tagi (${activeTagFilters.length})`) : 'Tagi'}
            {activeTagFilters.length > 0 ? (
              <X size={14} className="ml-1 cursor-pointer hover:text-red-500" onClick={(e) => { e.stopPropagation(); setActiveTagFilters([]); }} />
            ) : (
              <svg className={`w-4 h-4 transition-transform ${isTagsDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            )}
          </button>
          
          {isTagsDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-[#18181b] border border-border rounded-xl shadow-2xl z-50 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-2 border-b border-border">
                <input 
                  type="text" 
                  placeholder="Wyszukaj tag..." 
                  value={tagSearchQuery}
                  onChange={(e) => setTagSearchQuery(e.target.value)}
                  className="w-full bg-[#0a0a0b] border border-border rounded-md py-1.5 px-3 text-sm focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
              <div className="p-1 flex flex-col max-h-48 overflow-y-auto custom-scrollbar">
                <button onClick={() => { setActiveTagFilters([]); setIsTagsDropdownOpen(false); }} className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${activeTagFilters.length === 0 ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>
                  Wszystkie tagi
                </button>
                {allTags.filter(t => t.name.toLowerCase().includes(tagSearchQuery.toLowerCase())).map(tag => {
                  const style = getTagColorInfo(tag.color);
                  const bgClass = style.bg.replace('bg-', 'bg-').replace(']', ']/10');
                  const isSelected = activeTagFilters.includes(tag.id);
                  return (
                    <button key={tag.id} onClick={() => { 
                      setActiveTagFilters(prev => prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]); 
                    }} className={`flex items-center justify-between w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${bgClass} ${style.text} ${style.border}`}>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        <span className="text-xs font-medium">{tag.name}</span>
                      </div>
                      {isSelected && <Check size={14} className="text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); setIsTagsDropdownOpen(false); setOpenDropdownId(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors border ${sortFilter === 'archived' ? 'bg-black text-white border-blue-600' : 'bg-[#18181b] border-border text-gray-300 hover:bg-border'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
            {getFilterLabel()}
            <svg className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {isFilterOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-[#18181b] border border-border rounded-xl shadow-2xl z-50 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-1 flex flex-col">
                <button onClick={() => { setSortFilter('recent'); setIsFilterOpen(false); }} className={`flex items-center justify-between w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${sortFilter === 'recent' ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>
                  <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg> Ostatnio utworzone</span>
                  {sortFilter === 'recent' && <Check size={16} className="text-red-500" />}
                </button>
                <button onClick={() => { setSortFilter('scans'); setIsFilterOpen(false); }} className={`flex items-center justify-between w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${sortFilter === 'scans' ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>
                  <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> Najwięcej skanów</span>
                  {sortFilter === 'scans' && <Check size={16} className="text-red-500" />}
                </button>
                <button onClick={() => { setSortFilter('archived'); setIsFilterOpen(false); }} className={`flex items-center justify-between w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${sortFilter === 'archived' ? 'text-red-500 bg-red-500/10' : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'}`}>
                  <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> Zarchiwizowane</span>
                  {sortFilter === 'archived' && <Check size={16} className="text-red-500" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    {processedCodes.length === 0 ? (
      <div className="text-gray-400 p-8 text-center bg-card border border-border rounded-xl mt-4">
        {sortFilter === 'archived' ? 'Brak zarchiwizowanych kodów.' : 'Brak zapisanych kodów. Kliknij "Utwórz kod QR" aby zacząć.'}
      </div>
    ) : (
      <div className="space-y-4">
        {processedCodes.map(code => (
        <div key={code.id} className="bg-card border border-border rounded-xl p-4 flex items-stretch justify-between hover:border-gray-600 transition-colors">
          <div className="flex items-center gap-5 flex-1 min-w-0 pr-4">
            <div 
              className="w-24 h-24 rounded-lg flex items-center justify-center shrink-0 border border-border overflow-hidden" 
              style={{ backgroundColor: code.backgroundColor || '#ffffff' }}
            >
               <QrCode className="w-12 h-12" style={{ color: code.dotsColor || '#000000' }} />
            </div>
            
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg truncate">{code.title}</span>
                <button onClick={() => onEdit(code)} className="text-gray-500 hover:text-white transition-colors shrink-0" title="Edytuj tytuł">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(`https://${window.location.host}/U${code.id.slice(0, 5)}v4S`);
                  setCopiedLinkId(code.id);
                  setTimeout(() => setCopiedLinkId(null), 2000);
                }}
                className="text-sm text-gray-400 mt-1 hover:text-gray-300 transition-colors flex items-center gap-2 group w-max max-w-full text-left"
                title="Skopiuj krótki link"
              >
                <span className="truncate">{window.location.host}/U{code.id.slice(0, 5)}v4S</span>
                {copiedLinkId === code.id ? (
                  <span className="text-[#10b981] text-[10px] font-bold uppercase tracking-wider shrink-0 bg-[#10b981]/10 px-1.5 py-0.5 rounded">Skopiowano!</span>
                ) : (
                  <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                )}
              </button>
              <div className="flex items-center gap-2 text-sm text-white mt-1 min-w-0">
                <span className="text-gray-500 shrink-0">↳</span>
                <a href={code.contentType === 'email' ? `mailto:${code.emailData?.address || code.url}` : code.url} target="_blank" rel="noopener noreferrer" className="hover:underline transition-colors truncate">
                  {code.contentType === 'email' ? (code.emailData?.address || code.url.replace('mailto:', '').split('?')[0]) : code.url}
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {code.tags && code.tags.length > 0 ? (
                  <>
                    {code.tags.map(tagId => {
                      const tag = allTags.find(t => t.id === tagId);
                      if (!tag) return null;
                      const style = getTagColorInfo(tag.color);
                      const bgClass = style.bg.replace('bg-', 'bg-').replace(']', ']/10');
                      return (
                        <button 
                          key={tag.id} 
                          onClick={(e) => { e.stopPropagation(); setActiveTagFilters(prev => prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]); }}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${bgClass} ${style.text} ${style.border} hover:opacity-80 transition-opacity`}
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                          <span className="text-[10px] font-bold uppercase tracking-wider">{tag.name}</span>
                        </button>
                      );
                    })}
                    <button onClick={(e) => { e.stopPropagation(); setCodeForTagManager(code); }} className="text-gray-500 hover:text-white p-1 rounded-full transition-colors bg-[#18181b] border border-border">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); setCodeForTagManager(code); }} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors bg-[#18181b] border border-border px-3 py-1 rounded-lg">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    Wybierz tagi
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-stretch gap-6">
             <div className="flex flex-col items-end justify-between py-0.5">
               <div className="flex items-center gap-2 relative">
                 {sortFilter === 'archived' ? (
                   <button 
                     onClick={() => handleRestore(code)}
                     className="flex items-center gap-2 bg-white text-black px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                   >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                     Przywróć
                   </button>
                 ) : (
                   <>
                     <button 
                       onClick={() => handleDownload(code, 'png')}
                       className="flex items-center gap-1 bg-white text-black px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-200 transition-colors"
                     >
                       <Download size={14} /> PNG
                     </button>
                     <button 
                       onClick={() => handleDownload(code, 'svg')}
                       className="flex items-center gap-1 bg-transparent border border-white text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-white/10 transition-colors"
                     >
                       <Download size={14} /> SVG
                     </button>
                     <button 
                       onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === code.id ? null : code.id); setIsFilterOpen(false); }}
                       className="p-1.5 hover:bg-border rounded-md text-gray-400 transition-colors"
                     >
                       <MoreVertical size={16} />
                     </button>

                     {openDropdownId === code.id && (
                       <div 
                         onClick={e => e.stopPropagation()} 
                         className="absolute top-full right-0 mt-2 w-48 bg-[#18181b] border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
                       >
                         <div className="p-1 flex flex-col">
                           <button onClick={() => { onAnalytics && onAnalytics(code); setOpenDropdownId(null); }} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                             Analityka
                           </button>
                           <button onClick={() => { onEdit(code); setOpenDropdownId(null); }} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                             Edytuj
                           </button>
                           <button onClick={() => { onDuplicate(code); setOpenDropdownId(null); }} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors border-b border-border mb-1 pb-2">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                             Duplikuj
                           </button>
                           <button onClick={() => { setCodeToArchive(code); setOpenDropdownId(null); }} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                             Archiwizuj
                           </button>
                           <button onClick={() => { setCodeToReset(code); setOpenDropdownId(null); }} className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             Resetuj
                           </button>
                         </div>
                       </div>
                     )}
                   </>
                 )}
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-xs text-gray-500">{code.date}</span>
                 {activeWorkspace?.type === 'team' && code.createdBy && teamMembers[code.createdBy] && (
                   <div 
                     className="w-5 h-5 flex items-center justify-center font-bold text-white shadow-sm shrink-0 cursor-help"
                     style={{ background: teamMembers[code.createdBy].avatarStyle || 'linear-gradient(to top right, #FF4C00, #9333ea)', borderRadius: '30%', fontSize: '10px' }}
                     title={teamMembers[code.createdBy].name || teamMembers[code.createdBy].email || 'Użytkownik'}
                   >
                     {teamMembers[code.createdBy].name ? teamMembers[code.createdBy].name.charAt(0).toUpperCase() : (teamMembers[code.createdBy].email ? teamMembers[code.createdBy].email.charAt(0).toUpperCase() : 'U')}
                   </div>
                 )}
               </div>
             </div>
             
             <div className="w-32 h-full min-h-[64px] bg-black rounded-lg border border-border p-2 flex flex-col justify-between relative overflow-hidden">
               <div className="flex justify-between items-center z-10 relative">
                 <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                   <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                   Skan
                 </span>
                 <span className="text-lg font-bold text-white">{code.scans}</span>
               </div>
               <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-70">
                 <Line 
                   data={{
                     labels: ['1', '2', '3', '4', '5'],
                     datasets: [{
                       data: [0, 0, 0, 0, 0],
                       borderColor: '#3b82f6',
                       backgroundColor: 'rgba(59, 130, 246, 0.2)',
                       fill: true,
                     }]
                   }}
                   options={sparklineOptions} 
                 />
               </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    )}

      {codeToArchive && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0b] border border-border rounded-2xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
            <h3 className="text-red-500 font-bold mb-2 uppercase">Zarchiwizuj kod QR</h3>
            <p className="text-sm text-gray-300 mb-6">Czy na pewno chcesz zarchiwizować ten kod QR? Nie będzie można go skanować.</p>
            <button onClick={() => handleArchive(codeToArchive)} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg mb-2 transition-colors">ZARCHIWIZUJ</button>
            <button onClick={() => setCodeToArchive(null)} className="w-full bg-[#18181b] hover:bg-[#27272a] text-gray-300 font-bold py-3 rounded-lg transition-colors border border-border">ANULUJ</button>
          </div>
        </div>
      )}

      {codeToReset && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0b] border border-border rounded-2xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
            <h3 className="text-red-500 font-bold mb-2 uppercase">Resetuj analitykę</h3>
            <p className="text-sm text-gray-300 mb-6">Czy na pewno chcesz zresetować analitykę dla tego kodu QR? Tej operacji nie można cofnąć.</p>
            <button onClick={() => handleResetAnalytics(codeToReset)} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg mb-2 transition-colors">RESETUJ ANALITYKĘ</button>
            <button onClick={() => setCodeToReset(null)} className="w-full bg-[#18181b] hover:bg-[#27272a] text-gray-300 font-bold py-3 rounded-lg transition-colors border border-border">ANULUJ</button>
          </div>
        </div>
      )}

      {codeForTagManager && (
        <TagManagerModal 
          activeWorkspace={activeWorkspace}
          codeId={codeForTagManager.id}
          assignedTagIds={codeForTagManager.tags || []}
          allTags={allTags}
          onClose={() => setCodeForTagManager(null)}
        />
      )}
    </>
  );
}
