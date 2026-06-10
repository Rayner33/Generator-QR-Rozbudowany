import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { QrCode } from 'lucide-react';

// Dozwolone domeny firmowe
const ALLOWED_DOMAINS = ['parys.pl'];

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleGoogleLogin() {
    setError('');
    setLoading(true);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Weryfikacja domeny firmowej (White List)
      const userDomain = user.email.split('@')[1]?.toLowerCase();
      
      if (!ALLOWED_DOMAINS.includes(userDomain)) {
        await signOut(auth);
        setError('Brak dostępu. Twój adres e-mail nie znajduje się na liście dozwolonych domen służbowych.');
        return;
      }
      
      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Wystąpił błąd podczas logowania przez Google.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 text-white font-sans">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-10 gap-3">
          <QrCode size={96} className="text-[#FF4C00]" />
          <h1 className="text-3xl font-black tracking-widest uppercase">QR PARYS</h1>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold mb-3">
            Witaj w systemie
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Dostęp do platformy zarządzania odnośnikami możliwy jest wyłącznie za pośrednictwem autoryzowanego, firmowego konta Google.
          </p>

          {error && (
            <div className="w-full bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-medium p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full relative flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl px-4 py-3.5 transition-all disabled:opacity-50 hover:scale-[1.02] shadow-lg"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {loading ? 'Uwierzytelnianie...' : 'Zaloguj się z Google'}
          </button>
          
          <div className="mt-8 pt-6 border-t border-border/50 w-full text-xs text-gray-500 font-medium">
            System zabezpieczony. Logowanie tylko dla zweryfikowanych pracowników.
          </div>
        </div>
      </div>
    </div>
  );
}
