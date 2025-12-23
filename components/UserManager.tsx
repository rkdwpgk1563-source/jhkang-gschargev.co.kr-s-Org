
import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface UserManagerProps {
  users: User[];
  setUsers: (users: User[]) => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, setUsers }) => {
  const [newUser, setNewUser] = useState<User>({
    name: '',
    email: '',
    isAdmin: false
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newUser.name || !newUser.email) return;

    if (!newUser.email.endsWith('@gschargev.co.kr')) {
      setError('사내 이메일(@gschargev.co.kr)만 등록 가능합니다.');
      return;
    }

    if (users.some(u => u.email === newUser.email)) {
      setError('이미 등록된 이메일입니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('users').insert([{
        email: newUser.email,
        name: newUser.name,
        is_admin: newUser.isAdmin
      }]);
      if (error) throw error;
      
      setUsers([...users, newUser]);
      setNewUser({ name: '', email: '', isAdmin: false });
    } catch (err) {
      setError('사용자 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (confirm('해당 사용자의 접속 권한을 삭제하시겠습니까?')) {
      const { error } = await supabase.from('users').delete().eq('email', email);
      if (error) {
        alert('삭제 중 오류가 발생했습니다.');
      } else {
        setUsers(users.filter(u => u.email !== email));
      }
    }
  };

  const handleToggleAdmin = async (email: string, currentStatus: boolean) => {
    const { error } = await supabase.from('users').update({ is_admin: !currentStatus }).eq('email', email);
    if (error) {
      alert('권한 변경 중 오류가 발생했습니다.');
    } else {
      setUsers(users.map(u => u.email === email ? { ...u, isAdmin: !currentStatus } : u));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fadeIn">
      {/* 보안 경고 섹션 */}
      <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-3xl">
        <h3 className="text-rose-700 font-bold flex items-center gap-2 mb-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          관리자 보안 체크리스트
        </h3>
        <p className="text-sm text-rose-600 leading-relaxed">
          외부 공유 전 반드시 Supabase 대시보드에서 <strong>RLS(Row Level Security)</strong>가 활성화되어 있는지 확인하세요. <br/>
          RLS가 비활성화되어 있으면 이메일 인증 없이도 누구나 데이터를 조회하거나 수정할 수 있습니다.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
           <svg className="w-6 h-6 text-[#005BAC]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
           신규 직원 등록
        </h2>
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">성명</label>
            <input 
              required
              type="text" 
              value={newUser.name} 
              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#005BAC] transition-all" 
              placeholder="홍길동"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">사내 이메일</label>
            <input 
              required
              type="email" 
              value={newUser.email} 
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#005BAC] transition-all" 
              placeholder="id@gschargev.co.kr"
            />
          </div>
          <div className="flex items-center gap-3 mb-2 px-2">
            <input 
              type="checkbox" 
              id="admin_check"
              checked={newUser.isAdmin}
              onChange={e => setNewUser({ ...newUser, isAdmin: e.target.checked })}
              className="w-5 h-5 text-[#005BAC] rounded-md focus:ring-[#005BAC]"
            />
            <label htmlFor="admin_check" className="text-sm font-bold text-slate-600 cursor-pointer">관리자 권한 부여</label>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-[#005BAC] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#004a8d] transition-all shadow-md active:scale-95 disabled:bg-slate-300"
          >
            {isSubmitting ? '등록 중...' : '등록하기'}
          </button>
        </form>
        {error && <p className="mt-4 text-xs text-rose-500 font-bold ml-1">{error}</p>}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">등록된 직원 리스트</h3>
          <span className="text-xs font-bold text-[#005BAC] bg-blue-50 px-3 py-1 rounded-full">총 {users.length}명</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white text-slate-400 text-left border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 font-bold uppercase tracking-wider">직원 정보</th>
                <th className="px-8 py-4 font-bold uppercase tracking-wider">이메일 계정</th>
                <th className="px-8 py-4 font-bold uppercase tracking-wider text-center">권한 설정</th>
                <th className="px-8 py-4 font-bold uppercase tracking-wider text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.email} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                        {user.name?.[0] || '?'}
                      </div>
                      <span className="font-bold text-slate-700">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-medium text-slate-500">{user.email}</td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      onClick={() => handleToggleAdmin(user.email, user.isAdmin)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                        user.isAdmin 
                          ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {user.isAdmin ? 'ADMIN (관리자)' : 'USER (일반)'}
                    </button>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => handleDeleteUser(user.email)}
                      disabled={user.email === 'jhkang@gschargev.co.kr'}
                      className={`text-rose-500 font-bold hover:underline ${user.email === 'jhkang@gschargev.co.kr' ? 'opacity-0 pointer-events-none' : ''}`}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManager;
