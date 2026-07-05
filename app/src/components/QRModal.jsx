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
import { QREditorProvider, useQREditor } from './qr-editor/QREditorContext';
import DesignAccordion from './qr-editor/DesignAccordion';
import QRLivePreview from './qr-editor/QRLivePreview';

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

function QRModalInner({ isOpen, onClose, activeWorkspace, mode = 'create', initialData = null }) {
  const editor = useQREditor();
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
  const [isSaving, setIsSaving] = useState(false);

  // UTM
  const [utmData, setUtmData] = useState(null);
  const [isUtmModalOpen, setIsUtmModalOpen] = useState(false);

  // Optymalizacja ładowania
  const [showPreview, setShowPreview] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowPreview(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowPreview(false);
    }
  }, [isOpen]);
  
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
        
        // Inicjalizacja nowego wyglądu (QREditorContext)
        if (initialData.designData) {
          editor.setModuleShape(initialData.designData.moduleShape || 'rounded');
          editor.setMarkerOuterShape(initialData.designData.markerOuterShape || 'rounded');
          editor.setMarkerInnerShape(initialData.designData.markerInnerShape || 'dot');
          editor.setForegroundType(initialData.designData.foregroundType || 'solid');
          editor.setForegroundColor(initialData.designData.foregroundColor || '#000000');
          if (initialData.designData.foregroundGradient) editor.setForegroundGradient(initialData.designData.foregroundGradient);
          editor.setBackgroundType(initialData.designData.backgroundType || 'solid');
          editor.setBackgroundColor(initialData.designData.backgroundColor || '#ffffff');
          if (initialData.designData.backgroundGradient) editor.setBackgroundGradient(initialData.designData.backgroundGradient);
          editor.setPadding(initialData.designData.padding ?? 15);
          editor.setLogoImage(initialData.designData.logoImage || null);
          editor.setLogoSize(initialData.designData.logoSize ?? 50);
          editor.setLogoPos(initialData.designData.logoPos || {x:50, y:50});
          editor.setLogoStrokeWidth(initialData.designData.logoStrokeWidth ?? 5);
          editor.setLogoStrokeColor(initialData.designData.logoStrokeColor || null);
          editor.setTextValue(initialData.designData.textValue || '');
          editor.setTextFont(initialData.designData.textFont || 'Arial');
          editor.setTextColor(initialData.designData.textColor || null);
          editor.setTextSize(initialData.designData.textSize ?? 30);
          editor.setTextBold(initialData.designData.textBold || false);
          editor.setTextPos(initialData.designData.textPos || {x:50, y:50});
          editor.setTextStrokeWidth(initialData.designData.textStrokeWidth ?? 7);
          editor.setTextStrokeColor(initialData.designData.textStrokeColor || null);
        } else {
          // Fallback z kompatybilnością wsteczną do starych kodów
          editor.setModuleShape(initialData.styleType || 'rounded');
          editor.setForegroundType('solid');
          editor.setForegroundColor(initialData.dotsColor || '#000000');
          editor.setMarkerOuterShape(initialData.eyeColor ? 'square' : 'rounded'); // rough mapping
          editor.setMarkerInnerShape(initialData.eyeColor ? 'square' : 'dot'); // rough mapping
          editor.setBackgroundType('solid');
          editor.setBackgroundColor(initialData.backgroundColor || '#ffffff');
          editor.setLogoImage(initialData.logoBase64 || null);
        }
        
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
        
        // Resetowanie do defaults dla nowego kodu
        editor.setModuleShape('square');
        editor.setMarkerOuterShape('square');
        editor.setMarkerInnerShape('square');
        editor.setForegroundType('solid');
        editor.setForegroundColor('#000000');
        editor.setBackgroundType('solid');
        editor.setBackgroundColor('#ffffff');
        editor.setPadding(15);
        editor.setLogoImage(null);
        editor.setLogoSize(50);
        editor.setLogoPos({x:50, y:50});
        editor.setLogoStrokeWidth(5);
        editor.setLogoStrokeColor(null);
        editor.setTextValue('');
        editor.setTextFont('Arial');
        editor.setTextColor(null);
        editor.setTextSize(30);
        editor.setTextBold(false);
        editor.setTextPos({x:50, y:50});
        editor.setTextStrokeWidth(7);
        editor.setTextStrokeColor(null);
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
      wifiData,
      vcardData,
      textData,
      utm: utmData,
      title: title || "Nowy kod QR",
      workspaceId: activeWorkspace.id,
      archived: false,
      // Konfiguracja wyglądu z QREditorContext
      styleType: editor.moduleShape,
      dotsColor: editor.foregroundColor, // TODO: lepsza obsługa gradientów w chmurze
      eyeColor: editor.markerOuterShape,
      backgroundColor: editor.backgroundColor,
      logoBase64: editor.logoImage,
      designData: {
        moduleShape: editor.moduleShape,
        markerOuterShape: editor.markerOuterShape,
        markerInnerShape: editor.markerInnerShape,
        foregroundType: editor.foregroundType,
        foregroundColor: editor.foregroundColor,
        foregroundGradient: editor.foregroundGradient,
        backgroundType: editor.backgroundType,
        backgroundColor: editor.backgroundColor,
        backgroundGradient: editor.backgroundGradient,
        padding: editor.padding,
        logoImage: editor.logoImage,
        logoSize: editor.logoSize,
        logoPos: editor.logoPos,
        logoStrokeWidth: editor.logoStrokeWidth,
        logoStrokeColor: editor.logoStrokeColor,
        textValue: editor.textValue,
        textFont: editor.textFont,
        textColor: editor.textColor,
        textSize: editor.textSize,
        textBold: editor.textBold,
        textPos: editor.textPos,
        textStrokeWidth: editor.textStrokeWidth,
        textStrokeColor: editor.textStrokeColor
      }
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

  const getScannability = () => {
    const getLuminance = (hex) => {
      if (!hex || typeof hex !== 'string') return 0;
      let color = hex.replace('#', '');
      if (color.length === 3) color = color.split('').map(x => x+x).join('');
      if (color.length !== 6) return 1;
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
    
    // Proste sprawdzanie kontrastu bazujące na podstawowych kolorach
    const fgColor = editor.foregroundType === 'solid' ? editor.foregroundColor : (editor.foregroundGradient?.colorStops[0]?.color || '#000');
    const bgColor = editor.backgroundType === 'solid' ? editor.backgroundColor : (editor.backgroundGradient?.colorStops[0]?.color || '#fff');
    const minContrast = getContrast(bgColor, fgColor);
    
    let text = "Brak skanowalności";
    let color = "text-red-500";
    let percent = 0;
    
    if (minContrast >= 5.5) {
      percent = 75 + Math.min(1, (minContrast - 5.5) / (21 - 5.5)) * 25;
    } else if (minContrast >= 3.5) {
      percent = 50 + ((minContrast - 3.5) / (5.5 - 3.5)) * 25;
    } else if (minContrast >= 2.0) {
      percent = 25 + ((minContrast - 2.0) / (3.5 - 2.0)) * 25;
    } else {
      percent = Math.max(0, ((minContrast - 1.0) / (2.0 - 1.0))) * 25;
    }

    // --- KARY ZA LOGO I TEKST (obliczane na bieżąco podczas przesuwania i skalowania) ---
    let areaPenalty = 0;
    
    const checkOverlapWithMarkers = (px, py, width, height) => {
      px = Number(px); py = Number(py); width = Number(width); height = Number(height);
      const rect = { left: px - width/2, right: px + width/2, top: py - height/2, bottom: py + height/2 };
      let penalty = 0;
      
      const checkIntersect = (r1, r2) => !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);

      // Znaczniki pozycjonujące w rogach kodu QR (ok. 25% szerokości/wysokości)
      const markers = [
        { left: 0, right: 25, top: 0, bottom: 25 }, // Top-Left
        { left: 75, right: 100, top: 0, bottom: 25 }, // Top-Right
        { left: 0, right: 25, top: 75, bottom: 100 } // Bottom-Left
      ];

      markers.forEach(m => {
        if (checkIntersect(rect, m)) penalty += 30; // 30% kary za każdy zasłonięty znacznik
      });
      return penalty;
    };

    let totalArea = 0;

    if (editor.logoImage) {
      const realRatio = (editor.logoSize / 100) * 0.4;
      totalArea += realRatio * realRatio; 
      areaPenalty += checkOverlapWithMarkers(editor.logoPos.x, editor.logoPos.y, editor.logoSize * 0.4, editor.logoSize * 0.4);
    }
    
    if (editor.textValue && editor.textValue.trim() !== '') {
      const realRatioHeight = (editor.textSize / 100) * 0.3;
      // Szerokość to ok. 60% wysokości dla każdego znaku
      const realRatioWidth = Math.min(1.0, realRatioHeight * 0.6 * editor.textValue.length);
      totalArea += realRatioHeight * realRatioWidth;
      
      // Bardzo szeroki tekst przecina kod QR (przerywa wzorce synchronizacji i ścieżki danych)
      if (realRatioWidth > 0.35) {
        areaPenalty += (realRatioWidth - 0.35) * 200;
      }
      
      areaPenalty += checkOverlapWithMarkers(
        editor.textPos.x, 
        editor.textPos.y, 
        realRatioWidth * 100, 
        editor.textSize * 0.3
      );
    }
    
    // Jeśli połączony obszar tekstu i loga przekracza 8% kodu, naliczamy karę (narastająco)
    if (totalArea > 0.08) {
      areaPenalty += (totalArea - 0.08) * 300;
    }
    
    // Aplikujemy kary do procentu kontrastu
    percent = Math.max(0, percent - areaPenalty);

    if (percent >= 75) {
      text = "Wysoka skanowalność"; color = "text-[#10b981]"; 
    } else if (percent >= 50) {
      text = "Średnia skanowalność"; color = "text-yellow-500"; 
    } else if (percent >= 25) {
      text = "Niska skanowalność"; color = "text-orange-500"; 
    } else {
      text = "Brak skanowalności"; color = "text-red-500"; 
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
          onMouseDown={onClose}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
            className="bg-[#0a0a0b] border border-border rounded-2xl w-full max-w-[1400px] h-[85vh] flex flex-col overflow-hidden shadow-2xl relative" 
            onMouseDown={e => e.stopPropagation()}
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
        <div className="flex flex-1 overflow-hidden relative">
          {/* Left Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 xl:p-12 custom-scrollbar" style={{ overflowAnchor: 'none' }}>
            <div className="max-w-3xl mx-auto space-y-6 lg:space-y-8 pb-[30vh]">
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
                  className="flex-1 bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#009de2] transition-colors" 
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
                            [{ 'header': 1 }, { 'header': 2 }],
                            ['bold', 'italic', 'underline', 'strike'],
                            ['blockquote'],
                            [{ 'color': ['#FF4C00', '#009de2', '#8B5CF6', '', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff', '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff', '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff', '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2', '#444444'] }, 
                             { 'background': ['#FF4C00', '#009de2', '#8B5CF6', '', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff', '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff', '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff', '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2', '#444444'] }],
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
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#009de2] transition-colors"
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
                    <input type="text" value={vcardData.firstName} onChange={e => setVcardData({...vcardData, firstName: e.target.value})} placeholder="Imię" className="w-full bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#009de2]" />
                    <input type="text" value={vcardData.lastName} onChange={e => setVcardData({...vcardData, lastName: e.target.value})} placeholder="Nazwisko" className="w-full bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#009de2]" />
                    <div className="col-span-2">
                      <ValidatedInput type="tel" value={vcardData.phone} onChange={val => setVcardData({...vcardData, phone: val})} placeholder="Telefon" error={validationErrors.vcardPhone} />
                    </div>
                    <div className="col-span-2">
                      <ValidatedInput type="email" value={vcardData.email} onChange={val => setVcardData({...vcardData, email: val})} placeholder="E-mail" error={validationErrors.vcardEmail} />
                    </div>
                    <input type="text" value={vcardData.company} onChange={e => setVcardData({...vcardData, company: e.target.value})} placeholder="Firma" className="w-full bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#009de2]" />
                    <input type="text" value={vcardData.title} onChange={e => setVcardData({...vcardData, title: e.target.value})} placeholder="Stanowisko" className="w-full bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#009de2]" />
                    <div className="col-span-2">
                      <ValidatedInput type="url" value={vcardData.website} onChange={val => setVcardData({...vcardData, website: val})} placeholder="Strona WWW" error={validationErrors.vcardWebsite} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Nowy potężny edytor (Zaprojektuj kod QR) */}
            <DesignAccordion />
          </div>
        </div>

        {/* Right Preview */}
          <div className="absolute bottom-4 right-4 z-50 lg:z-auto flex flex-col gap-3 items-end pointer-events-none lg:pointer-events-auto lg:static lg:w-[450px] xl:w-[500px] lg:bg-sidebar lg:border-l lg:border-border lg:flex-col lg:items-center lg:justify-center lg:p-8 xl:p-12 lg:gap-0 lg:shadow-none">
             
             {/* QR Container */}
             <div className="w-[140px] sm:w-[160px] p-3 bg-card border border-border rounded-2xl shadow-2xl flex flex-col items-center justify-center pointer-events-auto lg:w-full lg:max-w-[360px] xl:max-w-[400px] lg:bg-transparent lg:border-0 lg:rounded-none lg:shadow-none lg:p-0">
                <div 
                 className="w-full aspect-square rounded-xl lg:rounded-[2rem] flex items-center justify-center relative shadow-sm lg:shadow-2xl overflow-hidden"
               >
                 {showPreview ? (
                   <QRLivePreview qrData={getQrDataToEncode()} />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-black/5">
                     <div className="w-10 h-10 border-4 border-[#009de2] border-t-transparent rounded-full animate-spin opacity-50"></div>
                   </div>
                 )}
               </div>
               
               <div className="mt-3 lg:mt-10 w-full">
                 <div className="flex justify-end mb-1.5 lg:mb-3">
                   <span className={`font-bold tracking-wide text-[9px] lg:text-xs ${scannability.color}`}>{scannability.text}</span>
                 </div>
                 <div className="relative w-full h-2 lg:h-3 rounded-full flex ring-1 ring-white/10 bg-gradient-to-r from-red-500 via-orange-500 to-[#10b981]">
                   <div className="flex-1 border-r border-white/40"></div>
                   <div className="flex-1 border-r border-white/40"></div>
                   <div className="flex-1 border-r border-white/40"></div>
                   <div className="flex-1"></div>
                   <div className="absolute top-1/2 -translate-y-1/2 w-1 lg:w-1.5 h-3 lg:h-4 bg-white shadow rounded z-10 transition-all duration-500" style={{ left: `calc(${scannability.percent}% - 2px)` }}></div>
                 </div>
               </div>
             </div>
             
             <div className="w-[140px] sm:w-[160px] flex justify-end pointer-events-auto lg:w-full lg:absolute lg:bottom-6 lg:right-6">
               <button 
                 onClick={handleSave} 
                 disabled={isSaving || !isFormValid}
                 className={`w-full lg:w-auto px-4 lg:px-6 py-2.5 lg:py-2 text-sm rounded-xl lg:rounded-lg font-semibold transition-colors text-white shadow-xl lg:shadow-none ${isSaving || !isFormValid ? 'bg-gray-500 cursor-not-allowed opacity-50' : 'bg-[#009de2] hover:bg-[#008bc9]'}`}
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

export default function QRModal(props) {
  return (
    <QREditorProvider>
      <QRModalInner {...props} />
    </QREditorProvider>
  );
}

function Tab({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} className={`relative flex flex-col items-center gap-2 cursor-pointer pb-2 whitespace-nowrap min-w-[100px] transition-colors ${active ? 'text-[#009de2]' : 'text-gray-400 hover:text-white'}`}>
      {icon}
      <span className="text-xs font-semibold">{label}</span>
      {active && (
        <motion.div
          layoutId="qr-modal-active-tab"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#009de2]"
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
    <div onClick={onClick} className={`flex-1 p-2 sm:p-2.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-center gap-2 ${active ? 'border-[#009de2] bg-[#009de2]/10 text-white' : 'border-border bg-card text-gray-400 hover:border-gray-500 hover:text-gray-200'}`}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/20 shrink-0">
         <StyleIcon type={type} />
      </div>
      <span className="hidden sm:inline-block text-sm font-semibold">{title}</span>
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
            error ? 'border-red-500 focus:border-red-500 text-red-500' : 'border-border focus:border-[#009de2] text-white'
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
