import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import QRList from './pages/QRList';
import QRModal from './components/QRModal';
import SmartLinksList from './pages/SmartLinksList';
import SmartLinkModal from './components/SmartLinkModal';
import Analytics from './pages/Analytics';
import Account from './pages/Account';
import Login from './pages/Login';
import WorkspaceSettings from './pages/WorkspaceSettings';
import WorkspaceModal from './components/WorkspaceModal';
import NotificationsModal from './components/NotificationsModal';
import RedirectEngine from './pages/RedirectEngine';
import { useAuth } from './context/AuthContext';
import { useWorkspaces } from './hooks/useWorkspaces';

function App() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCode, setSelectedCode] = useState(null);
  
  const [isSmartLinkModalOpen, setIsSmartLinkModalOpen] = useState(false);
  const [smartLinkModalMode, setSmartLinkModalMode] = useState('create');
  const [selectedSmartLink, setSelectedSmartLink] = useState(null);

  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { workspaces, activeWorkspace, setActiveWorkspace, pendingInvites } = useWorkspaces(currentUser);

  useEffect(() => {
    if (currentUser) {
      setDoc(doc(db, "users", currentUser.uid), {
        email: currentUser.email,
        name: currentUser.displayName || currentUser.email.split('@')[0],
        uid: currentUser.uid
      }, { merge: true }).catch(console.error);
    }
  }, [currentUser]);

  const openModal = (mode = 'create', code = null) => {
    setModalMode(mode);
    setSelectedCode(code);
    setIsModalOpen(true);
  };

  const openSmartLinkModal = (mode = 'create', link = null) => {
    setSmartLinkModalMode(mode);
    setSelectedSmartLink(link);
    setIsSmartLinkModalOpen(true);
  };

  // --- PUBLICZNY ROUTING (PRZEKIEROWANIA) ---
  // Rozpoznajemy, czy jesteśmy na krótkim linku np. domena.pl/XyZ12
  // Zabezpieczamy znane ścieżki aplikacji by nie zostały wzięte za skróty
  const isPublicRedirect = /^\/[a-zA-Z0-9_-]+$/.test(activePath) && !['/links', '/analytics', '/account', '/settings', '/login'].includes(activePath);

  if (isPublicRedirect) {
    return (
      <Routes>
        <Route path="/:shortId" element={<RedirectEngine />} />
      </Routes>
    );
  }
  // ------------------------------------------

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-background text-white font-sans overflow-hidden">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar 
        activePath={activePath} 
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
        pendingInvites={pendingInvites}
        onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
          <Routes>
            <Route path="/" element={
              <>
                <h1 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden flex items-center justify-center p-2 bg-card border border-border rounded-xl text-white hover:bg-white/5 transition-colors">
                      <Menu size={24} />
                    </button>
                    <span>Kody QR</span>
                  </div>
                  <button 
                    onClick={() => openModal('create')}
                    disabled={!activeWorkspace}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Utwórz kod QR
                  </button>
                </h1>
                
                <div className="space-y-4 mt-8">
                  {activeWorkspace && (
                      <QRList 
                        activeWorkspace={activeWorkspace} 
                        workspaces={workspaces}
                        onEdit={(code) => openModal('edit', code)} 
                        onDuplicate={(code) => openModal('duplicate', code)} 
                        onAnalytics={(code) => navigate(`/analytics?codeId=${code.id}&type=qr`)}
                      />
                  )}
                </div>
              </>
            } />
            <Route path="/links" element={
              <>
                <h1 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden flex items-center justify-center p-2 bg-card border border-border rounded-xl text-white hover:bg-white/5 transition-colors">
                      <Menu size={24} />
                    </button>
                    <span>Smart Linki</span>
                  </div>
                  <button 
                    onClick={() => openSmartLinkModal('create')}
                    disabled={!activeWorkspace}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Utwórz smart link
                  </button>
                </h1>
                
                <div className="space-y-4 mt-8">
                  {activeWorkspace && (
                      <SmartLinksList 
                        activeWorkspace={activeWorkspace} 
                        workspaces={workspaces}
                        onEdit={(link) => openSmartLinkModal('edit', link)} 
                        onDuplicate={(link) => openSmartLinkModal('duplicate', link)} 
                        onAnalytics={(link) => navigate(`/analytics?codeId=${link.id}&type=smartlink`)}
                      />
                  )}
                </div>
              </>
            } />
            <Route path="/analytics" element={<Analytics activeWorkspace={activeWorkspace} onMenuClick={() => setIsMobileMenuOpen(true)} />} />
            <Route path="/account" element={<Account currentUser={currentUser} workspaces={workspaces} onMenuClick={() => setIsMobileMenuOpen(true)} />} />
            <Route path="/settings" element={<WorkspaceSettings activeWorkspace={activeWorkspace} currentUser={currentUser} workspaces={workspaces} onMenuClick={() => setIsMobileMenuOpen(true)} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {activeWorkspace && (
        <QRModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          activeWorkspace={activeWorkspace}
          mode={modalMode}
          initialData={selectedCode}
        />
      )}

      {activeWorkspace && (
        <SmartLinkModal 
          isOpen={isSmartLinkModalOpen} 
          onClose={() => setIsSmartLinkModalOpen(false)} 
          activeWorkspace={activeWorkspace}
          mode={smartLinkModalMode}
          initialData={selectedSmartLink}
        />
      )}

      <WorkspaceModal 
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        currentUser={currentUser}
        setActiveWorkspace={setActiveWorkspace}
      />

      <NotificationsModal 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        pendingInvites={pendingInvites}
        currentUser={currentUser}
        setActiveWorkspace={setActiveWorkspace}
      />
    </div>
  );
}

export default App;
