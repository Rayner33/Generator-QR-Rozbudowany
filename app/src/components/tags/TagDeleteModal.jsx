import React, { useState } from 'react';
import { doc, deleteDoc, getDocs, query, collection, where, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function TagDeleteModal({ tag, workspaceId, onClose }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // 1. Usuń sam tag z kolekcji 'tags'
      await deleteDoc(doc(db, 'tags', tag.id));

      // 2. Odszukaj wszystkie kody QR w tym workspace, które posiadają ten tag i usuń go z ich tablic
      const q = query(
        collection(db, "qrcodes"), 
        where("workspaceId", "==", workspaceId),
        where("tags", "array-contains", tag.id)
      );
      
      const snapshot = await getDocs(q);
      const updates = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const newTags = (data.tags || []).filter(tId => tId !== tag.id);
        return updateDoc(doc(db, "qrcodes", docSnap.id), { tags: newTags });
      });

      await Promise.all(updates);
      onClose(true); // true = usunięto
    } catch (err) {
      console.error("Error deleting tag:", err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-[#0a0a0b] border border-border rounded-2xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
        <h3 className="text-red-500 font-bold mb-2 uppercase text-sm tracking-wider">Usuń tag</h3>
        <p className="text-xs text-gray-300 mb-6 px-2">Ten tag zostanie usunięty ze wszystkich elementów. Tej czynności nie można cofnąć.</p>
        <button 
          onClick={handleDelete} 
          disabled={isDeleting}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 text-sm rounded-lg mb-2 transition-colors disabled:opacity-50"
        >
          {isDeleting ? 'USUWANIE...' : 'USUŃ'}
        </button>
        <button 
          onClick={() => onClose(false)} 
          className="w-full bg-[#18181b] hover:bg-[#27272a] text-gray-300 font-bold py-2.5 text-sm rounded-lg transition-colors border border-border"
        >
          ANULUJ
        </button>
      </div>
    </div>
  );
}
