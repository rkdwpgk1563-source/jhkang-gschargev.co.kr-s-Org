
import React from 'react';
import { User } from '../types';

interface SidebarProps {
  activeTab: 'dashboard' | 'clients' | 'catalog' | 'users';
  setActiveTab: (tab: 'dashboard' | 'clients' | 'catalog' | 'users') => void;
  isAdmin: boolean;
  currentUser: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isAdmin, currentUser, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    )},
    { id: 'clients', label: '선물 취합 목록', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
    )},
    ...(isAdmin ? [
      { id: 'catalog', label: '선물 품목 관리', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
      )},
      { id: 'users', label: '직원 계정 관리', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      )}
    ] : []),
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm relative z-20">
      <div className="p-8">
        <div className="flex flex-col gap-0.5 mb-12">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 bg-[#005BAC] rounded-lg flex items-center justify-center text-white font-black text-xs italic">GS</span>
            <span className="text-xl font-black tracking-tighter text-slate-800">CHARGE-EV</span>
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#005BAC] uppercase">Gift Management</span>
        </div>
        
        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-[#005BAC] text-white shadow-lg shadow-blue-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className={activeTab === item.id ? 'text-white' : 'text-slate-300'}>{item.icon}</div>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 bg-slate-50/50 border-t border-slate-50">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#005BAC] flex items-center justify-center text-white font-black text-lg shadow-sm">
              {currentUser.name[0]}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black text-slate-800 truncate">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 font-bold truncate">{currentUser.email}</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onLogout();
            }}
            className="w-full py-3.5 text-[11px] font-black text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 group"
          >
            <svg className="w-4 h-4 transition-colors group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
