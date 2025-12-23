
import React, { useState } from 'react';
import { Client } from '../types';

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onEdit, onDelete, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(c => 
    c.name.includes(searchTerm) || 
    c.company.includes(searchTerm) || 
    c.position.includes(searchTerm) ||
    c.registeredBy.includes(searchTerm)
  );

  const handleExportCSV = () => {
    // 엑셀(CSV) 다운로드 기능 구현
    const headers = ['No', '입력자', '업체명', '성함', '직함', '연락처', '우편번호', '주소', '상세주소', '품목', '수량', '금액', '상태', '비고'];
    const rows = filteredClients.flatMap((c, i) => c.giftHistory.map(h => [
      i + 1,
      c.registeredBy,
      c.company,
      c.name,
      c.position,
      c.phone,
      c.postcode,
      c.address,
      c.addressDetail,
      h.itemName,
      h.quantity,
      h.price,
      h.status,
      h.note || ''
    ]));

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `gift_list_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="검색 (업체, 담당자, 입력자...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          엑셀(CSV) 다운로드
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold">입력자</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider">업체 및 담당자</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider">선물 정보 (품목/수량)</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider">주소</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold">
                    {client.registeredBy}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-bold text-slate-800">{client.company}</p>
                      <p className="text-xs text-slate-500">{client.name} {client.position} • {client.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {client.giftHistory.length > 0 ? (
                    <div>
                      <p className="text-xs font-bold text-slate-700">{client.giftHistory[0].itemName} <span className="text-indigo-600">({client.giftHistory[0].quantity}개)</span></p>
                      <p className="text-[10px] text-slate-400">₩{client.giftHistory[0].price.toLocaleString()} • {client.giftHistory[0].note || '비고 없음'}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">미등록</span>
                  )}
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <p className="truncate text-[11px] text-slate-600">({client.postcode}) {client.address}</p>
                  <p className="truncate text-[11px] text-slate-400">{client.addressDetail}</p>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => onEdit(client)} className="text-indigo-600 hover:text-indigo-900 font-medium">수정</button>
                  <button onClick={() => onDelete(client.id)} className="text-rose-600 hover:text-rose-900 font-medium">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientList;
