import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { doc, deleteDoc, getDocs, query, collection, where, writeBatch, limit } from 'firebase/firestore';
import { db } from '../firebase';

export default function AdminDeleteModal({ itemType, itemId, onClose }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [progress, setProgress] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'USUN') return;
    setIsDeleting(true);
    setProgress('Rozpoczynanie usuwania...');

    try {
      // 1. Delete all analytics associated with this itemId
      let deletedCount = 0;
      let hasMore = true;

      while (hasMore) {
        const q = query(
          collection(db, "analytics"), 
          where("codeId", "==", itemId),
          limit(500)
        );
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          hasMore = false;
          break;
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });

        await batch.commit();
        deletedCount += snapshot.size;
        setProgress(`Usunięto ${deletedCount} statystyk...`);
      }

      setProgress(`Usunięto ${deletedCount} rekordów. Usuwanie obiektu...`);
      
      // 2. Delete the main document
      const collectionName = itemType === 'qr' ? 'qrcodes' : 'smartlinks';
      await deleteDoc(doc(db, collectionName, itemId));

      setProgress('Ukończono pomyślnie!');
      setTimeout(() => {
        onClose(true); // true = usunięto
      }, 1500);
      
    } catch (err) {
      console.error("Error deleting item:", err);
      setProgress('Wystąpił błąd podczas usuwania.');
      setIsDeleting(false);
    }
  };

  const isButtonEnabled = confirmText === 'USUN' && !isDeleting;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[130] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4" onClick={() => !isDeleting && onClose(false)}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
        className="bg-[#0a0a0b] border border-red-500/30 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
        <div className="relative z-10 w-full">
          <h3 className="text-red-500 font-bold mb-2 uppercase text-sm tracking-wider">Permanentne Usunięcie</h3>
          <p className="text-xs text-gray-300 mb-4 px-2">
            Zostanie usunięty <strong>{itemType === 'qr' ? 'Kod QR' : 'Smart Link'}</strong> oraz wszystkie przypisane do niego statystyki. 
            Tej akcji nie można cofnąć!
          </p>

          <div className="mb-6 w-full">
            <label className="block text-xs text-gray-400 mb-2 font-medium">Aby potwierdzić, wpisz słowo <strong>USUN</strong></label>
            <input 
              type="text" 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="USUN"
              className="w-full bg-background border border-red-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors text-center uppercase tracking-widest font-bold"
              disabled={isDeleting}
            />
          </div>

          {progress && (
            <p className="text-xs text-red-400 mb-4 font-semibold">{progress}</p>
          )}

          <button 
            onClick={handleDelete} 
            disabled={!isButtonEnabled}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 text-sm rounded-lg mb-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'USUWANIE TRWA...' : 'TRWALE USUŃ'}
          </button>
          <button 
            onClick={() => onClose(false)} 
            disabled={isDeleting}
            className="w-full bg-[#18181b] hover:bg-[#27272a] text-gray-300 font-bold py-2.5 text-sm rounded-lg transition-colors border border-border disabled:opacity-50"
          >
            ANULUJ
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
