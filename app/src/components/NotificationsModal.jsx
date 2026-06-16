import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, getDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function NotificationsModal({ isOpen, onClose, pendingInvites, currentUser, setActiveWorkspace }) {
  const [processingId, setProcessingId] = useState(null);
  const navigate = useNavigate();

  const handleAccept = async (invite) => {
    setProcessingId(invite.id);
    try {
      if (invite.type === 'transfer_request') {
        const workspaceRef = doc(db, "workspaces", invite.workspaceId);
        const workspaceSnap = await getDoc(workspaceRef);
        if (workspaceSnap.exists()) {
          const workspaceData = workspaceSnap.data();
          const oldOwnerId = workspaceData.ownerId;
          
          let newMembers = (workspaceData.members || []).filter(uid => uid !== currentUser.uid);
          if (!newMembers.includes(oldOwnerId)) {
            newMembers.push(oldOwnerId);
          }
          
          await updateDoc(workspaceRef, {
            ownerId: currentUser.uid,
            [`memberRoles.${oldOwnerId}`]: 'member',
            members: newMembers
          });
        }
        await deleteDoc(doc(db, "invites", invite.id));
      } else {
        // Dodaj użytkownika do zespołu
        await updateDoc(doc(db, "workspaces", invite.workspaceId), {
          members: arrayUnion(currentUser.uid)
        });
        // Zmień status zaproszenia
        await updateDoc(doc(db, "invites", invite.id), {
          status: 'accepted'
        });
      }
      
      if (setActiveWorkspace) {
        // Zamiast częściowych danych, pobierz pełen, odświeżony obiekt zespołu z bazy
        const updatedSnap = await getDoc(doc(db, "workspaces", invite.workspaceId));
        if (updatedSnap.exists()) {
          setActiveWorkspace({ id: updatedSnap.id, ...updatedSnap.data() });
        }
      }
      
      // Jeśli to ostatnie zaproszenie, zamknij modal
      if (pendingInvites.length <= 1) {
        onClose();
      }
      
      // Wymuś przekierowanie na stronę z kodami QR
      navigate('/');
    } catch (error) {
      console.error("Błąd podczas akceptacji:", error);
    }
    setProcessingId(null);
  };

  const handleReject = async (invite) => {
    setProcessingId(invite.id);
    try {
      if (invite.type === 'transfer_request') {
        await deleteDoc(doc(db, "invites", invite.id));
      } else {
        await updateDoc(doc(db, "invites", invite.id), {
          status: 'rejected'
        });
      }
      if (pendingInvites.length <= 1) {
        onClose();
      }
    } catch (error) {
      console.error("Błąd podczas odrzucania:", error);
    }
    setProcessingId(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="notifications-modal"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex justify-end"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="w-[400px] h-full bg-[#0a0a0b] border-l border-border shadow-2xl flex flex-col relative z-10"
          >
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="p-8 pb-4 border-b border-border">
          <h2 className="text-xl font-bold mb-1">Powiadomienia</h2>
          <p className="text-xs text-gray-400">Zarządzaj zaproszeniami do zespołu i powiadomieniami</p>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {!pendingInvites || pendingInvites.length === 0 ? (
            <div className="text-center text-gray-500 mt-10 text-sm">
              Brak nowych powiadomień.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingInvites.map(invite => (
                <div key={invite.id} className={`flex items-center justify-between bg-card border border-border p-3 rounded-xl transition-opacity ${processingId === invite.id ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm"
                      style={{ background: invite.workspaceAvatarStyle || 'linear-gradient(to top right, #FF4C00, #9333ea)', borderRadius: '30%' }}
                    >
                      {invite.workspaceName ? invite.workspaceName.charAt(0).toUpperCase() : 'Z'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-0.5">
                        {invite.type === 'transfer_request' ? 'Przekazanie Zespołu' : 'Zaproszenie do zespołu'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {invite.type === 'transfer_request' 
                          ? <span><span className="text-white font-medium">{invite.senderEmail}</span> chce przekazać Ci własność nad zespołem <strong className="text-white">{invite.workspaceName}</strong></span>
                          : <span>Użytkownik <span className="text-white font-medium">{invite.senderEmail}</span> zaprasza do <strong className="text-white">{invite.workspaceName}</strong></span>
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleAccept(invite)}
                      disabled={processingId === invite.id}
                      className="w-7 h-7 bg-[#10b981] hover:bg-[#059669] text-white rounded-full flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
                      title="Akceptuj"
                    >
                      <Check size={14} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => handleReject(invite)}
                      disabled={processingId === invite.id}
                      className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
                      title="Odrzuć"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
