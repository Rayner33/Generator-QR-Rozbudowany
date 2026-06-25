import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderOutput, AlertTriangle, Check } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function MoveCodeModal({ isOpen, onClose, code, workspaces, activeWorkspace, collectionName = 'qrcodes' }) {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const availableWorkspaces = workspaces.filter(w => w.id !== activeWorkspace.id && !w.archived);

  const handleSave = async () => {
    if (!selectedWorkspaceId) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, collectionName, code.id), {
        workspaceId: selectedWorkspaceId,
        tags: [] // Clear tags as they belong to the old workspace
      });
      onClose();
    } catch (error) {
      console.error("Error moving code:", error);
      alert("Wystąpił błąd podczas przenoszenia. Spróbuj ponownie.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && code && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#0a0a0b] border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <FolderOutput className="text-blue-500" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Przenieś do innej przestrzeni</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Wybierz docelowy obszar roboczy</p>
                </div>
              </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Przestrzeń docelowa
              </label>
              {availableWorkspaces.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-gray-700 bg-gray-900/50 text-center text-sm text-gray-400">
                  Nie należysz do żadnych innych przestrzeni roboczych.
                </div>
              ) : (
                <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-2">
                  {availableWorkspaces.map(w => (
                    <button
                      key={w.id}
                      onClick={() => setSelectedWorkspaceId(w.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        selectedWorkspaceId === w.id 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : 'border-border bg-[#18181b] hover:border-gray-600'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/10" style={w.type === 'personal' ? { background: w.avatarStyle } : { backgroundColor: w.avatarColor }}>
                        <span className="text-white font-bold text-xs">
                          {w.name ? w.name.substring(0, 2).toUpperCase() : 'W'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{w.name}</div>
                        <div className="text-xs text-gray-400">{w.type === 'personal' ? 'Osobista' : 'Zespół'}</div>
                      </div>
                      {selectedWorkspaceId === w.id && (
                        <Check size={18} className="text-blue-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex gap-3 mb-6">
              <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-orange-200">
                <span className="font-semibold block mb-1">Uwaga na tagi!</span>
                Tagi przypisane do tego kodu zostaną wyczyszczone, ponieważ nowa przestrzeń robocza posiada własny system etykiet. Nowe tagi będziesz mógł przypisać już na nowym obszarze. Historia analityki zostanie zachowana w całości.
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-white/5 transition-colors"
              >
                Anuluj
              </button>
              <button 
                onClick={handleSave}
                disabled={!selectedWorkspaceId || isSaving || availableWorkspaces.length === 0}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? 'Przenoszenie...' : 'Potwierdź przeniesienie'}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.button 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.1 }}
          onClick={onClose} 
          className="mt-6 w-12 h-12 shrink-0 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-colors shadow-lg"
        >
          <X size={24} />
        </motion.button>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
