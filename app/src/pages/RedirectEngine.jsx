import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

export default function RedirectEngine() {
  const { shortId } = useParams();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Analizowanie linku...');
  const hasProcessed = React.useRef(false);

  useEffect(() => {
    async function processRedirect() {
      if (!shortId || hasProcessed.current) return;
      hasProcessed.current = true;

      try {
        // 1. Szukamy w kodach QR
        let targetDocRef = doc(db, 'qrcodes', shortId);
        let targetDocSnap = await getDoc(targetDocRef);
        let targetData = null;
        let isQrCode = true;

        if (targetDocSnap.exists()) {
          targetData = targetDocSnap.data();
        } else {
          // 2. Jeśli nie kod QR, szukamy w Smart Linkach
          targetDocRef = doc(db, 'smartlinks', shortId);
          targetDocSnap = await getDoc(targetDocRef);
          if (targetDocSnap.exists()) {
            targetData = targetDocSnap.data();
            isQrCode = false;
          }
        }

        if (!targetData) {
          setError('Nie znaleziono takiego kodu w systemie.');
          return;
        }

        // 3. Sprawdzamy czy nie jest zarchiwizowany
        if (targetData.archived) {
          setError('Ten link został zarchiwizowany i jest nieaktywny.');
          return;
        }

        // 4. Podbicie statystyk kliknięć (Analytics Increment)
        const incrementField = isQrCode ? 'scans' : 'clicks';
        setStatus('Przygotowywanie przekierowania...');
        await updateDoc(targetDocRef, {
          [incrementField]: increment(1),
          lastClickedAt: new Date()
        });

        // 5. Przekierowanie
        let finalUrl = targetData.url || targetData.targetUrl; // w zalezności od nazwy pola w kolekcji

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

        if (finalUrl) {
          window.location.href = finalUrl;
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

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-4 text-white font-sans">
      {!error ? (
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
