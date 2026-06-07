import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function NotificationsModal({ isOpen, onClose, pendingInvites, currentUser, setActiveWorkspace }) {
  const [processingId, setProcessingId] = useState(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAccept = async (invite) => {
    setProcessingId(invite.id);
    try {
      // Dodaj użytkownika do zespołu
      await updateDoc(doc(db, "workspaces", invite.workspaceId), {
        members: arrayUnion(currentUser.uid)
      });
      // Zmień status zaproszenia
      await updateDoc(doc(db, "invites", invite.id), {
        status: 'accepted'
      });
      
      if (setActiveWorkspace) {
        setActiveWorkspace({
          id: invite.workspaceId,
          name: invite.workspaceName,
          type: 'team',
          avatarStyle: invite.workspaceAvatarStyle
        });
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
      await updateDoc(doc(db, "invites", invite.id), {
        status: 'rejected'
      });
      if (pendingInvites.length <= 1) {
        onClose();
      }
    } catch (error) {
      console.error("Błąd podczas odrzucania:", error);
    }
    setProcessingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-[400px] h-full bg-[#0a0a0b] border-l border-border shadow-2xl flex flex-col animate-slide-in-right relative">
        
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
                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 font-medium">Zaproszono cię do dołączenia do</span>
                      <span className="text-xs font-bold text-white truncate w-32">{invite.workspaceName}</span>
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
      </div>
    </div>
  );
}
