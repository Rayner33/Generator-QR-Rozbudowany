import React, { useState, useMemo } from 'react';
import { X, Search, Edit2, Trash2 } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase';
import { getTagColorInfo } from '../../utils/tagColors';
import TagEditModal from './TagEditModal';
import TagDeleteModal from './TagDeleteModal';

export default function TagManagerModal({ activeWorkspace, codeId, assignedTagIds = [], allTags = [], onClose }) {
  const [search, setSearch] = useState('');
  
  // Stany dla zagnieżdżonych modali
  const [editingTag, setEditingTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Zoptymalizowane listy
  const assignedTags = useMemo(() => {
    return allTags.filter(t => assignedTagIds.includes(t.id));
  }, [allTags, assignedTagIds]);

  const availableTags = useMemo(() => {
    const filtered = allTags.filter(t => !assignedTagIds.includes(t.id));
    if (!search.trim()) return filtered;
    return filtered.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  }, [allTags, assignedTagIds, search]);

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

      // 2. Przypisz do tego kodu QR
      if (codeId) {
        await updateDoc(doc(db, 'qrcodes', codeId), {
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
        await updateDoc(doc(db, 'qrcodes', codeId), {
          tags: arrayRemove(tagId)
        });
      } else {
        await updateDoc(doc(db, 'qrcodes', codeId), {
          tags: arrayUnion(tagId)
        });
      }
    } catch (err) {
      console.error("Error toggling tag:", err);
    }
  };

  const renderTagChip = (tag, isAssigned) => {
    const style = getTagColorInfo(tag.color);
    const bgClass = style.bg.replace('bg-', 'bg-').replace(']', ']/10');
    
    return (
      <div key={tag.id} className="group flex items-center justify-between hover:bg-white/5 rounded-lg px-2 py-1.5 transition-colors cursor-pointer" onClick={() => handleToggleTag(tag.id, isAssigned)}>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border bg-opacity-10 ${bgClass} ${style.text} ${style.border}`}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
          <span className="text-xs font-medium">{tag.name}</span>
          {isAssigned && <X size={12} className="ml-1 opacity-60 hover:opacity-100" />}
        </div>

        {!isAssigned && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <button onClick={() => setEditingTag(tag)} className="p-1.5 text-gray-400 hover:text-white bg-black/50 rounded-md"><Edit2 size={12} /></button>
            <button onClick={() => setDeletingTag(tag)} className="p-1.5 text-gray-400 hover:text-red-500 bg-black/50 rounded-md"><Trash2 size={12} /></button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4">
        <div className="bg-[#0a0a0b] border border-border rounded-2xl w-full max-w-[320px] shadow-2xl relative flex flex-col">
          
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                autoFocus
                type="text"
                placeholder="Wyszukaj lub utwórz tag..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#18181b] border border-border rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[300px] p-2 custom-scrollbar">
            {assignedTags.length > 0 && (
              <div className="mb-2">
                {assignedTags.map(tag => renderTagChip(tag, true))}
              </div>
            )}
            
            {search.trim() && !exactMatchExists && (
              <button 
                onClick={handleCreateAndAssign}
                disabled={isCreating}
                className="w-full flex items-center gap-2 hover:bg-white/5 rounded-lg px-2 py-2 transition-colors text-left"
              >
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-600 text-gray-300">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  <span className="text-xs font-medium">{search}</span>
                </div>
                <span className="text-xs text-gray-400">Utwórz</span>
              </button>
            )}

            {availableTags.length > 0 ? (
              <div className="mt-1">
                {availableTags.map(tag => renderTagChip(tag, false))}
              </div>
            ) : (
              !search.trim() && assignedTags.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-500">Brak dostępnych tagów</div>
              )
            )}
          </div>
        </div>
        
        <button onClick={onClose} className="absolute bottom-10 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-colors">
          <X size={20} />
        </button>
      </div>

      {editingTag && <TagEditModal tag={editingTag} onClose={() => setEditingTag(null)} />}
      {deletingTag && <TagDeleteModal tag={deletingTag} workspaceId={activeWorkspace.id} onClose={() => setDeletingTag(null)} />}
    </>
  );
}
