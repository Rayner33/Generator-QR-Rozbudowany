import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, MoreVertical, QrCode, Check, X, Wifi, Scan, ArrowRight, FolderOutput } from 'lucide-react';
import TagManagerModal from '../components/tags/TagManagerModal';
import MoveCodeModal from '../components/MoveCodeModal';
import { renderTagStyle } from '../utils/tagColors';
import { buildUrlWithUtm } from '../utils/analyticsHelpers';
import { Line } from 'react-chartjs-2';
import QRCodeStyling from 'qr-code-styling';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs, writeBatch } from 'firebase/firestore';
import QRModal from '../components/QRModal';
import { dropdownAnimation } from '../utils/animations';
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

export default function QRList({ activeWorkspace, workspaces, onEdit, onDuplicate, onAnalytics }) {
  const { currentUser } = useAuth();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  const [sortFilter, setSortFilter] = useState('recent');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState({});
  
  // Tagi
  const [allTags, setAllTags] = useState([]);
  const [activeTagFilters, setActiveTagFilters] = useState([]);
  const [hoveredTagId, setHoveredTagId] = useState(null);
  const [hoveredFilter, setHoveredFilter] = useState(null);
  const [hoveredAction, setHoveredAction] = useState(null);
  const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);
  const tagsTimeoutRef = useRef(null);
  const filterTimeoutRef = useRef(null);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [codeForTagManager, setCodeForTagManager] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLinkId, setCopiedLinkId] = useState(null);
  
  // Modale potwierdzające
  const [codeToArchive, setCodeToArchive] = useState(null);
  const [codeToReset, setCodeToReset] = useState(null);
  const [codeToMove, setCodeToMove] = useState(null);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    const q = query(collection(db, "qrcodes"), where("workspaceId", "==", activeWorkspace.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let codesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt ? new Date(doc.data().createdAt.toDate()).toLocaleDateString() : 'Brak daty'
      }));
      setCodes(codesData);
      setTimeout(() => setLoading(false), 300);
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
    return `${window.location.origin}/${code.id}`;
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
      margin: 66,
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

  const handleResetAnalytics = async (code) => {
    try {
      // 1. Zresetuj licznik główny
      await updateDoc(doc(db, "qrcodes", code.id), { scans: 0 });
      
      // 2. Usuń wszystkie fizyczne logi z kolekcji, aby wyczyścić wykresy
      const logsQuery = query(collection(db, "analytics"), where("codeId", "==", code.id));
      const logsSnapshot = await getDocs(logsQuery);
      
      if (!logsSnapshot.empty) {
        const batch = writeBatch(db);
        logsSnapshot.docs.forEach((logDoc) => {
          batch.delete(logDoc.ref);
        });
        await batch.commit();
      }
    } catch (error) {
      console.error("Błąd podczas czyszczenia bazy logów:", error);
    } finally {
      setCodeToReset(null);
    }
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
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Szukaj kodów QR..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181b] border border-border rounded-lg py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-[#1ea2e4] transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
        <div 
          className="relative flex-1 md:flex-none"
          onMouseEnter={() => clearTimeout(tagsTimeoutRef.current)}
          onMouseLeave={() => { tagsTimeoutRef.current = setTimeout(() => setIsTagsDropdownOpen(false), 250); }}
        >
          <button 
            onClick={(e) => { e.stopPropagation(); setIsTagsDropdownOpen(!isTagsDropdownOpen); setIsFilterOpen(false); setOpenDropdownId(null); }}
            className={`flex items-center justify-center md:justify-start w-full gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors border ${activeTagFilters.length > 0 ? 'bg-black text-white border-blue-600' : 'bg-[#18181b] border-border text-gray-300 hover:border-gray-500 hover:text-white'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            {activeTagFilters.length > 0 ? (activeTagFilters.length === 1 ? (allTags.find(t => t.id === activeTagFilters[0])?.name || 'Tagi') : `Tagi (${activeTagFilters.length})`) : 'Tagi'}
            {activeTagFilters.length > 0 ? (
              <X size={14} className="ml-1 cursor-pointer hover:text-red-500" onClick={(e) => { e.stopPropagation(); setActiveTagFilters([]); }} />
            ) : (
              <svg className={`w-4 h-4 transition-transform ${isTagsDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            )}
          </button>
          
          <AnimatePresence>
          {isTagsDropdownOpen && (
            <motion.div key="tags-dropdown" {...dropdownAnimation} className="absolute top-full right-0 pt-2 w-56 z-50 origin-top" onClick={e => e.stopPropagation()}>
              <div className="bg-[#0a0a0b] border border-border rounded-xl shadow-2xl overflow-hidden">
              <div className="p-2 border-b border-white/5">
                <input 
                  type="text" 
                  placeholder="Szukaj tagów..." 
                  value={tagSearchQuery}
                  onChange={(e) => setTagSearchQuery(e.target.value)}
                  className="w-full bg-[#18181b] border border-border rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:border-[#1ea2e4] text-white"
                />
              </div>
              <div 
                onMouseLeave={() => setHoveredTagId(null)}
                className="p-2 flex flex-col gap-0.5 max-h-56 overflow-y-auto custom-scrollbar"
              >
                {allTags.filter(t => t.name.toLowerCase().includes(tagSearchQuery.toLowerCase())).map(tag => {
                  const styleObj = renderTagStyle(tag.color);
                  const isSelected = activeTagFilters.includes(tag.id);
                  return (
                    <button 
                      key={tag.id} 
                      onMouseEnter={() => setHoveredTagId(tag.id)}
                      onClick={() => { 
                        setActiveTagFilters(prev => prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]); 
                      }} 
                      className={`relative flex items-center w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${styleObj.textClass} ${isSelected ? 'bg-white/10' : ''}`}
                      style={{ color: styleObj.textColor }}
                    >
                      {hoveredTagId === tag.id && !isSelected && (
                        <motion.div 
                          layoutId="qr-tags-hover"
                          className="absolute inset-0 bg-white/5 rounded-lg"
                          initial={false}
                          transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                        />
                      )}
                      <div className="flex items-center w-full relative z-10 pointer-events-none">
                        {isSelected ? (
                        <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center border-[2px] border-current shrink-0 mr-3">
                          <div className="w-2 h-2 rounded-full bg-current"></div>
                        </div>
                      ) : (
                        <div className="w-[18px] h-[18px] rounded-full border-[2px] border-current shrink-0 mr-3 opacity-80" />
                      )}
                      <span className="font-semibold">{tag.name}</span>
                      </div>
                    </button>
                  );
                })}
                {allTags.length > 0 && allTags.filter(t => t.name.toLowerCase().includes(tagSearchQuery.toLowerCase())).length === 0 && (
                  <div className="text-center text-xs text-gray-500 py-3">Brak wyników</div>
                )}
              </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
        
        <div 
          className="relative flex-1 md:flex-none"
          onMouseEnter={() => clearTimeout(filterTimeoutRef.current)}
          onMouseLeave={() => { filterTimeoutRef.current = setTimeout(() => setIsFilterOpen(false), 250); }}
        >
          <button 
            onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); setIsTagsDropdownOpen(false); setOpenDropdownId(null); }}
            className={`flex items-center justify-center md:justify-start w-full gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors border ${sortFilter === 'archived' ? 'bg-black text-white border-blue-600' : 'bg-[#18181b] border-border text-gray-300 hover:border-gray-500 hover:text-white'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
            {getFilterLabel()}
            <svg className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div 
                key="filter-dropdown"
                {...dropdownAnimation}
                className="absolute top-full right-0 pt-2 w-56 z-50 origin-top" 
                onClick={e => e.stopPropagation()}
              >
              <div onMouseLeave={() => setHoveredFilter(null)} className="bg-[#0a0a0b] border border-border rounded-xl shadow-2xl overflow-hidden p-1 flex flex-col gap-0.5">
                <button 
                  onClick={() => { setSortFilter('recent'); setIsFilterOpen(false); }} 
                  onMouseEnter={() => setHoveredFilter('recent')}
                  className={`relative flex items-center justify-between w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${sortFilter === 'recent' ? 'text-white bg-white/10' : 'text-gray-300'}`}
                >
                  {hoveredFilter === 'recent' && sortFilter !== 'recent' && (
                    <motion.div layoutId="qr-filter-hover" className="absolute inset-0 bg-white/5 rounded-lg" initial={false} transition={{ type: "spring", bounce: 0, duration: 0.2 }} />
                  )}
                  <span className="flex items-center gap-2 relative z-10 pointer-events-none"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg> Ostatnio utworzone</span>
                  {sortFilter === 'recent' && <Check size={16} className="text-red-500 relative z-10 pointer-events-none" />}
                </button>
                <button 
                  onClick={() => { setSortFilter('scans'); setIsFilterOpen(false); }} 
                  onMouseEnter={() => setHoveredFilter('scans')}
                  className={`relative flex items-center justify-between w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${sortFilter === 'scans' ? 'text-white bg-white/10' : 'text-gray-300'}`}
                >
                  {hoveredFilter === 'scans' && sortFilter !== 'scans' && (
                    <motion.div layoutId="qr-filter-hover" className="absolute inset-0 bg-white/5 rounded-lg" initial={false} transition={{ type: "spring", bounce: 0, duration: 0.2 }} />
                  )}
                  <span className="flex items-center gap-2 relative z-10 pointer-events-none"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> Najwięcej skanów</span>
                  {sortFilter === 'scans' && <Check size={16} className="text-red-500 relative z-10 pointer-events-none" />}
                </button>
                <button 
                  onClick={() => { setSortFilter('archived'); setIsFilterOpen(false); }} 
                  onMouseEnter={() => setHoveredFilter('archived')}
                  className={`relative flex items-center justify-between w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${sortFilter === 'archived' ? 'text-red-500 bg-red-500/10' : 'text-red-400'}`}
                >
                  {hoveredFilter === 'archived' && sortFilter !== 'archived' && (
                    <motion.div layoutId="qr-filter-hover" className="absolute inset-0 bg-red-500/10 rounded-lg" initial={false} transition={{ type: "spring", bounce: 0, duration: 0.2 }} />
                  )}
                  <span className="flex items-center gap-2 relative z-10 pointer-events-none"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> Zarchiwizowane</span>
                  {sortFilter === 'archived' && <Check size={16} className="text-red-500 relative z-10 pointer-events-none" />}
                </button>
              </div>
            </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
      </div>

    {processedCodes.length === 0 ? (
      <div className="text-gray-400 p-8 text-center bg-card border border-border rounded-xl mt-4">
        {sortFilter === 'archived' ? 'Brak zarchiwizowanych kodów.' : 'Brak zapisanych kodów. Kliknij "Utwórz kod QR" aby zacząć.'}
      </div>
    ) : (
      <div className="space-y-4">
        {processedCodes.map(code => {
          const isOwner = activeWorkspace?.ownerId === currentUser.uid;
          const isAdmin = activeWorkspace?.memberRoles?.[currentUser.uid] === 'admin';
          const isCreator = code.createdBy === currentUser.uid;
          const canEdit = isOwner || isAdmin || isCreator || activeWorkspace?.allowMembersEdit;
          const canArchive = isOwner || isAdmin || isCreator || activeWorkspace?.allowMembersArchive;
          const canReset = isOwner || isAdmin || isCreator || activeWorkspace?.allowMembersReset;
          
          return (
        <div key={code.id} className="bg-card border border-border rounded-xl p-0 md:p-3 flex flex-col md:flex-row md:items-stretch justify-between hover:border-gray-600 transition-colors relative">
            
            {/* QR Image */}
            <div className="order-1 md:order-1 flex justify-center p-6 md:p-0 border-b border-border md:border-none md:mr-5">
              <div className="w-[160px] h-[160px] md:w-28 md:h-28 rounded-xl shrink-0 border border-border overflow-hidden bg-white/5 md:bg-transparent">
                <QRPreviewItem code={code} />
              </div>
            </div>
            
            {/* Info Box */}
            <div className="order-3 md:order-2 flex flex-col flex-1 min-w-0 p-4 md:p-0 md:pr-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg truncate">{code.title || 'Brak tytułu'}</span>
                {canEdit && (
                  <button onClick={() => onEdit(code)} className="text-gray-500 hover:text-white transition-colors shrink-0" title="Edytuj tytuł">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                )}
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(`${window.location.origin}/${code.id}`);
                  setCopiedLinkId(code.id);
                  setTimeout(() => setCopiedLinkId(null), 2000);
                }}
                className="text-sm text-gray-400 mt-1 hover:text-gray-300 transition-colors flex items-center gap-2 group w-max max-w-full text-left"
                title="Skopiuj krótki link"
              >
                <span className="truncate">{window.location.host}/{code.id}</span>
                {copiedLinkId === code.id ? (
                  <span className="text-[#10b981] text-[10px] font-bold uppercase tracking-wider shrink-0 bg-[#10b981]/10 px-1.5 py-0.5 rounded">Skopiowano!</span>
                ) : (
                  <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                )}
              </button>
              <div className="flex items-center gap-2 text-sm text-white mt-1 min-w-0">
                <span className="text-gray-500 shrink-0">↳</span>
                {['vcard', 'wifi', 'phone'].includes(code.contentType) ? (
                  <button onClick={(e) => { e.stopPropagation(); onEdit(code); }} className="hover:underline transition-colors truncate text-left cursor-pointer">
                    {code.contentType === 'vcard' ? `vCard (${[code.vcardData?.firstName, code.vcardData?.lastName].filter(Boolean).join(' ')})` : code.contentType === 'wifi' ? `Sieć WiFi (${code.wifiData?.ssid || ''})` : code.contentType === 'phone' ? (code.phoneData || buildUrlWithUtm(code.url, code.utm)?.replace('tel:', '')) : buildUrlWithUtm(code.url, code.utm)}
                  </button>
                ) : (
                  <a href={code.contentType === 'email' ? `mailto:${code.emailData?.address || buildUrlWithUtm(code.url, code.utm)}` : (buildUrlWithUtm(code.url, code.utm)?.startsWith('http://') || buildUrlWithUtm(code.url, code.utm)?.startsWith('https://') ? buildUrlWithUtm(code.url, code.utm) : `https://${buildUrlWithUtm(code.url, code.utm)}`)} target="_blank" rel="noopener noreferrer" className="hover:underline transition-colors truncate cursor-pointer">
                    {code.contentType === 'email' ? (code.emailData?.address || buildUrlWithUtm(code.url, code.utm)?.replace('mailto:', '').split('?')[0]) : buildUrlWithUtm(code.url, code.utm)}
                  </a>
                )}
              </div>
              
              {/* Desktop Tags */}
              <div className="hidden md:flex flex-wrap items-center gap-2 mt-3">
                {code.tags && code.tags.some(tagId => allTags.some(t => t.id === tagId)) ? (
                  <>
                    {code.tags.map(tagId => {
                      const tag = allTags.find(t => t.id === tagId);
                      if (!tag) return null;
                      const styleObj = renderTagStyle(tag.color);
                      return (
                        <button 
                          key={tag.id} 
                          onClick={(e) => { e.stopPropagation(); setActiveTagFilters(prev => prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]); }}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${styleObj.className} hover:opacity-80 transition-opacity`}
                          style={styleObj.style}
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                          <span className="text-[10px] font-bold uppercase tracking-wider">{tag.name}</span>
                        </button>
                      );
                    })}
                    {canEdit && (
                      <button onClick={(e) => { e.stopPropagation(); setCodeForTagManager(code); }} className="text-gray-500 hover:text-white p-1 rounded-full transition-colors bg-[#18181b] border border-border">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </button>
                    )}
                  </>
                ) : canEdit && (
                  <button onClick={(e) => { e.stopPropagation(); setCodeForTagManager(code); }} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors bg-[#18181b] border border-border px-3 py-1 rounded-lg">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    Wybierz tagi
                  </button>
                )}
              </div>
            </div>
          
          {/* Actions & Chart Container */}
          <div className="order-2 md:order-3 flex flex-row md:flex-row items-center md:items-stretch justify-between md:justify-start p-3 md:p-0 md:py-0.5 border-b border-border md:border-none gap-2 md:gap-6 w-full md:w-auto shrink-0 relative bg-transparent">
             <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-between py-0 md:py-0.5 w-full md:w-auto">
               <div className="flex items-center justify-between md:justify-end gap-2 relative w-full md:w-auto">
                 
                 {/* Mobile simplified Chart Button */}
                 <button 
                   onClick={(e) => { e.stopPropagation(); onAnalytics && onAnalytics(code); }}
                   className="md:hidden flex items-center gap-1.5 bg-transparent border border-[#1ea2e4] text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-[#1ea2e4]/10 transition-colors shrink-0"
                 >
                   <Scan size={14} className="text-white" /> <span className="whitespace-nowrap">{code.scans || 0} Skany</span>
                 </button>
                 
                 <div className="flex items-center gap-2">
                 {sortFilter === 'archived' ? (
                   canArchive && (
                     <button 
                       onClick={() => handleRestore(code)}
                       className="flex items-center gap-2 bg-white text-black px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                     >
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                       Przywróć
                     </button>
                   )
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

                     <AnimatePresence>
                     {openDropdownId === code.id && (
                        <motion.div 
                            key={`dropdown-${code.id}`}
                            {...dropdownAnimation}
                            onClick={e => e.stopPropagation()} 
                            className="absolute top-full right-0 mt-2 w-48 bg-[#0a0a0b] border border-border rounded-xl shadow-2xl z-50 overflow-hidden origin-top"
                          >
                            <div className="p-1 flex flex-col" onMouseLeave={() => setHoveredAction(null)}>
                              {canEdit && (
                                <button onMouseEnter={() => setHoveredAction('edit')} onClick={() => { onEdit(code); setOpenDropdownId(null); }} className="relative flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-300 transition-colors">
                                  {hoveredAction === 'edit' && <motion.div layoutId="qr-action-hover" className="absolute inset-0 bg-white/5 rounded-lg -z-10" initial={false} transition={{ type: "spring", bounce: 0, duration: 0.2 }} />}
                                  <svg className="w-4 h-4 relative z-10 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                  <span className="relative z-10 pointer-events-none">Edytuj</span>
                                </button>
                              )}
                              <button onMouseEnter={() => setHoveredAction('duplicate')} onClick={() => { onDuplicate(code); setOpenDropdownId(null); }} className={`relative flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-300 transition-colors ${!canEdit && (canArchive || canReset) ? 'border-b border-border mb-1 pb-2' : ''}`}>
                                {hoveredAction === 'duplicate' && <motion.div layoutId="qr-action-hover" className="absolute inset-0 bg-white/5 rounded-lg -z-10" initial={false} transition={{ type: "spring", bounce: 0, duration: 0.2 }} />}
                                <svg className="w-4 h-4 relative z-10 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                <span className="relative z-10 pointer-events-none">Duplikuj</span>
                              </button>
                              {canEdit && (
                                <button onMouseEnter={() => setHoveredAction('move')} onClick={() => { setCodeToMove(code); setOpenDropdownId(null); }} className={`relative flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-gray-300 transition-colors ${(canArchive || canReset) ? 'border-b border-border mb-1 pb-2' : ''}`}>
                                  {hoveredAction === 'move' && <motion.div layoutId="qr-action-hover" className="absolute inset-0 bg-white/5 rounded-lg -z-10" initial={false} transition={{ type: "spring", bounce: 0, duration: 0.2 }} />}
                                  <FolderOutput className="w-4 h-4 relative z-10 pointer-events-none" />
                                  <span className="relative z-10 pointer-events-none">Przenieś</span>
                                </button>
                              )}
                              {canArchive && (
                                <button onMouseEnter={() => setHoveredAction('archive')} onClick={() => { setCodeToArchive(code); setOpenDropdownId(null); }} className="relative flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-red-400 transition-colors">
                                  {hoveredAction === 'archive' && <motion.div layoutId="qr-action-hover" className="absolute inset-0 bg-red-500/10 rounded-lg -z-10" initial={false} transition={{ type: "spring", bounce: 0, duration: 0.2 }} />}
                                  <svg className="w-4 h-4 relative z-10 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                  <span className="relative z-10 pointer-events-none">Archiwizuj</span>
                                </button>
                              )}
                              {canReset && (
                                <button onMouseEnter={() => setHoveredAction('reset')} onClick={() => { setCodeToReset(code); setOpenDropdownId(null); }} className="relative flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-red-400 transition-colors">
                                  {hoveredAction === 'reset' && <motion.div layoutId="qr-action-hover" className="absolute inset-0 bg-red-500/10 rounded-lg -z-10" initial={false} transition={{ type: "spring", bounce: 0, duration: 0.2 }} />}
                                  <svg className="w-4 h-4 relative z-10 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  <span className="relative z-10 pointer-events-none">Resetuj</span>
                                </button>
                              )}
                            </div>
                          </motion.div>
                     )}
                     </AnimatePresence>
                   </>
                 )}
               </div>
               </div>
               <div className="hidden md:flex items-center gap-2 mt-2">
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
             
             {/* Desktop Chart Button */}
             <button 
               onClick={(e) => { e.stopPropagation(); onAnalytics && onAnalytics(code); }}
               className="hidden md:flex w-44 h-full min-h-[72px] bg-[#0a0a0b] hover:bg-[#18181b] rounded-xl border border-border p-3 flex-col justify-between relative overflow-hidden group transition-all text-left cursor-pointer shrink-0"
             >
               {/* Default View */}
               <div className="flex flex-col justify-between h-full z-10 relative transition-opacity duration-300 group-hover:opacity-0">
                 <span className="text-[13px] font-semibold text-white flex items-center gap-1.5">
                   <Scan size={14} className="text-gray-300" />
                   Skan
                 </span>
                 <span className="text-xl font-bold text-white mt-2 leading-none">{code.scans || 0}</span>
               </div>

               {/* Hover View */}
               <div className="absolute inset-3 z-10 flex flex-col justify-between transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                 <span className="text-[13px] font-semibold text-white">
                   Pokaż więcej
                 </span>
                 <span className="text-white mt-2 leading-none">
                   <ArrowRight size={18} />
                 </span>
               </div>
               
               {/* Chart */}
               <div className="absolute -bottom-1 -right-1 w-[80%] h-[60%] opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:grayscale group-hover:brightness-[3] group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] pointer-events-none">
                 <Line 
                   data={{
                     labels: ['1', '2', '3', '4', '5', '6'],
                     datasets: [{
                       data: [1, 3, 2, 5, 3, 8],
                       borderColor: '#1ea2e4',
                       backgroundColor: 'rgba(30, 162, 228, 0.2)',
                       fill: true,
                     }]
                   }}
                   options={sparklineOptions} 
                 />
               </div>
            </button>
          </div>
          
          {/* Mobile Tags */}
          <div className="order-4 md:hidden p-3 bg-[#0a0a0b] rounded-b-xl border-t border-border">
            <div className="flex flex-wrap items-center gap-2">
              {code.tags && code.tags.some(tagId => allTags.some(t => t.id === tagId)) ? (
                <>
                  {code.tags.map(tagId => {
                    const tag = allTags.find(t => t.id === tagId);
                    if (!tag) return null;
                    const styleObj = renderTagStyle(tag.color);
                    return (
                      <button 
                        key={tag.id} 
                        onClick={(e) => { e.stopPropagation(); setActiveTagFilters(prev => prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]); }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${styleObj.className} hover:opacity-80 transition-opacity`}
                        style={styleObj.style}
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{tag.name}</span>
                      </button>
                    );
                  })}
                  {canEdit && (
                    <button onClick={(e) => { e.stopPropagation(); setCodeForTagManager(code); }} className="text-gray-500 hover:text-white p-1 rounded-full transition-colors bg-[#18181b] border border-border">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  )}
                </>
              ) : canEdit && (
                <button onClick={(e) => { e.stopPropagation(); setCodeForTagManager(code); }} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors bg-[#18181b] border border-border px-3 py-1 rounded-lg">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  Wybierz tagi
                </button>
              )}
            </div>
          </div>
          
        </div>
        );
        })}
      <MoveCodeModal
        isOpen={!!codeToMove}
        onClose={() => setCodeToMove(null)}
        code={codeToMove}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        collectionName="qrcodes"
      />
    </div>
    )}


      <AnimatePresence>
      {codeToArchive && (
        <motion.div onClick={() => setCodeToArchive(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4">
          <motion.div onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", duration: 0.4, bounce: 0.1 }} className="bg-[#0a0a0b] border border-border rounded-2xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
            <h3 className="text-yellow-500 font-bold mb-2 uppercase">Archiwizuj kod QR</h3>
            <p className="text-sm text-gray-300 mb-6">Kod zniknie z głównej listy, a po jego zeskanowaniu wyświetli się informacja o dezaktywacji. Zawsze możesz go przywrócić.</p>
            <button onClick={() => handleArchive(codeToArchive)} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg mb-2 transition-colors">ARCHIWIZUJ</button>
            <button onClick={() => setCodeToArchive(null)} className="w-full bg-[#18181b] hover:bg-[#27272a] text-gray-300 font-bold py-3 rounded-lg transition-colors border border-border">ANULUJ</button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {codeToReset && (
        <motion.div onClick={() => setCodeToReset(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4">
          <motion.div onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", duration: 0.4, bounce: 0.1 }} className="bg-[#0a0a0b] border border-border rounded-2xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
            <h3 className="text-red-500 font-bold mb-2 uppercase">Resetuj analitykę</h3>
            <p className="text-sm text-gray-300 mb-6">Czy na pewno chcesz zresetować analitykę dla tego kodu QR? Tej operacji nie można cofnąć.</p>
            <button onClick={() => handleResetAnalytics(codeToReset)} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg mb-2 transition-colors">RESETUJ ANALITYKĘ</button>
            <button onClick={() => setCodeToReset(null)} className="w-full bg-[#18181b] hover:bg-[#27272a] text-gray-300 font-bold py-3 rounded-lg transition-colors border border-border">ANULUJ</button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {codeForTagManager && (
        <TagManagerModal 
          activeWorkspace={activeWorkspace}
          codeId={codeForTagManager.id}
          assignedTagIds={codes.find(c => c.id === codeForTagManager.id)?.tags || []}
          allTags={allTags}
          onClose={() => setCodeForTagManager(null)}
        />
      )}
      </AnimatePresence>
    </>
  );
}

function QRPreviewItem({ code }) {
  const qrRef = React.useRef(null);

  React.useEffect(() => {
    if (!qrRef.current) return;
    
    const getQrDataToEncode = (code) => {
      if (code.contentType === 'wifi') {
        const { ssid, password, type } = code.wifiData || {};
        const auth = type === 'nopass' ? '' : `T:${type};`;
        return `WIFI:S:${ssid};${auth}P:${password};;`;
      }
      return `${window.location.origin}/${code.id || 'xxxxx'}`;
    };

    const dotsColor = code.dotsColor || "#000000";
    const eyeColor = code.eyeColor || dotsColor;
    const backgroundColor = code.backgroundColor || "#ffffff";

    const qrCode = new QRCodeStyling({
      width: 1000,
      height: 1000,
      type: "svg",
      data: getQrDataToEncode(code),
      image: code.logoBase64 || undefined,
      margin: 0,
      qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: "Q" },
      imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 5, crossOrigin: "anonymous" },
      dotsOptions: { color: dotsColor, type: code.styleType || "rounded" },
      backgroundOptions: { color: backgroundColor },
      cornersSquareOptions: { color: eyeColor, type: code.styleType === 'dots' ? 'dot' : (code.styleType === 'square' ? 'square' : 'extra-rounded') },
      cornersDotOptions: { color: eyeColor, type: code.styleType === 'square' ? 'square' : 'dot' }
    });

    qrRef.current.innerHTML = '';
    qrCode.append(qrRef.current);
  }, [code]);

  return <div ref={qrRef} className="w-full h-full flex items-center justify-center p-[6.5%] [&>*]:w-full [&>*]:h-full" style={{ backgroundColor: code.backgroundColor || '#ffffff' }} />;
}
