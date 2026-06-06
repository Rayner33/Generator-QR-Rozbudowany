import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Logo from '../components/Logo';

export default function Login() {
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      setError('Nieprawidłowy e-mail lub hasło.');
    }
    setLoading(false);
  }

  async function handleResetPassword() {
    if (!email) {
      setError('Wpisz adres e-mail, aby zresetować hasło.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Link do zresetowania hasła został wysłany na Twój e-mail.');
      setError('');
    } catch (err) {
      console.error(err);
      setError('Wystąpił błąd podczas resetowania hasła.');
    }
  }

  async function handleRequestAccess(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await addDoc(collection(db, "access_requests"), {
        name,
        email,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      setMessage('Twoja prośba o dostęp została wysłana do administratora.');
      setIsRequestingAccess(false);
    } catch (err) {
      console.error(err);
      setError('Błąd podczas wysyłania prośby.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 text-white font-sans">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo className="w-24 text-[#FF4C00]" />
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-2">
            {isRequestingAccess ? 'Poproś o dostęp' : 'Zaloguj się'}
          </h2>
          <p className="text-gray-400 text-center mb-8 text-sm">
            {isRequestingAccess 
              ? 'Wypełnij poniższy formularz. Twój wniosek trafi do administratora.' 
              : 'Wpisz swoje dane, aby wejść do panelu PARYS QR.'}
          </p>

          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-4 text-center">{error}</div>}
          {message && <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-sm p-3 rounded-lg mb-4 text-center">{message}</div>}

          {!isRequestingAccess ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Adres e-mail</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FF4C00] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Hasło</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FF4C00] transition-colors"
                />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={handleResetPassword} className="text-sm text-gray-400 hover:text-white transition-colors">Zapomniałeś hasła?</button>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#FF4C00] hover:bg-[#CC3D00] text-white font-semibold rounded-lg px-4 py-3 transition-colors disabled:opacity-50 mt-4"
              >
                {loading ? 'Logowanie...' : 'Zaloguj się'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRequestAccess} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Imię i nazwisko</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FF4C00] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Adres e-mail</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FF4C00] transition-colors"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#FF4C00] hover:bg-[#CC3D00] text-white font-semibold rounded-lg px-4 py-3 transition-colors disabled:opacity-50 mt-4"
              >
                {loading ? 'Wysyłanie...' : 'Wyślij prośbę'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center border-t border-border pt-6">
            <span className="text-gray-400 text-sm">
              {isRequestingAccess ? 'Masz już konto?' : 'Nie masz dostępu?'}
            </span>
            <button 
              type="button"
              onClick={() => { setIsRequestingAccess(!isRequestingAccess); setError(''); setMessage(''); }}
              className="ml-2 text-[#FF4C00] hover:text-white font-semibold text-sm transition-colors focus:outline-none"
            >
              {isRequestingAccess ? 'Zaloguj się' : 'Poproś o dostęp'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
