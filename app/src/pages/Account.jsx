import React, { useState, useEffect, useRef } from 'react';
import { updateProfile, signOut } from 'firebase/auth';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Check, Menu } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { PREDEFINED_GRADIENTS, darkenHex } from '../utils/colors';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../utils/animations';
import { getInitials } from '../utils/stringUtils';
import AdminTab from '../components/AdminTab';

export default function Account({ currentUser, workspaces, onMenuClick }) {
  const [username, setUsername] = useState('');
  const [avatarStyle, setAvatarStyle] = useState(PREDEFINED_GRADIENTS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [personalWorkspace, setPersonalWorkspace] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [hoveredTab, setHoveredTab] = useState(null);
  const colorPickerRef = useRef(null);

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
    if (currentUser) {
      setUsername(currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : ''));
      
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
    
    if (workspaces && workspaces.length > 0) {
      const pWs = workspaces.find(w => w.type === 'personal' || w.name === 'Personal');
      setPersonalWorkspace(pWs);
      if (pWs && pWs.avatarStyle) {
        setAvatarStyle(pWs.avatarStyle);
      } else {
        setAvatarStyle(PREDEFINED_GRADIENTS[0]);
      }
    }
  }, [currentUser, workspaces]);

  const handleUpdate = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      if (username !== currentUser.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: username
        });
      }

      if (personalWorkspace) {
        const wsRef = doc(db, 'workspaces', personalWorkspace.id);
        await updateDoc(wsRef, {
          name: username,
          avatarStyle: avatarStyle,
          type: 'personal'
        });
      }

      await setDoc(doc(db, "users", currentUser.uid), {
        name: username,
        avatarStyle: avatarStyle
      }, { merge: true });

      setSaveMessage('Zaktualizowano pomyślnie!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveMessage('Wystąpił błąd podczas aktualizacji.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onMenuClick} className="md:hidden flex items-center justify-center p-2 bg-card border border-border rounded-xl text-white hover:bg-white/5 transition-colors">
          <Menu size={24} />
        </button>
        <h1 className="text-2xl md:text-3xl font-semibold">Konto</h1>
      </div>
      
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border mb-8 pb-0">
        {[
          { id: 'general', label: 'Ogólne' },
          ...(userData?.isAdmin ? [{ id: 'admin', label: 'Administracja' }] : [])
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            className={`relative pb-4 pt-2 font-medium px-4 transition-colors ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {hoveredTab === tab.id && (
              <motion.div 
                layoutId="account-tab-hover"
                className="absolute inset-0 bg-white/5 rounded-t-lg -z-10"
                initial={false}
                transition={{ type: "spring", bounce: 0, duration: 0.2 }}
              />
            )}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="account-tab-active"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white z-10"
                initial={false}
                transition={{ type: "spring", bounce: 0, duration: 0.2 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'general' ? (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-8">
          <motion.div variants={staggerItem} className="bg-card border border-border rounded-xl p-8">
            <h2 className="text-xl font-semibold mb-2">Dane osobowe</h2>
            <p className="text-gray-400 text-sm mb-8">Zaktualizuj swoje dane. Możesz zmienić tylko nazwę użytkownika i awatar.</p>

            <div className="flex flex-col gap-8">
              {/* Avatar Preview & Selection */}
              <div className="flex items-start gap-8">
                {/* Big Avatar */}
                <div 
                  className="w-24 h-24 flex items-center justify-center text-white font-bold text-4xl shadow-lg border-4 border-border shrink-0"
                  style={{ background: avatarStyle, borderRadius: '30%' }}
                >
                  {getInitials(username || currentUser?.email, 'U')}
                </div>
                
                {/* Style Selection */}
                <div>
                  <p className="text-sm font-medium mb-3">Wybierz kolor awatara</p>
                  <div className="flex flex-wrap gap-3 max-w-sm relative">
                    {PREDEFINED_GRADIENTS.map((gradient, index) => (
                      <button
                        key={index}
                        onClick={() => { setAvatarStyle(gradient); setShowColorPicker(false); }}
                        className={`w-10 h-10 rounded-full transition-transform hover:scale-110 backface-hidden transform-gpu bg-clip-padding ${avatarStyle === gradient ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : ''}`}
                        style={{ background: gradient }}
                      />
                    ))}
                    
                    {/* Custom Color Button */}
                    <button 
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center bg-card transition-transform hover:scale-110 backface-hidden transform-gpu bg-clip-padding ${showColorPicker ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : ''}`}
                      title="Własny kolor"
                    >
                       <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-red-500 via-green-500 to-blue-500" />
                    </button>
                    
                    {/* Color Picker Dropdown */}
                    {showColorPicker && (
                      <div ref={colorPickerRef} className="absolute top-12 left-0 z-50 p-3 bg-card border border-border rounded-xl shadow-xl">
                         <HexColorPicker 
                           color={avatarStyle?.match(/#[0-9a-fA-F]{6}/)?.[0] || '#ffffff'} 
                           onChange={(color) => setAvatarStyle(`linear-gradient(to bottom right, ${color}, ${darkenHex(color, 60)})`)} 
                         />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Username Input */}
              <div className="max-w-md">
                <div className="relative">
                   <input 
                     type="text" 
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f97316] transition-colors"
                     placeholder="Twoja nazwa"
                   />
                   <Check className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                </div>
              </div>

              <div className="flex items-center">
                 <button 
                   onClick={handleUpdate}
                   disabled={isSaving || !username.trim()}
                   className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                 >
                   {isSaving ? 'Aktualizowanie...' : 'Aktualizuj'}
                 </button>
                 {saveMessage && <span className={`ml-4 text-sm font-medium ${saveMessage.includes('błąd') ? 'text-red-400' : 'text-green-400'}`}>{saveMessage}</span>}
              </div>
            </div>
          </motion.div>

          {/* Logout Section */}
          <motion.div variants={staggerItem} className="bg-card border border-red-500/30 rounded-xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
            <div className="relative z-10">
              <h2 className="text-xl font-semibold mb-2">Wylogowanie</h2>
              <p className="text-gray-400 text-sm mb-6 max-w-md">Możesz wylogować się ze swojego konta na tym urządzeniu. Zostaniesz przeniesiony do ekranu logowania.</p>
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-red-500 transition-colors"
              >
                Wyloguj się
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <AdminTab />
      )}
    </div>
  );
}
