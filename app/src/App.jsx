import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import Sidebar from './components/Sidebar';
import QRList from './pages/QRList';
import QRModal from './components/QRModal';
import Analytics from './pages/Analytics';
import Account from './pages/Account';
import Login from './pages/Login';
import WorkspaceSettings from './pages/WorkspaceSettings';
import WorkspaceModal from './components/WorkspaceModal';
import NotificationsModal from './components/NotificationsModal';
import { useAuth } from './context/AuthContext';
import { useWorkspaces } from './hooks/useWorkspaces';

function App() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const activePath = location.pathname;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCode, setSelectedCode] = useState(null);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
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

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-background text-white font-sans overflow-hidden">
      <Sidebar 
        activePath={activePath} 
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
        pendingInvites={pendingInvites}
        onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        <div className="p-8 max-w-6xl mx-auto w-full">
          <Routes>
            <Route path="/" element={
              <>
                <h1 className="text-3xl font-semibold mb-8 flex justify-between items-center">
                  Kody QR
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
                      onEdit={(code) => openModal('edit', code)} 
                      onDuplicate={(code) => openModal('duplicate', code)} 
                    />
                  )}
                </div>
              </>
            } />
            <Route path="/analytics" element={<Analytics activeWorkspace={activeWorkspace} />} />
            <Route path="/account" element={<Account currentUser={currentUser} workspaces={workspaces} />} />
            <Route path="/settings" element={<WorkspaceSettings activeWorkspace={activeWorkspace} currentUser={currentUser} workspaces={workspaces} />} />
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
