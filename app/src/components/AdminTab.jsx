import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem } from '../utils/animations';
import { Search, AlertTriangle, Link as LinkIcon, QrCode } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import AdminDeleteModal from './AdminDeleteModal';

export default function AdminTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null); // { type, data, id }
  const [searchError, setSearchError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);
    
    try {
      const id = searchQuery.trim();
      // First try qrcodes
      let docRef = doc(db, 'qrcodes', id);
      let docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSearchResult({ type: 'qr', data: docSnap.data(), id: docSnap.id });
      } else {
        // Try smartlinks
        docRef = doc(db, 'smartlinks', id);
        docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSearchResult({ type: 'smartlink', data: docSnap.data(), id: docSnap.id });
        } else {
          setSearchError('Nie znaleziono dokumentu o podanym ID w kodach QR ani Smart Linkach.');
        }
      }
    } catch (err) {
      console.error(err);
      setSearchError('Wystąpił błąd podczas wyszukiwania.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-8">
      <motion.div variants={staggerItem} className="bg-card border border-border rounded-xl p-8">
        <h2 className="text-xl font-semibold mb-2">Panel Administracyjny</h2>
        <p className="text-gray-400 text-sm mb-8">Wyszukaj Kod QR lub Smart Link po jego ID w bazie (Document ID), aby wykonać na nim zaawansowane operacje administracyjne.</p>

        <form onSubmit={handleSearch} className="flex gap-4 max-w-xl mb-8">
          <div className="relative flex-1">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Wprowadź ID dokumentu (np. vT8sB...)"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-[#f97316] transition-colors"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <button 
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="bg-[#f97316] hover:bg-[#ea580c] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {isSearching ? 'Szukanie...' : 'Szukaj'}
          </button>
        </form>

        {searchError && (
          <div className="text-red-400 text-sm mb-6 font-medium bg-red-400/10 p-4 rounded-xl border border-red-400/20">
            {searchError}
          </div>
        )}

        {searchResult && (
          <div className="border border-border rounded-xl p-6 bg-background relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              {searchResult.type === 'qr' ? <QrCode size={100} /> : <LinkIcon size={100} />}
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-gray-800 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                  {searchResult.type === 'qr' ? 'KOD QR' : 'SMART LINK'}
                </span>
                <span className="text-gray-400 text-sm font-mono">{searchResult.id}</span>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">{searchResult.data.title || 'Brak nazwy'}</h3>
              <p className="text-gray-300 text-sm mb-6 flex items-center gap-2">
                <span className="font-semibold text-gray-500">Krótki link:</span> 
                {searchResult.data.shortUrl ? (
                  <a href={searchResult.data.shortUrl} target="_blank" rel="noopener noreferrer" className="text-[#009de2] hover:underline">
                    {searchResult.data.shortUrl}
                  </a>
                ) : (
                  <span className="text-gray-500 italic">Brak (kod statyczny)</span>
                )}
              </p>

              <div className="border-t border-border pt-6 mt-2">
                <h4 className="text-red-500 font-bold mb-2 flex items-center gap-2"><AlertTriangle size={18} /> Strefa Niebezpieczna</h4>
                <p className="text-sm text-gray-400 mb-4 max-w-md">Permanentne usunięcie elementu skasuje bezpowrotnie sam obiekt oraz wyczyści całą powiązaną historię statystyk w tle.</p>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600/20 text-red-500 border border-red-500/50 hover:bg-red-600 hover:text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  Usuń permanentnie
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showDeleteModal && (
          <AdminDeleteModal 
            itemType={searchResult.type} 
            itemId={searchResult.id} 
            onClose={(deleted) => {
              setShowDeleteModal(false);
              if (deleted) {
                setSearchResult(null);
                setSearchQuery('');
              }
            }} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
