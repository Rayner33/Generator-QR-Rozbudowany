import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Edit2, Trash2, Check } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase';
import { renderTagStyle } from '../../utils/tagColors';
import TagEditModal from './TagEditModal';
import TagDeleteModal from './TagDeleteModal';

export default function TagManagerModal({ activeWorkspace, codeId, assignedTagIds = [], allTags = [], onClose, collectionName = 'qrcodes' }) {
  const [search, setSearch] = useState('');
  
  // Stany dla zagnieżdżonych modali
  const [editingTag, setEditingTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Top assigned tags
  const assignedTags = useMemo(() => {
    return allTags.filter(t => assignedTagIds.includes(t.id));
  }, [allTags, assignedTagIds]);

  // Bottom list
  const filteredTags = useMemo(() => {
    if (!search.trim()) return allTags;
    return allTags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  }, [allTags, search]);

  const exactMatchExists = useMemo(() => {
    if (!search.trim()) return true;
    return allTags.some(t => t.name.toLowerCase() === search.trim().toLowerCase());
  }, [allTags, search]);

  const handleCreateAndAssign = async () => {
    if (!search.trim() || exactMatchExists || isCreating) return;
    setIsCreating(true);
    try {
      // 1. Utwórz nowy tag w kolekcji
      const docRef = await addDoc(collection(db, 'tags'), {
        workspaceId: activeWorkspace.id,
        name: search.trim(),
        color: 'purple',
        createdAt: new Date()
      });

      // 2. Przypisz do tego dokumentu
      if (codeId) {
        await updateDoc(doc(db, collectionName, codeId), {
          tags: arrayUnion(docRef.id)
        });
      }
      setSearch('');
    } catch (err) {
      console.error("Error creating tag:", err);
    }
    setIsCreating(false);
  };

  const handleToggleTag = async (tagId, isAssigned) => {
    if (!codeId) return;
    try {
      if (isAssigned) {
        await updateDoc(doc(db, collectionName, codeId), {
          tags: arrayRemove(tagId)
        });
      } else {
        await updateDoc(doc(db, collectionName, codeId), {
          tags: arrayUnion(tagId)
        });
      }
    } catch (err) {
      console.error("Error toggling tag:", err);
    }
  };

  const renderAssignedTag = (tag) => {
    const styleObj = renderTagStyle(tag.color);
    
    return (
      <div 
        key={tag.id} 
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${styleObj.className}`}
        style={styleObj.style}
        onClick={() => handleToggleTag(tag.id, true)}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
        <span className="text-xs font-semibold">{tag.name}</span>
        <X size={14} className="ml-0.5 opacity-60 hover:opacity-100" />
      </div>
    );
  };

  const renderAvailableTag = (tag) => {
    const isAssigned = assignedTagIds.includes(tag.id);
    const styleObj = renderTagStyle(tag.color);
    
    return (
      <div 
        key={tag.id} 
        className={`group flex items-center justify-between hover:bg-white/5 rounded-xl px-2 py-1.5 transition-colors ${!isAssigned ? 'cursor-pointer' : ''}`} 
        onClick={() => !isAssigned && handleToggleTag(tag.id, false)}
      >
        <div 
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${styleObj.className} ${isAssigned ? 'opacity-40 cursor-default' : ''}`}
          style={styleObj.style}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
          <span className="text-xs font-semibold">{tag.name}</span>
        </div>

        <div className={`flex items-center gap-1 transition-opacity opacity-0 group-hover:opacity-100`} onClick={e => e.stopPropagation()}>
          <button onClick={() => setEditingTag(tag)} className="p-1.5 text-gray-400 hover:text-white bg-black/50 rounded-md transition-colors"><Edit2 size={12} /></button>
          <button onClick={() => setDeletingTag(tag)} className="p-1.5 text-gray-400 hover:text-red-500 bg-black/50 rounded-md transition-colors"><Trash2 size={12} /></button>
        </div>
      </div>
    );
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[110] bg-black/60 flex flex-col gap-6 items-center justify-center backdrop-blur-sm p-4" onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
          className="bg-[#0a0a0b]/95 border border-white/10 rounded-2xl w-full max-w-[480px] shadow-2xl relative flex flex-col backdrop-blur-2xl" onClick={e => e.stopPropagation()}
        >
          
          <div className="p-4 flex flex-col gap-4">
            {assignedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {assignedTags.map(tag => renderAssignedTag(tag))}
              </div>
            )}
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                autoFocus
                type="text"
                placeholder="Wyszukaj lub utwórz tag..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#18181b]/50 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all text-white"
              />
            </div>
          </div>

          <div className="border-t border-white/5" />

          <div className="relative flex-1">
            <div className="overflow-y-auto max-h-[220px] p-2 pb-6 custom-scrollbar">
              {search.trim() && !exactMatchExists && (
                <button 
                  onClick={handleCreateAndAssign}
                  disabled={isCreating}
                  className="w-full flex items-center justify-between hover:bg-white/5 rounded-xl px-2 py-1.5 transition-colors mb-1"
                >
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-600/50 text-gray-300">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    <span className="text-xs font-semibold">{search}</span>
                  </div>
                  <span className="text-xs text-blue-400 font-semibold px-2">Utwórz</span>
                </button>
              )}

              <div className="flex flex-col gap-0.5">
                {filteredTags.map(tag => renderAvailableTag(tag))}
              </div>
              
              {filteredTags.length === 0 && search.trim() && exactMatchExists && (
                <div className="p-4 text-center text-xs text-gray-500">Brak pasujących tagów</div>
              )}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0a0a0b]/95 to-transparent pointer-events-none rounded-b-2xl" />
          </div>
        </motion.div>
        
        <button onClick={onClose} className="w-12 h-12 shrink-0 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-colors shadow-lg">
          <X size={24} />
        </button>
      </motion.div>

      <AnimatePresence>
        {editingTag && <TagEditModal tag={editingTag} onClose={() => setEditingTag(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {deletingTag && <TagDeleteModal tag={deletingTag} workspaceId={activeWorkspace.id} onClose={() => setDeletingTag(null)} />}
      </AnimatePresence>
    </>
  );
}
