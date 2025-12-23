
import React from 'react';
import { DashboardStats, Client } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  clients: Client[];
  isAdmin: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, clients, isAdmin }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="내 거래처 수" value={`${stats.totalClients}곳`} icon="🏢" color="bg-blue-500" />
        <Card title="내 누적 선물" value={`${stats.totalGifts}건`} icon="🎁" color="bg-[#005BAC]" />
        <Card title="내 배정 예산" value={`₩${stats.totalBudget.toLocaleString()}`} icon="💰" color="bg-emerald-500" />
        <Card title="전체 참여 인원" value={`${Object.keys(stats.userStats).length}명`} icon="👥" color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
            <span className="w-2 h-6 bg-[#005BAC] rounded-full"></span>
            최근 등록 선물 내역
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-4 text-left font-bold uppercase tracking-wider">업체/담당자</th>
                  <th className="px-4 py-4 text-left font-bold uppercase tracking-wider">품목(수량)</th>
                  {isAdmin && <th className="px-4 py-4 text-left font-bold uppercase tracking-wider">입력자</th>}
                  <th className="px-4 py-4 text-right font-bold uppercase tracking-wider">금액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.flatMap(c => c.giftHistory.map(h => ({...h, client: c}))).slice(0, 10).map((gift, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-5">
                      <p className="font-bold text-slate-700">{gift.client.company}</p>
                      <p className="text-[11px] text-slate-400">{gift.client.name} {gift.client.position}</p>
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-slate-800 font-medium">{gift.itemName}</p>
                      <p className="text-[10px] text-indigo-500 font-bold">{gift.quantity}개</p>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-5">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold">
                          {gift.client.registeredBy}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-5 text-right font-black text-[#005BAC]">₩{gift.price.toLocaleString()}</td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 4 : 3} className="py-20 text-center text-slate-300 italic">등록된 내역이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-xl font-bold mb-6 text-slate-800">사용자별 등록 건수</h2>
          <div className="space-y-5">
            {/* Fix: Added explicit type casting for arithmetic operation in sort function on line 71 */}
            {Object.entries(stats.userStats).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([user, count]) => {
              const countNum = count as number;
              const total = Math.max(...Object.values(stats.userStats) as number[]);
              const percentage = total > 0 ? (countNum / total) * 100 : 0;
              return (
                <div key={user} className="group">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 font-bold group-hover:text-[#005BAC] transition-colors">{user}</span>
                    <span className="font-black text-[#005BAC]">{countNum}건</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 shadow-inner">
                    <div 
                      className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-[#005BAC] transition-all duration-500 ease-out" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {Object.keys(stats.userStats).length === 0 && (
               <div className="py-12 text-center text-slate-300 italic text-sm">참여 데이터가 없습니다.</div>
            )}
          </div>
          
          <div className="mt-12 p-6 bg-blue-50 rounded-3xl border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">⚠️</span>
              <h3 className="text-sm font-black text-blue-900 uppercase">공지사항</h3>
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
              모든 배송지 데이터는 매일 자정 엑셀로 자동 백업됩니다. 정확한 주소 입력을 위해 카카오 우편번호 서비스를 필히 사용해 주시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card: React.FC<{ title: string; value: string; icon: string; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-[11px] font-black text-slate-400 mb-1 uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-black text-slate-800">{value}</h3>
    </div>
    <div className={`w-14 h-14 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center text-2xl shadow-sm`}>
      {icon}
    </div>
  </div>
);

export default Dashboard;
