import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Link as LinkIcon, PieChart, Check, ChevronDown, Plus, User, Settings, Bell } from 'lucide-react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { dropdownAnimation } from '../utils/animations';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import pkg from '../../package.json';

export default function Sidebar({ activePath, workspaces, activeWorkspace, setActiveWorkspace, onOpenWorkspaceModal, pendingInvites, onOpenNotifications }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredWs, setHoveredWs] = useState(null);
  const dropdownRef = useRef(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const sortedWorkspaces = [...workspaces].sort((a, b) => {
    const isAPersonal = a.type === 'personal' || a.name === 'Personal';
    const isBPersonal = b.type === 'personal' || b.name === 'Personal';
    if (isAPersonal && !isBPersonal) return -1;
    if (!isAPersonal && isBPersonal) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <aside className="w-64 bg-sidebar border-r border-border flex flex-col relative z-20">
      {/* Top Header Row */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <QrCode size={36} className="text-white" />
        <button 
          onClick={() => navigate('/account')}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-card border border-border hover:border-gray-500 transition-colors text-gray-300 hover:text-white shadow-sm" 
          title="Moje konto"
        >
          <User size={16} />
        </button>
      </div>
      
      {/* Workspace Selector */}
      <div className="px-4 mb-4">
        <div ref={dropdownRef} className="relative mb-8 z-30">
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-card border border-border rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-gray-500 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm"
                style={{ background: activeWorkspace?.avatarStyle || 'linear-gradient(to top right, #FF4C00, #9333ea)', borderRadius: '30%' }}
              >
                {activeWorkspace ? activeWorkspace.name.charAt(0).toUpperCase() : 'P'}
              </div>
              <div>
                <p className="text-sm font-semibold text-white truncate w-24">
                  {activeWorkspace ? activeWorkspace.name : 'Ładowanie...'}
                </p>
                <p className="text-xs text-gray-400">
                  {activeWorkspace?.type === 'personal' || activeWorkspace?.name === 'Personal' ? 'Osobisty workspace' : 'Zespołowy workspace'}
                </p>
              </div>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                key="workspace-dropdown"
                {...dropdownAnimation}
                onMouseLeave={() => setHoveredWs(null)}
                className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0b] border border-border rounded-xl shadow-xl overflow-hidden p-2 z-50 flex flex-col gap-1 origin-top"
              >
              {sortedWorkspaces.map(ws => (
                <div 
                  key={ws.id} 
                  onClick={() => { setActiveWorkspace(ws); setIsDropdownOpen(false); }}
                  onMouseEnter={() => setHoveredWs(ws.id)}
                  className="relative p-2 flex items-center justify-between cursor-pointer transition-colors group rounded-lg"
                >
                  {hoveredWs === ws.id && (
                    <motion.div 
                      layoutId="ws-hover"
                      className="absolute inset-0 bg-white/5 rounded-lg -z-10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                    />
                  )}
                  <div className="flex items-center gap-3 relative z-10 pointer-events-none">
                    <div 
                      className="w-10 h-10 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm"
                      style={{ background: ws.avatarStyle || 'linear-gradient(to top right, #FF4C00, #9333ea)', borderRadius: '30%' }}
                    >
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${activeWorkspace?.id === ws.id ? 'text-[#f97316]' : 'text-white'}`}>
                        {ws.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {ws.type === 'personal' || ws.name === 'Personal' ? 'Osobisty workspace' : 'Workspace zespołu'}
                      </p>
                    </div>
                  </div>
                  {activeWorkspace?.id === ws.id && (
                     <Check size={18} className="text-[#f97316] shrink-0 ml-2" />
                  )}
                </div>
              ))}
              
              <div className="mt-1 pt-1 border-t border-border/50">
                <div 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenWorkspaceModal();
                  }}
                  onMouseEnter={() => setHoveredWs('create')}
                  className="relative p-2 flex items-center gap-3 cursor-pointer transition-colors rounded-lg group"
                >
                  {hoveredWs === 'create' && (
                    <motion.div 
                      layoutId="ws-hover"
                      className="absolute inset-0 bg-white/5 rounded-lg -z-10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                    />
                  )}
                  <div 
                    className="w-10 h-10 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-400 shrink-0 group-hover:border-gray-400 group-hover:text-white transition-colors relative z-10 pointer-events-none"
                    style={{ borderRadius: '30%' }}
                  >
                    <Plus size={20} />
                  </div>
                  <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">Utwórz zespół</span>
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>

      {pendingInvites && pendingInvites.length > 0 && (
        <div className="px-4 mb-4">
          <button onClick={onOpenNotifications} className="w-full bg-white text-black font-bold rounded-xl py-2.5 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
            <Bell size={18} /> Powiadomienia
          </button>
        </div>
      )}

      <nav onMouseLeave={() => setHoveredNav(null)} className="flex-1 flex flex-col gap-2 mt-4">
        <NavItem 
          icon={<QrCode size={20} />} 
          label="Kody QR" 
          active={activePath === '/'} 
          onClick={() => navigate('/')}
          onMouseEnter={() => setHoveredNav('/')}
          hoveredNav={hoveredNav}
        />
        <NavItem 
          icon={<LinkIcon size={20} />} 
          label="Smart Linki" 
          active={activePath === '/links'} 
          onClick={() => navigate('/links')}
          onMouseEnter={() => setHoveredNav('/links')}
          hoveredNav={hoveredNav}
        />
        <div className="my-2 border-t border-border/50 mx-4"></div>
        <NavItem 
          icon={<PieChart size={20} />} 
          label="Analityka" 
          active={activePath === '/analytics'} 
          onClick={() => navigate('/analytics')}
          onMouseEnter={() => setHoveredNav('/analytics')}
          hoveredNav={hoveredNav}
        />
        {activeWorkspace?.type !== 'personal' && activeWorkspace?.name !== 'Personal' && (
          <NavItem 
            icon={<Settings size={20} />} 
            label="Ustawienia" 
            active={activePath === '/settings'} 
            onClick={() => navigate('/settings')}
            onMouseEnter={() => setHoveredNav('/settings')}
            hoveredNav={hoveredNav}
          />
        )}
      </nav>

      <div className="pb-4 pt-2 text-center">
        <span className="text-[10px] text-gray-600 font-semibold tracking-widest">v{pkg.version}</span>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, onClick, onMouseEnter, hoveredNav }) {
  const path = activePathFor(label); // Helper
  
  return (
    <div 
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`relative flex items-center gap-3 px-4 py-3 mx-4 rounded-lg cursor-pointer transition-colors ${
        active 
          ? 'text-white font-semibold' 
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {active && (
        <motion.div 
          layoutId="nav-active"
          className="absolute inset-0 bg-card border border-border shadow-sm rounded-lg -z-20"
          initial={false}
          transition={{ type: "spring", bounce: 0, duration: 0.2 }}
        />
      )}
      {hoveredNav === path && !active && (
        <motion.div 
          layoutId="nav-hover"
          className="absolute inset-0 bg-card/50 rounded-lg -z-10"
          initial={false}
          transition={{ type: "spring", bounce: 0, duration: 0.2 }}
        />
      )}
      <div className="flex items-center gap-3 relative z-10 pointer-events-none w-full">
        {icon}
        <span className="text-sm capitalize">{label}</span>
      </div>
    </div>
  );
}

function activePathFor(label) {
  if (label === 'Kody QR') return '/';
  if (label === 'Smart Linki') return '/links';
  if (label === 'Analityka') return '/analytics';
  if (label === 'Ustawienia') return '/settings';
  return label;
}
