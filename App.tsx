
import React, { useState, useEffect, useCallback } from 'react';
import { Client, DashboardStats, GiftCatalogItem, User } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import ClientModal from './components/ClientModal';
import GiftCatalogManager from './components/GiftCatalogManager';
import UserManager from './components/UserManager';
import Login from './components/Login';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'catalog' | 'users'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [catalog, setCatalog] = useState<GiftCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('users').select('email, name, is_admin');
      if (error) throw error;
      if (data) {
        return data.map((u: any) => ({
          email: String(u.email || '').trim().toLowerCase(),
          name: String(u.name || '').trim(),
          isAdmin: u.is_admin === true || u.is_admin === 'TRUE' || u.is_admin === 'true'
        }));
      }
    } catch (e: any) {
      console.error("유저 목록 로드 실패:", e.message);
    }
    return [];
  }, []);

  const fetchMainData = useCallback(async () => {
    try {
      const [
        { data: clientsData, error: clientsError },
        { data: catalogData, error: catalogError }
      ] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('catalog').select('*')
      ]);

      if (clientsError) throw clientsError;
      if (catalogError) throw catalogError;

      if (clientsData) {
        setClients(clientsData.map((c: any) => ({
          id: c.id,
          name: c.name,
          company: c.company,
          position: c.position,
          phone: c.phone,
          postcode: c.postcode,
          address: c.address,
          addressDetail: c.address_detail,
          category: c.category,
          registeredBy: c.registered_by,
          registeredEmail: c.registered_email,
          giftHistory: c.gift_history || []
        })));
      }
      
      if (catalogData) {
        setCatalog(catalogData.map((item: any) => ({
          id: item.id,
          name: item.name,
          unitPrice: item.unit_price,
          targetCategory: item.target_category
        })));
      }
    } catch (e: any) {
      console.error("데이터 로드 실패:", e.message);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const initApp = async () => {
      // 7초 후에 강제로 로딩을 해제하는 안전장치
      const timeoutId = setTimeout(() => {
        if (isMounted && isLoading) {
          console.warn("로딩 타임아웃 발생 - 강제 진입");
          setIsLoading(false);
        }
      }, 7000);

      try {
        setIsLoading(true);
        const userList = await fetchUsers();
        if (isMounted) setUsers(userList);

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (session?.user?.email && isMounted) {
          const foundUser = userList.find(u => u.email === session.user.email?.toLowerCase());
          if (foundUser) {
            setCurrentUser(foundUser);
            await fetchMainData();
          }
        }
      } catch (e: any) {
        console.error("초기화 에러:", e.message);
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) setIsLoading(false);
      }
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        const userList = await fetchUsers();
        const foundUser = userList.find(u => u.email === session.user.email?.toLowerCase());
        if (foundUser && isMounted) {
          setCurrentUser(foundUser);
          await fetchMainData();
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) setCurrentUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUsers, fetchMainData]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    fetchMainData();
  };

  const handleLogout = useCallback(async () => {
    if (!window.confirm('로그아웃 하시겠습니까?')) return;
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
      setActiveTab('dashboard');
      localStorage.clear();
      window.location.reload(); // 세션 완전 초기화를 위해 새로고침
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-['Pretendard']">
        <div className="w-12 h-12 border-4 border-[#005BAC] border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-slate-400 text-sm font-black tracking-widest animate-pulse uppercase">GS CHARGE-EV SECURITY CONNECTING...</p>
        <p className="mt-4 text-[10px] text-slate-300 font-bold uppercase">잠시만 기다려 주세요</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} allowedUsers={users} />;
  }

  const visibleClients = currentUser.isAdmin ? clients : clients.filter(c => c.registeredEmail === currentUser.email);

  const stats: DashboardStats = {
    totalClients: visibleClients.length,
    totalGifts: visibleClients.reduce((acc, c) => acc + (c.giftHistory?.length || 0), 0),
    totalBudget: visibleClients.reduce((acc, c) => acc + (c.giftHistory?.reduce((sum, h) => sum + h.price, 0) || 0), 0),
    userStats: clients.reduce((acc: any, c) => {
      acc[c.registeredBy] = (acc[c.registeredBy] || 0) + 1;
      return acc;
    }, {})
  };

  const handleSaveClient = async (clientData: Client) => {
    setIsLoading(true);
    try {
      if (editingClient) {
        const { error } = await supabase.from('clients').update({
          name: clientData.name,
          company: clientData.company,
          position: clientData.position,
          phone: clientData.phone,
          postcode: clientData.postcode,
          address: clientData.address,
          address_detail: clientData.addressDetail,
          category: clientData.category,
          gift_history: clientData.giftHistory
        }).eq('id', clientData.id);
        if (error) throw error;
        setClients(clients.map(c => c.id === clientData.id ? clientData : c));
      } else {
        const newId = Date.now().toString();
        const newClient = { ...clientData, id: newId, registeredBy: currentUser.name, registeredEmail: currentUser.email };
        const { error } = await supabase.from('clients').insert([{
          id: newId,
          name: newClient.name,
          company: newClient.company,
          position: newClient.position,
          phone: newClient.phone,
          postcode: newClient.postcode,
          address: newClient.address,
          address_detail: newClient.addressDetail,
          category: newClient.category,
          registered_by: newClient.registeredBy,
          registered_email: newClient.registeredEmail,
          gift_history: newClient.giftHistory
        }]);
        if (error) throw error;
        setClients([newClient, ...clients]);
      }
      setIsModalOpen(false);
      setEditingClient(undefined);
    } catch (error: any) {
      alert(`저장 실패: ${error.message || '네트워크 오류가 발생했습니다.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('정말로 삭제하시겠습니까?')) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      setClients(clients.filter(c => c.id !== id));
    } catch (error: any) {
      alert(`삭제 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Pretendard']">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={currentUser.isAdmin} currentUser={currentUser} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                {activeTab === 'dashboard' && '종합 대시보드'}
                {activeTab === 'clients' && (currentUser.isAdmin ? '전체 취합 데이터' : '내 등록 리스트')}
                {activeTab === 'catalog' && '선물 카탈로그 관리'}
                {activeTab === 'users' && '직원 계정 관리'}
              </h1>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest ${currentUser.isAdmin ? 'bg-purple-600 text-white' : 'bg-[#005BAC] text-white'}`}>
                {currentUser.isAdmin ? 'ADMIN' : 'USER'}
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium">GS차지비 명절 선물 배송지 취합 및 예산 관리 시스템</p>
          </div>
          {activeTab === 'clients' && (
            <button onClick={() => { setEditingClient(undefined); setIsModalOpen(true); }} className="bg-[#005BAC] hover:bg-[#004a8d] text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              명절 선물 내역 등록
            </button>
          )}
        </header>

        {activeTab === 'dashboard' && <Dashboard stats={stats} clients={visibleClients} isAdmin={currentUser.isAdmin} />}
        {activeTab === 'clients' && <ClientList clients={visibleClients} onEdit={(c) => { setEditingClient(c); setIsModalOpen(true); }} onDelete={handleDeleteClient} isAdmin={currentUser.isAdmin} />}
        {activeTab === 'catalog' && currentUser.isAdmin && <GiftCatalogManager catalog={catalog} setCatalog={setCatalog} />}
        {activeTab === 'users' && currentUser.isAdmin && <UserManager users={users} setUsers={setUsers} />}
        {isModalOpen && <ClientModal client={editingClient} catalog={catalog} onClose={() => setIsModalOpen(false)} onSave={handleSaveClient} />}
      </main>
    </div>
  );
};

export default App;
