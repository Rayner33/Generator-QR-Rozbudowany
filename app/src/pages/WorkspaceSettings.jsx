import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, deleteDoc, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { HexColorPicker } from "react-colorful";
import { Check, X, Search, MoreVertical, Trash2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InviteMemberModal from '../components/InviteMemberModal';
import { PREDEFINED_GRADIENTS, darkenHex } from '../utils/colors';

export default function WorkspaceSettings({ activeWorkspace, currentUser, workspaces }) {
  const navigate = useNavigate();
  const [mountedWorkspaceId] = useState(activeWorkspace?.id);
  const [activeTab, setActiveTab] = useState('Ogólne');
  const [hoveredTab, setHoveredTab] = useState(null);
  const [name, setName] = useState(activeWorkspace?.name || '');
  const [avatarStyle, setAvatarStyle] = useState(activeWorkspace?.avatarStyle || PREDEFINED_GRADIENTS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [membersDetails, setMembersDetails] = useState([]);
  const [saveMessage, setSaveMessage] = useState('');
  const [memberToRemove, setMemberToRemove] = useState(null);
  const colorPickerRef = useRef(null);

  // Uprawnienia
  const [allowMembersEdit, setAllowMembersEdit] = useState(activeWorkspace?.allowMembersEdit || false);
  const [allowMembersArchive, setAllowMembersArchive] = useState(activeWorkspace?.allowMembersArchive || false);
  const [allowMembersReset, setAllowMembersReset] = useState(activeWorkspace?.allowMembersReset || false);

  // Członkowie
  const [searchQuery, setSearchQuery] = useState('');
  
  const isOwner = activeWorkspace?.ownerId === currentUser.uid;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };
    if (showColorPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColorPicker]);

  useEffect(() => {
    // Automatyczne przekierowanie do strony głównej, gdy użytkownik będąc w ustawieniach
    // zmieni Workspace z paska bocznego na jakikolwiek inny
    if (activeWorkspace && mountedWorkspaceId && activeWorkspace.id !== mountedWorkspaceId) {
      navigate('/');
    }
  }, [activeWorkspace, mountedWorkspaceId, navigate]);

  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name);
      setAvatarStyle(activeWorkspace.avatarStyle || PREDEFINED_GRADIENTS[0]);
      setAllowMembersEdit(activeWorkspace.allowMembersEdit || false);
      setAllowMembersArchive(activeWorkspace.allowMembersArchive || false);
      setAllowMembersReset(activeWorkspace.allowMembersReset || false);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    async function fetchMembers() {
      if (!activeWorkspace) return;
      const uids = [activeWorkspace.ownerId, ...(activeWorkspace.members || [])];
      const details = [];
      for (const uid of uids) {
        if (!uid) continue;
        try {
          const snap = await getDoc(doc(db, "users", uid));
          if (snap.exists()) {
            details.push(snap.data());
          }
        } catch (e) {
          console.error(e);
        }
      }
      setMembersDetails(details);
    }
    fetchMembers();
  }, [activeWorkspace]);

  if (!activeWorkspace || activeWorkspace.type === 'personal') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-xl font-semibold mb-2">Brak dostępu</h2>
        <p className="text-gray-400">Wybrana przestrzeń robocza nie jest zespołem.</p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    setSaveMessage('');
    try {
      await updateDoc(doc(db, "workspaces", activeWorkspace.id), {
        name,
        avatarStyle,
        allowMembersEdit,
        allowMembersArchive,
        allowMembersReset
      });
      setSaveMessage('Zaktualizowano pomyślnie!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error("Błąd podczas zapisywania:", error);
      setSaveMessage('Wystąpił błąd.');
    }
    setIsSaving(false);
  };

  const handleDeleteOrLeave = async () => {
    try {
      if (isOwner) {
        // Usuwanie kaskadowe
        const qrcodesQ = query(collection(db, "qrcodes"), where("workspaceId", "==", activeWorkspace.id));
        const qrcodesSnap = await getDocs(qrcodesQ);
        const deletePromises = qrcodesSnap.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);

        await deleteDoc(doc(db, "workspaces", activeWorkspace.id));
      } else {
        // Opuszczanie
        await updateDoc(doc(db, "workspaces", activeWorkspace.id), {
          members: arrayRemove(currentUser.uid)
        });
      }
      navigate('/');
    } catch (error) {
      console.error("Błąd podczas akcji krytycznej:", error);
    }
    setIsConfirmModalOpen(false);
  };

  const renderGeneralTab = () => (
    <div className="w-full">
      {isOwner ? (
        <div className="bg-card border border-border rounded-xl p-8 mb-8">
          <h2 className="text-xl font-semibold mb-2">Dane zespołu</h2>
          <p className="text-gray-400 text-sm mb-8">Zaktualizuj profil swojego zespołu. Możesz zmienić nazwę i paletę kolorystyczną.</p>

          <div className="flex flex-col gap-8">
            <div className="flex items-start gap-8">
              <div 
                className="w-24 h-24 flex items-center justify-center text-white font-bold text-4xl shadow-lg border-4 border-border shrink-0"
                style={{ background: avatarStyle, borderRadius: '30%' }}
              >
                {name.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="text-sm font-medium mb-3">Wybierz kolor zespołu</p>
                <div className="flex flex-wrap gap-3 max-w-sm relative">
                  {PREDEFINED_GRADIENTS.map((gradient, index) => (
                    <button
                      key={index}
                      onClick={() => { setAvatarStyle(gradient); setShowColorPicker(false); }}
                      className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${avatarStyle === gradient ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : 'border border-border'}`}
                      style={{ background: gradient }}
                    />
                  ))}
                  
                  <button 
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className={`w-10 h-10 rounded-full border border-border flex items-center justify-center bg-card transition-transform hover:scale-110 ${showColorPicker ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : ''}`}
                    title="Własny kolor"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-red-500 via-green-500 to-blue-500" />
                  </button>
                  
                  {showColorPicker && (
                    <div ref={colorPickerRef} className="absolute top-12 left-0 z-50 p-3 bg-card border border-border rounded-xl shadow-xl">
                      <HexColorPicker 
                        color={avatarStyle?.match(/#[0-9a-fA-F]{6}/)?.[0] || '#FF4C00'} 
                        onChange={(color) => setAvatarStyle(`linear-gradient(to bottom right, ${color}, ${darkenHex(color, 60)})`)} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="max-w-md">
              <div className="relative">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f97316] transition-colors"
                  placeholder="Nazwa zespołu"
                />
                <Check className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />
              </div>
            </div>

            <div className="flex items-center">
              <button 
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
                className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </button>
              {saveMessage && <span className={`ml-4 text-sm font-medium ${saveMessage.includes('błąd') ? 'text-red-400' : 'text-green-400'}`}>{saveMessage}</span>}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 mb-8 flex items-center gap-8">
          <div 
            className="w-24 h-24 flex items-center justify-center text-white font-bold text-4xl shadow-lg border-4 border-border shrink-0"
            style={{ background: avatarStyle, borderRadius: '30%' }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">{name}</h2>
            <p className="text-gray-400 text-sm">Jesteś zaproszonym członkiem tego zespołu. Nie masz uprawnień do zmiany nazwy ani kolorystyki.</p>
          </div>
        </div>
      )}

      <div className="bg-card border border-red-500/30 rounded-xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-semibold mb-2">
            {isOwner ? 'Usuń zespół' : 'Opuść zespół'}
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md">
            {isOwner 
              ? 'Trwałe usunięcie zespołu spowoduje bezpowrotne wykasowanie wszystkich przypisanych do niego Kodów QR oraz Smart Linków.' 
              : 'Po opuszczeniu zespołu stracisz dostęp do wszystkich zgromadzonych w nim Kodów QR oraz Smart Linków.'}
          </p>
          <button 
            onClick={() => setIsConfirmModalOpen(true)}
            className="bg-red-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-500 transition-colors"
          >
            {isOwner ? 'Usuń zespół' : 'Opuść zespół'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderMembersTab = () => (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Szukaj członków..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181b] border border-border rounded-lg py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-[#f97316] transition-colors"
          />
        </div>
        {isOwner && (
          <button onClick={() => setIsInviteModalOpen(true)} className="bg-white text-black font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-gray-200 transition-colors shrink-0">
            Dodaj członków
          </button>
        )}
      </div>

      <div className="space-y-2">
        {membersDetails.filter(m => m.email.toLowerCase().includes(searchQuery.toLowerCase()) || m.name.toLowerCase().includes(searchQuery.toLowerCase())).map(member => {
          const isUserOwner = member.uid === activeWorkspace.ownerId;
          const isCurrentUser = member.uid === currentUser.uid;
          return (
            <div key={member.uid} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl group hover:border-gray-600 transition-colors">
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                  style={{ background: member.avatarStyle || 'linear-gradient(to top right, #FF4C00, #9333ea)', borderRadius: '30%' }}
                >
                  {member.name ? member.name.charAt(0).toUpperCase() : (member.email ? member.email.charAt(0).toUpperCase() : 'U')}
                </div>
                <div>
                  <p className="font-semibold text-sm flex items-center gap-2">
                    {member.name || member.email.split('@')[0]}
                    {isUserOwner && <span className="bg-blue-500/10 text-blue-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Właściciel</span>}
                    {!isUserOwner && <span className="bg-gray-500/10 text-gray-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Członek</span>}
                    {isCurrentUser && <span className="bg-blue-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Ty</span>}
                  </p>
                  <p className="text-xs text-gray-400">{member.email}</p>
                </div>
              </div>
              {isOwner && !isUserOwner && (
                <div className="relative dropdown-container">
                  <button 
                    onClick={() => {
                      const el = document.getElementById(`dropdown-${member.uid}`);
                      if (el.classList.contains('hidden')) {
                        document.querySelectorAll('.member-dropdown').forEach(d => d.classList.add('hidden'));
                        el.classList.remove('hidden');
                      } else {
                        el.classList.add('hidden');
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-border transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                  <div id={`dropdown-${member.uid}`} className="member-dropdown hidden absolute right-0 top-full mt-1 w-32 bg-[#18181b] border border-border rounded-xl shadow-2xl z-50 p-1">
                    <button 
                      onClick={() => setMemberToRemove(member)}
                      className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} /> Usuń
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPermissionsTab = () => (
    <div className="w-full">
      <div className="bg-card border border-border rounded-xl p-8 mb-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#FF4C00]" />
            Uprawnienia Członków Zespołu
          </h2>
          <p className="text-gray-400 text-sm">
            {isOwner 
              ? 'Określ, jakie uprawnienia mają zaproszeni członkowie względem kodów i linków utworzonych przez innych współpracowników. Twoje uprawnienia jako właściciela są zawsze pełne.' 
              : 'Jesteś zaproszonym członkiem. Poniższymi uprawnieniami zarządza wyłącznie właściciel zespołu.'}
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-2xl">
          <div className="flex items-center justify-between p-5 bg-[#18181b] border border-border rounded-xl transition-colors hover:border-gray-700">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-white mb-1">Edycja cudzych kodów</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Pozwala członkom zmieniać adres docelowy i parametry w kodach stworzonych przez innych w zespole.</p>
            </div>
            <button
              onClick={() => isOwner && setAllowMembersEdit(!allowMembersEdit)}
              disabled={!isOwner}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${allowMembersEdit ? 'bg-[#FF4C00]' : 'bg-gray-600'} ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${allowMembersEdit ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-5 bg-[#18181b] border border-border rounded-xl transition-colors hover:border-gray-700">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-white mb-1">Archiwizacja cudzych kodów</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Zezwala członkom na ukrywanie i przywracanie nieswoich kodów z przestrzeni publicznej zespołu.</p>
            </div>
            <button
              onClick={() => isOwner && setAllowMembersArchive(!allowMembersArchive)}
              disabled={!isOwner}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${allowMembersArchive ? 'bg-[#FF4C00]' : 'bg-gray-600'} ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${allowMembersArchive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-5 bg-[#18181b] border border-border rounded-xl transition-colors hover:border-gray-700">
            <div className="pr-4">
              <h3 className="text-sm font-semibold text-white mb-1">Resetowanie analityki</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Pozwala członkom na wyzerowanie licznika kliknięć (operacja jest bezpowrotna!).</p>
            </div>
            <button
              onClick={() => isOwner && setAllowMembersReset(!allowMembersReset)}
              disabled={!isOwner}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${allowMembersReset ? 'bg-[#FF4C00]' : 'bg-gray-600'} ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${allowMembersReset ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
        
        {isOwner && (
          <div className="mt-8 pt-6 border-t border-border flex items-center">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Zapisywanie...' : 'Zapisz uprawnienia'}
            </button>
            {saveMessage && <span className={`ml-4 text-sm font-medium ${saveMessage.includes('błąd') ? 'text-red-400' : 'text-green-400'}`}>{saveMessage}</span>}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold mb-6">Ustawienia zespołu</h1>
      
      <div className="flex items-center gap-2 border-b border-border mb-8 pb-0">
        {['Ogólne', 'Członkowie', 'Uprawnienia'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            onMouseEnter={() => setHoveredTab(tab)}
            onMouseLeave={() => setHoveredTab(null)}
            className={`relative pb-4 pt-2 font-medium px-4 transition-colors ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {hoveredTab === tab && (
              <motion.div 
                layoutId="workspace-tab-hover"
                className="absolute inset-0 bg-white/5 rounded-t-lg -z-10"
                initial={false}
                transition={{ type: "spring", bounce: 0, duration: 0.2 }}
              />
            )}
            {activeTab === tab && (
              <motion.div 
                layoutId="workspace-tab-active"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white z-10"
                initial={false}
                transition={{ type: "spring", bounce: 0, duration: 0.2 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        ))}
      </div>

      <div className="w-full">
        {activeTab === 'Ogólne' && renderGeneralTab()}
        {activeTab === 'Członkowie' && renderMembersTab()}
        {activeTab === 'Uprawnienia' && renderPermissionsTab()}
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-[#0a0a0b] border border-border rounded-2xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
            <h3 className="text-red-500 font-bold mb-2 uppercase">{isOwner ? 'Usuń zespół' : 'Opuść zespół'}</h3>
            <p className="text-sm text-gray-300 mb-6">Czy na pewno chcesz {isOwner ? 'trwale usunąć ten zespół i wszystkie jego kody QR' : 'opuścić ten zespół'}? Tej operacji nie można cofnąć.</p>
            <button onClick={handleDeleteOrLeave} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg mb-2 transition-colors">ZATWIERDŹ</button>
            <button onClick={() => setIsConfirmModalOpen(false)} className="w-full bg-[#18181b] hover:bg-[#27272a] text-gray-300 font-bold py-3 rounded-lg transition-colors border border-border">ANULUJ</button>
          </div>
        </div>
      )}

      {memberToRemove && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0a0a0b] border border-border rounded-2xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
            <h3 className="text-red-500 font-bold mb-2 uppercase tracking-wide">USUŃ CZŁONKA</h3>
            <p className="text-sm text-gray-400 mb-6">Czy na pewno chcesz usunąć tego członka? Cofnie to jego dostęp do projektów i danych zespołu. Potwierdź, aby kontynuować</p>
            <button 
              onClick={async () => {
                await updateDoc(doc(db, "workspaces", activeWorkspace.id), {
                  members: arrayRemove(memberToRemove.uid)
                });
                setMembersDetails(prev => prev.filter(m => m.uid !== memberToRemove.uid));
                setMemberToRemove(null);
              }} 
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl mb-2 transition-colors"
            >
              USUŃ
            </button>
            <button 
              onClick={() => setMemberToRemove(null)} 
              className="w-full bg-[#18181b] hover:bg-[#27272a] text-gray-300 font-bold py-3 rounded-xl transition-colors border border-border"
            >
              ANULUJ
            </button>
          </div>
        </div>
      )}

      <InviteMemberModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        activeWorkspace={activeWorkspace}
      />
    </div>
  );
}
