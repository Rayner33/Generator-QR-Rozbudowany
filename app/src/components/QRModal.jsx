import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Link as LinkIcon, Phone, MessageSquare, Type, FileText, Wifi, Image as ImageIcon, Trash, QrCode, Globe, Network, ChevronLeft, ChevronRight } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';
import { HexColorPicker } from 'react-colorful';
import { db, auth } from '../firebase';
import { collection, addDoc, updateDoc, setDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import UTMBuilderModal from './UTMBuilderModal';
import { buildUrlWithUtm } from '../utils/analyticsHelpers';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const DraggableTabsWrapper = ({ children }) => {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const scroll = (amount) => {
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className="relative group flex items-center ml-9 mb-6">
      <button 
        onClick={(e) => { e.preventDefault(); scroll(-150); }} 
        className="absolute left-0 z-10 p-1 bg-[#18181b]/90 text-white rounded-r hidden group-hover:block border border-border shadow-md"
      >
        <ChevronLeft size={20} />
      </button>
      
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-2 w-full select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {children}
      </div>

      <button 
        onClick={(e) => { e.preventDefault(); scroll(150); }} 
        className="absolute right-0 z-10 p-1 bg-[#18181b]/90 text-white rounded-l hidden group-hover:block border border-border shadow-md"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default function QRModal({ isOpen, onClose, activeWorkspace, mode = 'create', initialData = null }) {
  const [title, setTitle] = useState('');
  const [codeId, setCodeId] = useState('');
  const [isCodeAvailable, setIsCodeAvailable] = useState(true);
  const [isCodeChecking, setIsCodeChecking] = useState(false);
  
  // Content Types
  const [contentType, setContentType] = useState('url');
  const [urlData, setUrlData] = useState('');
  const [phoneData, setPhoneData] = useState('');
  const [emailData, setEmailData] = useState({ address: '', subject: '', body: '' });
  const [wifiData, setWifiData] = useState({ ssid: '', password: '', type: 'WPA' });
  const [vcardData, setVcardData] = useState({ firstName: '', lastName: '', phone: '', email: '', company: '', title: '', website: '' });
  const [textData, setTextData] = useState('');

  const [styleType, setStyleType] = useState('rounded');
  const [dotsColor, setDotsColor] = useState('#000000');
  const [eyeColor, setEyeColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [logoBase64, setLogoBase64] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [openColorPicker, setOpenColorPicker] = useState(null);
  
  // UTM
  const [utmData, setUtmData] = useState(null);
  const [isUtmModalOpen, setIsUtmModalOpen] = useState(false);
  
  const qrRef = useRef(null);
  const qrCode = useRef(null);

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
        setContentType(initialData.contentType || 'url');
        setUrlData(buildUrlWithUtm(initialData.urlData || initialData.url || '', initialData.utm));
        setPhoneData(initialData.phoneData || '');
        setEmailData(initialData.emailData || { address: '', subject: '', body: '' });
        setWifiData(initialData.wifiData || { ssid: '', password: '', type: 'WPA' });
        setVcardData(initialData.vcardData || { firstName: '', lastName: '', phone: '', email: '', company: '', title: '', website: '' });
        setTextData(initialData.textData || '');
        setStyleType(initialData.styleType || 'rounded');
        setDotsColor(initialData.dotsColor || '#000000');
        setEyeColor(initialData.eyeColor || initialData.dotsColor || '#000000');
        setBackgroundColor(initialData.backgroundColor || '#ffffff');
        setLogoBase64(initialData.logoBase64 || null);
        setUtmData(initialData.utm || null);
      } else {
        setCodeId(generateShortCode());
        setTitle('');
        setContentType('url');
        setUrlData('');
        setPhoneData('');
        setEmailData({ address: '', subject: '', body: '' });
        setWifiData({ ssid: '', password: '', type: 'WPA' });
        setVcardData({ firstName: '', lastName: '', phone: '', email: '', company: '', title: '', website: '' });
        setTextData('');
        setStyleType('rounded');
        setDotsColor('#000000');
        setEyeColor('#000000');
        setBackgroundColor('#ffffff');
        setLogoBase64(null);
        setUtmData(null);
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
        const qrDoc = await getDoc(doc(db, "qrcodes", codeId));
        if (qrDoc.exists()) {
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

  const getQrDataString = () => {
    switch (contentType) {
      case 'url': return urlData || 'https://qrc-ai.com';
      case 'text': return getFullUrl();
      case 'phone': return phoneData ? `tel:${phoneData}` : 'tel:';
      case 'email': return emailData.address ? `mailto:${emailData.address}` : 'mailto:';
      case 'wifi': return wifiData.ssid ? `WIFI:T:${wifiData.type};S:${wifiData.ssid};P:${wifiData.password};;` : 'WIFI:S:;;';
      case 'vcard': return vcardData.firstName ? `BEGIN:VCARD\nVERSION:3.0\nN:${vcardData.lastName};${vcardData.firstName};;;\nFN:${vcardData.firstName} ${vcardData.lastName}\nORG:${vcardData.company}\nTITLE:${vcardData.title}\nTEL:${vcardData.phone}\nEMAIL:${vcardData.email}\nURL:${vcardData.website}\nEND:VCARD` : 'BEGIN:VCARD\nVERSION:3.0\nEND:VCARD';
      default: return urlData || 'https://qrc-ai.com';
    }
  };

  const getFullUrl = () => {
    return `${window.location.origin}/${codeId || 'xxxxx'}`;
  };

  const getQrDataToEncode = () => {
    if (contentType === 'wifi') {
      return getQrDataString();
    }
    return getFullUrl();
  };

  const getValidationErrors = () => {
    const errs = {};
    if (contentType === 'url') {
      if (!urlData) errs.urlData = "";
      else if (!/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(urlData)) {
        errs.urlData = "Upewnij się, że link ma poprawny format";
      }
    } else if (contentType === 'text') {
      if (!textData || textData.trim() === '' || textData === '<p><br></p>') errs.textData = "Wpisz jakiś tekst";
    } else if (contentType === 'phone') {
      if (!phoneData) errs.phoneData = "";
      else if (!/^\+?[0-9\s\-()]{7,15}$/.test(phoneData)) {
        errs.phoneData = "Upewnij się, że numer telefonu ma poprawny format";
      }
    } else if (contentType === 'email') {
      if (!emailData.address) errs.emailAddress = "";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData.address)) {
        errs.emailAddress = "Upewnij się, że adres e-mail ma poprawny format";
      }
    } else if (contentType === 'wifi') {
      if (!wifiData.ssid) errs.wifiSsid = "";
      if (wifiData.type !== 'nopass' && !wifiData.password) errs.wifiPassword = "";
    } else if (contentType === 'vcard') {
      if (vcardData.phone && !/^\+?[0-9\s\-()]{7,15}$/.test(vcardData.phone)) {
        errs.vcardPhone = "Poprawny format: +48 123 456 789";
      }
      if (vcardData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vcardData.email)) {
        errs.vcardEmail = "Poprawny format: adres@email.com";
      }
      if (vcardData.website && !/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(vcardData.website)) {
        errs.vcardWebsite = "Poprawny format: https://strona.pl";
      }
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
    const generatedUrl = getQrDataString();
    const dataToSave = {
      url: generatedUrl,
      contentType,
      urlData,
      phoneData,
      emailData,
      wifiData,
      vcardData,
      textData,
      styleType,
      dotsColor,
      eyeColor,
      backgroundColor,
      logoBase64,
      utm: utmData,
      title: title || "Nowy kod QR",
      workspaceId: activeWorkspace.id,
      archived: false
    };

    if (mode === 'edit' && initialData) {
      updateDoc(doc(db, "qrcodes", codeId), dataToSave).catch(e => {
        console.error("Błąd podczas aktualizacji: ", e);
        alert("Nie udało się zaktualizować kodu. Sprawdź reguły bazy Firestore.");
      });
      onClose();
    } else {
      dataToSave.createdAt = serverTimestamp();
      dataToSave.scans = 0;
      dataToSave.createdBy = auth.currentUser?.uid || null;
      setDoc(doc(db, "qrcodes", codeId), dataToSave).catch(e => {
        console.error("Błąd podczas zapisywania: ", e);
        alert("Nie udało się zapisać kodu. Sprawdź reguły bazy Firestore.");
      });
      onClose();
    }
  };

  useEffect(() => {
    if (!qrCode.current) {
      qrCode.current = new QRCodeStyling({
        width: 1000,
        height: 1000,
        type: "svg",
        data: getQrDataToEncode(),
        image: logoBase64 || undefined,
        margin: 0,
        qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: "Q" },
        imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 10, crossOrigin: "anonymous" },
        dotsOptions: { color: dotsColor, type: styleType },
        backgroundOptions: { color: backgroundColor },
        cornersSquareOptions: { color: eyeColor, type: styleType === 'dots' ? 'dot' : (styleType === 'square' ? 'square' : 'extra-rounded') },
        cornersDotOptions: { color: eyeColor, type: styleType === 'square' ? 'square' : 'dot' }
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen && qrRef.current && qrCode.current) {
      qrRef.current.innerHTML = '';
      qrCode.current.append(qrRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (qrCode.current) {
      qrCode.current.update({
        data: getQrDataToEncode(),
        image: logoBase64 || undefined,
        dotsOptions: { type: styleType, color: dotsColor },
        backgroundOptions: { color: backgroundColor },
        cornersSquareOptions: { type: styleType === 'dots' ? 'dot' : (styleType === 'square' ? 'square' : 'extra-rounded'), color: eyeColor },
        cornersDotOptions: { type: styleType === 'square' ? 'square' : 'dot', color: eyeColor }
      });
    }
  }, [contentType, urlData, phoneData, emailData, wifiData, vcardData, textData, styleType, dotsColor, eyeColor, backgroundColor, codeId, logoBase64]);

  const getScannability = () => {
    const getLuminance = (hex) => {
      let color = hex.replace('#', '');
      if (color.length === 3) color = color.split('').map(x => x+x).join('');
      const rgb = [
        parseInt(color.substring(0, 2), 16) / 255,
        parseInt(color.substring(2, 4), 16) / 255,
        parseInt(color.substring(4, 6), 16) / 255
      ].map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    };
    
    const getContrast = (hex1, hex2) => {
      try {
        const l1 = getLuminance(hex1);
        const l2 = getLuminance(hex2);
        const lightest = Math.max(l1, l2);
        const darkest = Math.min(l1, l2);
        return (lightest + 0.05) / (darkest + 0.05);
      } catch (e) { return 1; }
    };
    
    const minContrast = Math.min(getContrast(backgroundColor, dotsColor), getContrast(backgroundColor, eyeColor));
    
    let text = "Brak skanowalności";
    let color = "text-red-500";
    let percent = 0;
    
    if (minContrast >= 5.5) {
      text = "Wysoka skanowalność"; color = "text-[#10b981]"; 
      percent = 75 + Math.min(1, (minContrast - 5.5) / (21 - 5.5)) * 25;
    } else if (minContrast >= 3.5) {
      text = "Średnia skanowalność"; color = "text-yellow-500"; 
      percent = 50 + ((minContrast - 3.5) / (5.5 - 3.5)) * 25;
    } else if (minContrast >= 2.0) {
      text = "Niska skanowalność"; color = "text-orange-500"; 
      percent = 25 + ((minContrast - 2.0) / (3.5 - 2.0)) * 25;
    } else {
      percent = Math.max(0, ((minContrast - 1.0) / (2.0 - 1.0))) * 25;
    }

    return { text, color, percent };
  };

  const scannability = getScannability();

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4" 
          onClick={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
            className="bg-[#0a0a0b] border border-border rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative" 
            onClick={e => e.stopPropagation()}
          >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-sidebar">
          <div className="flex items-center gap-3">
             <div className="bg-card p-2 rounded-lg border border-border">
               <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
             </div>
             <h2 className="text-xl font-semibold">
               {mode === 'edit' ? 'Edytuj kod QR' : mode === 'duplicate' ? 'Duplikuj kod QR' : 'Nowy kod QR'}
             </h2>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={onClose} className="p-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors">
               <X size={20} />
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Form */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {/* Step 1: Short link */}
            <div>
              <h3 className="flex items-center gap-3 font-semibold mb-4">
                <span className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs">1</span>
                Short link
              </h3>
              <div className="flex items-start gap-2 ml-9">
                <div className="flex bg-[#0a0a0b] rounded-lg border border-border p-3 focus-within:border-white transition-colors">
                  <span className="text-sm">{window.location.host}</span>
                  <span className="text-sm text-gray-500 mx-1">/</span>
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

            {/* Step 2 */}
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
                  className="flex-1 bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#1ea2e4] transition-colors" 
                />
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <h3 className="flex items-center gap-3 font-semibold mb-4">
                <span className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs">3</span>
                Zawartość
              </h3>
              
              <DraggableTabsWrapper>
                 <Tab icon={<LinkIcon size={18}/>} label="URL / LINK" active={contentType === 'url'} onClick={() => setContentType('url')} />
                 <Tab icon={<Type size={18}/>} label="TEKST" active={contentType === 'text'} onClick={() => setContentType('text')} />
                 <Tab icon={<FileText size={18}/>} label="WIZYTÓWKA" active={contentType === 'vcard'} onClick={() => setContentType('vcard')} />
                 <Tab icon={<Wifi size={18}/>} label="WIFI" active={contentType === 'wifi'} onClick={() => setContentType('wifi')} />
                 <Tab icon={<MessageSquare size={18}/>} label="EMAIL" active={contentType === 'email'} onClick={() => setContentType('email')} />
                 <Tab icon={<Phone size={18}/>} label="TELEFON" active={contentType === 'phone'} onClick={() => setContentType('phone')} />
              </DraggableTabsWrapper>

              <div className="ml-9">
                {contentType === 'url' && (
                  <div className="space-y-4">
                    <ValidatedInput 
                      type="url" 
                      value={urlData}
                      onChange={(val) => setUrlData(val)}
                      placeholder="https://twojastrona.pl" 
                      error={validationErrors.urlData}
                    />
                    <button 
                      type="button"
                      onClick={() => setIsUtmModalOpen(true)}
                      disabled={!urlData || validationErrors.urlData}
                      className={`flex items-center justify-center gap-2 w-fit px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                        !urlData || validationErrors.urlData
                          ? 'bg-[#18181b] border-border text-gray-500 cursor-not-allowed'
                          : 'bg-white border-white text-black hover:bg-gray-200'
                      }`}
                    >
                      <Network size={14} />
                      UTM {utmData && (utmData.source || utmData.medium || utmData.campaign || utmData.content) ? '(Aktywne)' : ''}
                    </button>
                  </div>
                )}
                {contentType === 'text' && (
                  <div className="space-y-4">
                    <div className={`quill-dark ${validationErrors.textData ? 'border-2 border-red-500 rounded-lg' : ''}`}>
                      <ReactQuill 
                        theme="snow" 
                        value={textData} 
                        onChange={setTextData} 
                        placeholder="Wpisz i sformatuj swój tekst..."
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'align': [] }],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            ['link', 'clean']
                          ]
                        }}
                      />
                    </div>
                    {validationErrors.textData && <p className="text-red-500 text-xs font-medium mt-1">{validationErrors.textData}</p>}
                    <p className="text-gray-400 text-xs">Ten tekst zostanie wyświetlony na dedykowanej stronie po zeskanowaniu kodu.</p>
                  </div>
                )}
                {contentType === 'phone' && (
                  <ValidatedInput 
                    type="tel" 
                    value={phoneData}
                    onChange={(val) => setPhoneData(val)}
                    placeholder="+48 123 456 789" 
                    error={validationErrors.phoneData}
                  />
                )}
                {contentType === 'email' && (
                  <div className="space-y-3">
                    <ValidatedInput 
                      type="email" 
                      value={emailData.address} 
                      onChange={val => setEmailData({...emailData, address: val})} 
                      placeholder="Adres E-mail" 
                      error={validationErrors.emailAddress}
                    />
                  </div>
                )}
                {contentType === 'wifi' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Typ zabezpieczeń</label>
              <select
                value={wifiData.type}
                onChange={(e) => setWifiData({...wifiData, type: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#1ea2e4] transition-colors"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Brak hasła</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nazwa sieci (SSID)</label>
              <ValidatedInput
                type="text"
                value={wifiData.ssid}
                onChange={(val) => setWifiData({...wifiData, ssid: val})}
                placeholder="np. Moja Sieć Domowa"
                autoComplete="off"
                spellCheck="false"
                error={validationErrors.wifiSsid}
              />
            </div>
            {wifiData.type !== 'nopass' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Hasło</label>
                <ValidatedInput
                  type="password"
                  value={wifiData.password}
                  onChange={(val) => setWifiData({...wifiData, password: val})}
                  placeholder="Skrzętnie ukryte hasło"
                  autoComplete="new-password"
                  error={validationErrors.wifiPassword}
                />
              </div>
            )}
            
            <div className="mt-6 flex items-start gap-3 bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <svg className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.906 14.142 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
              <p className="text-sm text-orange-400/90 leading-relaxed">
                Kody WiFi kodują hasło bezpośrednio w grafice dla natychmiastowego połączenia. Edycja tych danych w przyszłości nieznacznie zmieni wygląd kropek kodu.
              </p>
            </div>
          </div>
                )}
                {contentType === 'vcard' && (
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={vcardData.firstName} onChange={e => setVcardData({...vcardData, firstName: e.target.value})} placeholder="Imię" className="w-full bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#1ea2e4]" />
                    <input type="text" value={vcardData.lastName} onChange={e => setVcardData({...vcardData, lastName: e.target.value})} placeholder="Nazwisko" className="w-full bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#1ea2e4]" />
                    <div className="col-span-2">
                      <ValidatedInput type="tel" value={vcardData.phone} onChange={val => setVcardData({...vcardData, phone: val})} placeholder="Telefon" error={validationErrors.vcardPhone} />
                    </div>
                    <div className="col-span-2">
                      <ValidatedInput type="email" value={vcardData.email} onChange={val => setVcardData({...vcardData, email: val})} placeholder="E-mail" error={validationErrors.vcardEmail} />
                    </div>
                    <input type="text" value={vcardData.company} onChange={e => setVcardData({...vcardData, company: e.target.value})} placeholder="Firma" className="w-full bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#1ea2e4]" />
                    <input type="text" value={vcardData.title} onChange={e => setVcardData({...vcardData, title: e.target.value})} placeholder="Stanowisko" className="w-full bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#1ea2e4]" />
                    <div className="col-span-2">
                      <ValidatedInput type="url" value={vcardData.website} onChange={val => setVcardData({...vcardData, website: val})} placeholder="Strona WWW" error={validationErrors.vcardWebsite} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4 */}
            <div>
              <h3 className="flex items-center gap-3 font-semibold mb-4">
                <span className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs">4</span>
                Wybierz styl kodu QR
              </h3>
              <div className="ml-9 flex gap-3">
                 <StyleCard title="Łagodne" type="rounded" active={styleType === 'rounded'} onClick={() => setStyleType('rounded')} />
                 <StyleCard title="Kropki" type="dots" active={styleType === 'dots'} onClick={() => setStyleType('dots')} />
                 <StyleCard title="Kwadraty" type="square" active={styleType === 'square'} onClick={() => setStyleType('square')} />
              </div>
            </div>

            {/* Step 5 */}
            <div>
              <h3 className="flex items-center gap-3 font-semibold mb-4">
                <span className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs">5</span>
                Kolorystyka
              </h3>
              <div className="ml-9 flex gap-6">
                 <div>
                   <label className="text-xs text-gray-400 block mb-2">Kolor kropek</label>
                   <div className="flex items-center gap-3 relative">
                     <div className="w-10 h-10 rounded cursor-pointer border border-border" style={{ backgroundColor: dotsColor }} onClick={() => setOpenColorPicker('dots')} />
                     <input type="text" value={dotsColor} onChange={e => setDotsColor(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-2 text-sm w-24 uppercase focus:outline-none focus:border-[#1ea2e4]" />
                     {openColorPicker === 'dots' && (
                        <div className="absolute z-10 bottom-[110%] left-0">
                          <div className="fixed inset-0" onClick={() => setOpenColorPicker(null)} />
                          <HexColorPicker color={dotsColor} onChange={setDotsColor} />
                        </div>
                     )}
                   </div>
                 </div>
                 <div>
                   <label className="text-xs text-gray-400 block mb-2">Kolor oczka</label>
                   <div className="flex items-center gap-3 relative">
                     <div className="w-10 h-10 rounded cursor-pointer border border-border" style={{ backgroundColor: eyeColor }} onClick={() => setOpenColorPicker('eye')} />
                     <input type="text" value={eyeColor} onChange={e => setEyeColor(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-2 text-sm w-24 uppercase focus:outline-none focus:border-[#1ea2e4]" />
                     {openColorPicker === 'eye' && (
                        <div className="absolute z-10 bottom-[110%] left-0">
                          <div className="fixed inset-0" onClick={() => setOpenColorPicker(null)} />
                          <HexColorPicker color={eyeColor} onChange={setEyeColor} />
                        </div>
                     )}
                   </div>
                 </div>
                 <div>
                   <label className="text-xs text-gray-400 block mb-2">Kolor tła</label>
                   <div className="flex items-center gap-3 relative">
                     <div className="w-10 h-10 rounded cursor-pointer border border-border" style={{ backgroundColor: backgroundColor }} onClick={() => setOpenColorPicker('bg')} />
                     <input type="text" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-2 text-sm w-24 uppercase focus:outline-none focus:border-[#1ea2e4]" />
                     {openColorPicker === 'bg' && (
                        <div className="absolute z-10 bottom-[110%] left-0">
                          <div className="fixed inset-0" onClick={() => setOpenColorPicker(null)} />
                          <HexColorPicker color={backgroundColor} onChange={setBackgroundColor} />
                        </div>
                     )}
                   </div>
                 </div>
              </div>
            </div>

            {/* Step 6 */}
            <div>
              <h3 className="flex items-center gap-3 font-semibold mb-4">
                <span className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs">6</span>
                Dodaj logo (Opcjonalnie)
              </h3>
              <div className="ml-9 bg-card border border-border rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#1ea2e4]"></div>
                
                <div className="space-y-4">
                {!logoBase64 ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-background hover:bg-white/5 transition-colors group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 text-gray-500 mb-2 group-hover:text-[#1ea2e4] transition-colors" />
                      <p className="text-sm text-gray-400"><span className="font-semibold text-[#1ea2e4]">Kliknij aby wgrać</span> lub upuść plik</p>
                      <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".svg,.png,.jpg,.jpeg" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => setLogoBase64(event.target.result);
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-white p-1 flex items-center justify-center shrink-0">
                        <img src={logoBase64} alt="Logo" className="max-w-full max-h-full object-contain" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">Wgrane logo</p>
                        <p className="text-xs text-green-400">Aktywne na podglądzie</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setLogoBase64(null)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Usuń logo"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>

          {/* Right Preview */}
          <div className="w-[450px] bg-sidebar border-l border-border flex flex-col items-center justify-center p-8 relative">
             <div className="w-full aspect-square rounded-3xl flex items-center justify-center relative overflow-hidden shadow-2xl" style={{ backgroundColor }}>
               {/* Kontener dla qr-code-styling */}
               <div ref={qrRef} className="w-full h-full flex items-center justify-center p-[6.5%] [&>*]:w-full [&>*]:h-full"></div>
             </div>
             
             <div className="mt-10 w-full max-w-sm">
               <div className="flex justify-end text-xs mb-3">
                 <span className={`font-bold tracking-wide ${scannability.color}`}>{scannability.text}</span>
               </div>
               <div className="relative w-full h-3 rounded-full flex ring-1 ring-white/10 bg-gradient-to-r from-red-500 via-orange-500 to-[#10b981]">
                 <div className="flex-1 border-r border-white/40"></div>
                 <div className="flex-1 border-r border-white/40"></div>
                 <div className="flex-1 border-r border-white/40"></div>
                 <div className="flex-1"></div>
                 <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-4 bg-white shadow rounded z-10 transition-all duration-500" style={{ left: `calc(${scannability.percent}% - 3px)` }}></div>
               </div>
             </div>
             
             <div className="absolute bottom-6 right-6">
               <button 
                 onClick={handleSave} 
                 disabled={isSaving || !isFormValid}
                 className={`px-6 py-2 rounded-lg font-semibold transition-colors text-white ${isSaving || !isFormValid ? 'bg-gray-500 cursor-not-allowed opacity-50' : 'bg-[#1ea2e4] hover:bg-[#1891ce]'}`}
               >
                 {isSaving ? 'Zapisywanie...' : 'Zapisz kod QR'}
               </button>
             </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
    )}
  </AnimatePresence>

      <UTMBuilderModal 
        isOpen={isUtmModalOpen} 
        onClose={() => setIsUtmModalOpen(false)} 
        onSave={(data) => {
          setUtmData(data);
          setUrlData(prevUrl => buildUrlWithUtm(prevUrl, data));
          setIsUtmModalOpen(false);
        }} 
        initialUtm={utmData}
        type="qr"
      />
    </>
);
}

function Tab({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} className={`relative flex flex-col items-center gap-2 cursor-pointer pb-2 whitespace-nowrap min-w-[100px] transition-colors ${active ? 'text-[#1ea2e4]' : 'text-gray-400 hover:text-white'}`}>
      {icon}
      <span className="text-xs font-semibold">{label}</span>
      {active && (
        <motion.div
          layoutId="qr-modal-active-tab"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1ea2e4]"
          initial={false}
          transition={{ type: "spring", bounce: 0, duration: 0.2 }}
        />
      )}
    </div>
  );
}

function StyleIcon({ type }) {
  if (type === 'dots') {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="5" cy="5" r="3" />
        <circle cx="12" cy="5" r="3" />
        <circle cx="19" cy="5" r="3" />
        <circle cx="5" cy="12" r="3" />
        <circle cx="12" cy="12" r="3" />
        <circle cx="19" cy="12" r="3" />
        <circle cx="5" cy="19" r="3" />
        <circle cx="12" cy="19" r="3" />
        <circle cx="19" cy="19" r="3" />
      </svg>
    );
  }
  if (type === 'square') {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="2" width="6" height="6" />
        <rect x="9" y="2" width="6" height="6" />
        <rect x="16" y="2" width="6" height="6" />
        <rect x="2" y="9" width="6" height="6" />
        <rect x="9" y="9" width="6" height="6" />
        <rect x="16" y="9" width="6" height="6" />
        <rect x="2" y="16" width="6" height="6" />
        <rect x="9" y="16" width="6" height="6" />
        <rect x="16" y="16" width="6" height="6" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="2" width="6" height="6" rx="2" />
      <rect x="9" y="2" width="6" height="6" rx="2" />
      <rect x="16" y="2" width="6" height="6" rx="2" />
      <rect x="2" y="9" width="6" height="6" rx="2" />
      <rect x="9" y="9" width="6" height="6" rx="2" />
      <rect x="16" y="9" width="6" height="6" rx="2" />
      <rect x="2" y="16" width="6" height="6" rx="2" />
      <rect x="9" y="16" width="6" height="6" rx="2" />
      <rect x="16" y="16" width="6" height="6" rx="2" />
    </svg>
  );
}

function StyleCard({ title, type, active, onClick }) {
  return (
    <div onClick={onClick} className={`flex-1 p-2.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-center gap-2 ${active ? 'border-[#1ea2e4] bg-[#1ea2e4]/10 text-white' : 'border-border bg-card text-gray-400 hover:border-gray-500 hover:text-gray-200'}`}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/20 shrink-0">
         <StyleIcon type={type} />
      </div>
      <span className="text-sm font-semibold">{title}</span>
    </div>
  );
}

function ValidatedInput({ value, onChange, placeholder, type = "text", error, ...props }) {
  return (
    <div className="w-full">
      <div className="relative">
        <input 
          type={type} 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} 
          className={`w-full bg-card border rounded-lg px-4 py-2 text-sm focus:outline-none transition-colors ${
            error ? 'border-red-500 focus:border-red-500 text-red-500' : 'border-border focus:border-[#1ea2e4] text-white'
          } ${props.className || ''}`}
          {...props}
        />
        {error && (
          <button 
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500/20 hover:bg-red-500/30 rounded flex items-center justify-center transition-colors cursor-pointer"
            title="Wyczyść pole"
          >
            <X className="w-3.5 h-3.5 text-red-500" />
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
