import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

export default function InviteMemberModal({ isOpen, onClose, activeWorkspace }) {
  const [email, setEmail] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  React.useEffect(() => {
    if (isOpen) {
      getDocs(collection(db, "users")).then(snap => {
        setAllUsers(snap.docs.map(doc => doc.data()));
      }).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearchChange = (e) => {
    setEmail(e.target.value);
    setMessage('');
  };

  const handleInviteConfirm = async () => {
    if (!selectedUser?.email) return;
    setIsSubmitting(true);
    try {
      // Sprawdzenie czy zaproszenie już nie istnieje
      const q = query(collection(db, "invites"), 
        where("email", "==", selectedUser.email), 
        where("workspaceId", "==", activeWorkspace.id),
        where("status", "==", "pending")
      );
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        setMessage('Zaproszenie zostało już wysłane na ten adres.');
        setIsSubmitting(false);
        setIsConfirming(false);
        return;
      }

      await addDoc(collection(db, "invites"), {
        email: selectedUser.email,
        workspaceId: activeWorkspace.id,
        workspaceName: activeWorkspace.name,
        workspaceAvatarStyle: activeWorkspace.avatarStyle,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      setMessage('Zaproszenie wysłane pomyślnie!');
      setEmail('');
    } catch (error) {
      console.error(error);
      setMessage('Wystąpił błąd podczas wysyłania zaproszenia.');
    }
    setIsSubmitting(false);
    setIsConfirming(false);
  };

  const matchedUsers = email.trim().length >= 2 
    ? allUsers.filter(u => u.email.toLowerCase().includes(email.toLowerCase()) || (u.name && u.name.toLowerCase().includes(email.toLowerCase())))
    : [];

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
        <div className="w-[400px] h-full bg-[#0a0a0b] border-l border-border shadow-2xl flex flex-col animate-slide-in-right relative">
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors z-10"
          >
            <X size={18} />
          </button>

          <div className="p-8 pb-4">
            <h2 className="text-xl font-bold mb-2">Zaproś członków zespołu</h2>
            <p className="text-sm text-gray-400 mb-8">Wyszukaj członków zespołu po adresie e-mail, aby ich zaprosić</p>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="name@example.com"
                value={email}
                onChange={handleSearchChange}
                className="w-full bg-[#18181b] border border-border rounded-lg py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            
            {message && (
              <div className="mb-4 text-sm text-center text-[#10b981] font-semibold bg-[#10b981]/10 py-2 rounded-lg">
                {message}
              </div>
            )}

            {matchedUsers.length > 0 && !message && (
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {matchedUsers.map(u => (
                  <div key={u.uid} className="flex items-center justify-between bg-card border border-border p-3 rounded-xl animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                        style={{ background: u.avatarStyle || 'linear-gradient(to top right, #FF4C00, #9333ea)', borderRadius: '30%' }}
                      >
                        {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold truncate w-32">{u.name || u.email.split('@')[0]}</span>
                        <span className="text-xs text-gray-400 truncate w-32">{u.email}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setSelectedUser(u); setIsConfirming(true); }}
                      className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Zaproś
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {matchedUsers.length === 0 && !message && (
              <div className="flex flex-col items-center justify-center h-48 opacity-50 mt-12">
                <div className="w-16 h-16 bg-[#18181b] border border-border rounded-2xl flex flex-col items-center justify-center mb-4 relative">
                  <span className="absolute -top-1 -left-1 text-xs">A</span>
                  <span className="absolute -bottom-1 -right-1 text-xs">@</span>
                  <Search size={20} className="text-gray-500" />
                </div>
                <p className="text-xs text-gray-500">Wyszukaj po e-mailu</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isConfirming && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0a0a0b] border border-border rounded-2xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
            <h3 className="font-bold mb-2 uppercase text-white">Zaproś użytkownika</h3>
            <p className="text-sm text-gray-400 mb-6">Czy chcesz wysłać zaproszenie do dołączenia do Twojego zespołu?</p>
            <button 
              onClick={handleInviteConfirm} 
              disabled={isSubmitting}
              className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-lg mb-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'WYSYŁANIE...' : 'ZAPROŚ'}
            </button>
            <button 
              onClick={() => setIsConfirming(false)} 
              className="w-full bg-[#18181b] hover:bg-[#27272a] text-gray-300 font-bold py-3 rounded-lg transition-colors border border-border"
            >
              ANULUJ
            </button>
          </div>
        </div>
      )}
    </>
  );
}
