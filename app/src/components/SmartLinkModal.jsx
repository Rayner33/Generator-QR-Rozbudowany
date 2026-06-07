import React, { useState, useEffect } from 'react';
import { X, Check, Globe } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc, updateDoc, setDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';

export default function SmartLinkModal({ isOpen, onClose, activeWorkspace, mode = 'create', initialData = null }) {
  const [title, setTitle] = useState('');
  const [codeId, setCodeId] = useState('');
  const [isCodeAvailable, setIsCodeAvailable] = useState(true);
  const [isCodeChecking, setIsCodeChecking] = useState(false);
  
  const [urlData, setUrlData] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const generateShortCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  useEffect(() => {
    if (isOpen) {
      if ((mode === 'edit' || mode === 'duplicate') && initialData) {
        if (mode === 'edit') setCodeId(initialData.id);
        else setCodeId(generateShortCode());
        
        setTitle(mode === 'duplicate' ? `${initialData.title} (Kopia)` : initialData.title);
        setUrlData(initialData.url || '');
      } else {
        setCodeId(generateShortCode());
        setTitle('');
        setUrlData('');
      }
      setIsSaving(false);
    }
  }, [isOpen, mode, initialData]);

  useEffect(() => {
    if (!isOpen || mode === 'edit') return;
    if (!codeId || codeId.length < 3) {
      setIsCodeAvailable(false);
      return;
    }
    
    setIsCodeChecking(true);
    const checkAvailability = async () => {
      try {
        const docSnap = await getDoc(doc(db, "smartlinks", codeId));
        if (docSnap.exists()) {
          setIsCodeAvailable(false);
        } else {
          setIsCodeAvailable(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsCodeChecking(false);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [codeId, isOpen, mode]);

  const getValidationErrors = () => {
    const errs = {};
    if (!urlData) errs.urlData = "";
    else if (!/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(urlData)) {
      errs.urlData = "Upewnij się, że link ma poprawny format";
    }
    
    if (mode !== 'edit') {
      if (!codeId || codeId.length < 3) errs.codeId = "Zbyt krótki link";
      else if (!isCodeAvailable) errs.codeId = "Ten URL jest już używany";
      else if (isCodeChecking) errs.codeId = "Sprawdzanie...";
    }
    return errs;
  };

  const validationErrors = getValidationErrors();
  const isFormValid = Object.keys(validationErrors).length === 0;

  const handleSave = () => {
    setIsSaving(true);
    let finalUrl = urlData;
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
    }
    
    const dataToSave = {
      url: finalUrl,
      title: title || "Nowy Smart Link",
      workspaceId: activeWorkspace.id,
      archived: false
    };

    if (mode === 'edit' && initialData) {
      updateDoc(doc(db, "smartlinks", codeId), dataToSave).catch(e => {
        console.error("Błąd podczas aktualizacji: ", e);
        alert("Nie udało się zaktualizować linku. Sprawdź reguły bazy Firestore.");
      });
      onClose();
    } else {
      dataToSave.createdAt = serverTimestamp();
      dataToSave.clicks = 0;
      dataToSave.createdBy = auth.currentUser?.uid || null;
      setDoc(doc(db, "smartlinks", codeId), dataToSave).catch(e => {
        console.error("Błąd podczas zapisywania: ", e);
        alert("Nie udało się zapisać linku. Sprawdź reguły bazy Firestore.");
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#0a0a0b] border border-border rounded-2xl w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-sidebar">
          <div className="flex items-center gap-3">
             <div className="bg-card p-2 rounded-lg border border-border">
               <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
             </div>
             <h2 className="text-xl font-semibold">
               {mode === 'edit' ? 'Edytuj Smart Link' : mode === 'duplicate' ? 'Duplikuj Smart Link' : 'Nowy Smart Link'}
             </h2>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={onClose} className="p-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors">
               <X size={20} />
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col p-8 space-y-8 overflow-y-auto custom-scrollbar max-h-[75vh]">
          {/* Step 1: Short link */}
          <div>
            <h3 className="flex items-center gap-3 font-semibold mb-4">
              <span className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs">1</span>
              Short link
            </h3>
            <div className="flex items-start gap-2 ml-9">
              <div className="flex items-center bg-[#1a1a1c] border border-border rounded-lg px-3 py-2 shrink-0 h-[38px]">
                 <Globe className="w-4 h-4 mr-2 text-gray-400" />
                 <span className="text-sm">{window.location.host}</span>
              </div>
              
              <div className="flex-1">
                <div className="relative w-full">
                  <input 
                    type="text" 
                    value={codeId || ''}
                    onChange={(e) => setCodeId(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                    disabled={mode === 'edit'}
                    className={`w-full bg-card border rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none transition-colors ${
                      mode === 'edit' ? 'opacity-50 cursor-not-allowed border-border text-gray-400' :
                      !isCodeAvailable ? 'border-red-500 text-red-500 focus:border-red-500' : 
                      isCodeChecking ? 'border-border text-white' : 'border-[#10b981] focus:border-[#10b981] text-[#10b981]'
                    }`}
                  />
                  {mode !== 'edit' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                      {isCodeChecking ? (
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      ) : !isCodeAvailable ? (
                        <button onClick={() => setCodeId('')} className="bg-red-500/20 hover:bg-red-500/30 rounded flex items-center justify-center w-5 h-5 transition-colors cursor-pointer">
                          <X className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      ) : (
                        <div className="bg-[#10b981]/20 rounded flex items-center justify-center w-5 h-5">
                          <Check className="w-3.5 h-3.5 text-[#10b981]" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {mode !== 'edit' && !isCodeAvailable && !isCodeChecking && codeId?.length >= 3 && (
                   <p className="text-xs text-red-500 mt-1.5">Ten URL jest już używany</p>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Tytuł */}
          <div>
            <h3 className="flex items-center gap-3 font-semibold mb-4">
              <span className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs">2</span>
              Tytuł (Nazwa)
            </h3>
            <div className="flex gap-2 ml-9">
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="np. Kampania Wiosna 2026" 
                className="flex-1 bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors" 
              />
            </div>
          </div>

          {/* Step 3: URL docelowy */}
          <div>
            <h3 className="flex items-center gap-3 font-semibold mb-4">
              <span className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs">3</span>
              URL docelowy
            </h3>
            <div className="ml-9">
              <div className="w-full">
                <div className="relative">
                  <input 
                    type="url" 
                    value={urlData}
                    onChange={(e) => setUrlData(e.target.value)}
                    placeholder="https://twojastrona.pl" 
                    className={`w-full bg-card border rounded-lg px-4 py-2 text-sm focus:outline-none transition-colors ${
                      validationErrors.urlData ? 'border-red-500 focus:border-red-500 text-red-500' : 'border-border focus:border-primary text-white'
                    }`}
                  />
                  {validationErrors.urlData && (
                    <button 
                      type="button"
                      onClick={() => setUrlData('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500/20 hover:bg-red-500/30 rounded flex items-center justify-center transition-colors cursor-pointer"
                      title="Wyczyść pole"
                    >
                      <X className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  )}
                </div>
                {validationErrors.urlData && <p className="text-xs text-red-500 mt-1.5">{validationErrors.urlData}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
             <button 
               onClick={handleSave} 
               disabled={isSaving || !isFormValid}
               className={`px-8 py-3 rounded-lg font-bold transition-colors text-white ${isSaving || !isFormValid ? 'bg-gray-500 cursor-not-allowed opacity-50' : 'bg-[#9333ea] hover:bg-[#7e22ce]'}`}
             >
               {isSaving ? 'Zapisywanie...' : 'Zapisz Smart Link'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
