import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAnalyticsData } from '../utils/tracking';
import QRCodeStyling from 'qr-code-styling';
import { QrCode as QrCodeIcon } from 'lucide-react';
export default function RedirectEngine() {
  const { shortId } = useParams();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Analizowanie linku...');
  const [deactivatedData, setDeactivatedData] = useState(null);
  const [textContent, setTextContent] = useState(null);
  const qrRef = React.useRef(null);
  const qrCodeInstance = React.useRef(null);
  const hasProcessed = React.useRef(false);

  useEffect(() => {
    // Rozpoczynamy pobieranie analityki (IP, Geo, UA) asynchronicznie od razu!
    const analyticsPromise = getAnalyticsData().catch(() => ({}));

    async function processRedirect() {
      if (!shortId || hasProcessed.current) return;
      hasProcessed.current = true;

      try {
        // 1. Równoległe pobieranie z obu kolekcji dla maksymalnej szybkości
        const [qrSnap, smartSnap] = await Promise.all([
          getDoc(doc(db, 'qrcodes', shortId)).catch(() => null),
          getDoc(doc(db, 'smartlinks', shortId)).catch(() => null)
        ]);

        let targetData = null;
        let isQrCode = true;
        let targetDocRef = null;

        if (qrSnap && qrSnap.exists()) {
          targetData = qrSnap.data();
          targetDocRef = doc(db, 'qrcodes', shortId);
        } else if (smartSnap && smartSnap.exists()) {
          targetData = smartSnap.data();
          isQrCode = false;
          targetDocRef = doc(db, 'smartlinks', shortId);
        }

        if (!targetData) {
          setError('Nie znaleziono takiego kodu w systemie.');
          return;
        }

        // 2. Sprawdzamy czy nie jest zarchiwizowany (sam kod lub cały jego zespół)
        let isArchived = targetData.archived;
        
        if (!isArchived && targetData.workspaceId) {
          try {
            const wsSnap = await getDoc(doc(db, 'workspaces', targetData.workspaceId));
            if (wsSnap.exists() && wsSnap.data().archived) {
              isArchived = true;
            }
          } catch (e) {
            console.error('Błąd weryfikacji zespołu:', e);
          }
        }

        if (isArchived) {
          setDeactivatedData({ ...targetData, isQrCode });
          return;
        }

        // 3. Budowanie końcowego URL (nie czeka na analitykę!)
        let finalUrl = targetData.url || targetData.targetUrl; 

        // Funkcja pomocnicza do zapisu analityki używana przez wszystkie typy
        const logAnalytics = async () => {
          const incrementField = isQrCode ? 'scans' : 'clicks';
          try {
            const analyticsData = await analyticsPromise;
            await Promise.allSettled([
              updateDoc(targetDocRef, {
                [incrementField]: increment(1),
                lastClickedAt: new Date()
              }),
              addDoc(collection(db, 'analytics'), {
                codeId: shortId,
                workspaceId: targetData.workspaceId,
                type: isQrCode ? 'qr' : 'smartlink',
                utm: targetData.utm || null,
                ...(analyticsData || {})
              })
            ]);
          } catch (e) {
            console.error(e);
          }
        };

        if (targetData.contentType === 'text') {
          // Fire and forget analytics, render text content immediately
          logAnalytics();
          setTextContent(targetData.textData || '<p>Brak treści</p>');
          setStatus('');
          return;
        }

        if (targetData.contentType === 'vcard') {
          finalUrl = `data:text/vcard;charset=utf-8,${encodeURIComponent(finalUrl)}`;
          setStatus('Pobieranie wizytówki...');
        } else if (targetData.contentType === 'email' || (finalUrl && finalUrl.startsWith('mailto:'))) {
          setStatus('Otwieranie poczty...');
        } else if (targetData.contentType === 'phone' || (finalUrl && finalUrl.startsWith('tel:'))) {
          setStatus('Otwieranie telefonu...');
        } else if (targetData.contentType === 'wifi') {
          finalUrl = null;
        } else if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
          finalUrl = 'https://' + finalUrl;
        }
        
        // Appending UTM Parameters
        if (finalUrl && targetData.utm && (finalUrl.startsWith('http://') || finalUrl.startsWith('https://'))) {
          try {
            const urlObj = new URL(finalUrl);
            if (targetData.utm.source) urlObj.searchParams.set('utm_source', targetData.utm.source);
            if (targetData.utm.medium) urlObj.searchParams.set('utm_medium', targetData.utm.medium);
            if (targetData.utm.campaign) urlObj.searchParams.set('utm_campaign', targetData.utm.campaign);
            if (targetData.utm.content) urlObj.searchParams.set('utm_content', targetData.utm.content);
            finalUrl = urlObj.toString();
          } catch (e) {
            console.error('Błąd dodawania parametrów UTM', e);
          }
        }

        // 4. Błyskawiczne zapisywanie analityki i przekierowanie
        if (finalUrl) {
          setStatus('Przekierowywanie...');
          
          // Dajemy Firebase maksymalnie 400ms na wysłanie pakietu logów w tle.
          await Promise.race([logAnalytics(), new Promise(resolve => setTimeout(resolve, 400))]);
          
          window.location.replace(finalUrl);
        } else if (targetData.contentType === 'wifi') {
          setError('To jest kod WiFi. Proszę zeskanować go natywnym aparatem w telefonie, a nie przeglądarką.');
        } else {
          setError('Brak zdefiniowanego adresu docelowego.');
        }

      } catch (err) {
        console.error("Redirect Error: ", err);
        setError('Wystąpił nieoczekiwany błąd serwera. Spróbuj ponownie.');
      }
    }

    processRedirect();
  }, [shortId]);

  useEffect(() => {
    if (deactivatedData && qrRef.current) {
      const dotsColor = deactivatedData.dotsColor || "#000000";
      const eyeColor = deactivatedData.eyeColor || dotsColor;
      const backgroundColor = deactivatedData.backgroundColor || "#ffffff";
      
      let qrData = `${window.location.origin}/${shortId}`;
      if (deactivatedData.contentType === 'wifi') {
        const { ssid, password, type } = deactivatedData.wifiData || {};
        const auth = type === 'nopass' ? '' : `T:${type};`;
        qrData = `WIFI:S:${ssid};${auth}P:${password};;`;
      }

      const options = {
        width: 1000,
        height: 1000,
        type: 'svg',
        data: qrData,
        image: deactivatedData.logoBase64 || undefined,
        margin: 0,
        qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: "Q" },
        imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 5, crossOrigin: "anonymous" },
        dotsOptions: { color: dotsColor, type: deactivatedData.styleType || "rounded" },
        backgroundOptions: { color: backgroundColor },
        cornersSquareOptions: { color: eyeColor, type: deactivatedData.styleType === 'dots' ? 'dot' : (deactivatedData.styleType === 'square' ? 'square' : 'extra-rounded') },
        cornersDotOptions: { color: eyeColor, type: deactivatedData.styleType === 'square' ? 'square' : 'dot' }
      };

      if (!qrCodeInstance.current) {
        qrCodeInstance.current = new QRCodeStyling(options);
        qrCodeInstance.current.append(qrRef.current);
      } else {
        qrCodeInstance.current.update(options);
      }
    }
  }, [deactivatedData]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-4 text-white font-sans">
      {deactivatedData ? (
        <div className="flex flex-col items-center max-w-md w-full animate-fade-in-up">
          <div className="flex items-center gap-3 mb-16">
            <QrCodeIcon size={32} className="text-white" />
            <h1 className="text-2xl font-bold tracking-wide">QR PARYS</h1>
          </div>

          <div className="relative mb-12">
            <div 
              className="p-[6.5%] rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.1)] relative"
              style={{ backgroundColor: deactivatedData.backgroundColor || '#ffffff' }}
            >
              <div ref={qrRef} className="w-[200px] h-[200px] flex items-center justify-center [&>*]:w-full [&>*]:h-full" />
              
              <div className="absolute top-0 right-0 -mr-6 -mt-4 transform rotate-12 z-10">
                <div className="bg-[#ff3b30] text-white text-sm font-bold uppercase tracking-wider py-1.5 px-4 rounded-lg shadow-xl border border-red-500/50">
                  Dezaktywowany
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-[1.35rem] font-semibold text-center mb-4 leading-snug">
            Ten kod QR został z jakiegoś<br />powodu dezaktywowany.
          </h2>
        </div>
      ) : textContent !== null ? (
        <div className="bg-[#18181b] border border-border p-6 md:p-8 rounded-2xl max-w-2xl w-full text-white shadow-2xl animate-fade-in-up">
          <div 
            className="prose prose-invert prose-p:leading-relaxed prose-a:text-[#1ea2e4] max-w-none break-words" 
            dangerouslySetInnerHTML={{ __html: textContent }} 
          />
        </div>
      ) : !error ? (
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 border-4 border-[#FF4C00]/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#FF4C00] rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-300 font-medium tracking-wide animate-pulse">
            {status}
          </p>
        </div>
      ) : (
        <div className="bg-[#18181b] border border-red-500/30 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Błąd przekierowania</h2>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
