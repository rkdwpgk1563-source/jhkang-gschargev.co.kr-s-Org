
import React, { useState } from 'react';
import { GiftCatalogItem, ClientCategory } from '../types';
import { supabase } from '../lib/supabase';

interface GiftCatalogManagerProps {
  catalog: GiftCatalogItem[];
  setCatalog: (catalog: GiftCatalogItem[]) => void;
}

const GiftCatalogManager: React.FC<GiftCatalogManagerProps> = ({ catalog, setCatalog }) => {
  const [newItem, setNewItem] = useState<{name: string, unitPrice: number, targetCategory: ClientCategory}>({ 
    name: '', 
    unitPrice: 0, 
    targetCategory: 'B(일반)' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || newItem.unitPrice < 0) {
      alert('품목명과 가격을 정확히 입력해 주세요.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const id = Date.now().toString();
      
      // 타임아웃 8초 설정
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('서버 응답 시간이 초과되었습니다. 네트워크를 확인해 주세요.')), 8000)
      );

      const insertPromise = supabase.from('catalog').insert([{
        id,
        name: newItem.name.trim(),
        unit_price: newItem.unitPrice,
        target_category: newItem.targetCategory
      }]);

      const result: any = await Promise.race([insertPromise, timeoutPromise]);
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      setCatalog([...catalog, { id, ...newItem }]);
      setNewItem({ name: '', unitPrice: 0, targetCategory: 'B(일반)' });
      alert('품목이 성공적으로 등록되었습니다.');
    } catch (err: any) {
      console.error("Catalog Insert Error:", err);
      alert(`[오류] ${err.message || '데이터베이스 통신 실패'}\n\n도움말: 'catalog' 테이블에 대한 Insert 권한이 있는지 Supabase 정책(RLS)을 확인해 보세요.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveItem = async (id: string) => {
    if (!confirm('정말로 이 품목을 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from('catalog').delete().eq('id', id);
      if (error) throw error;
      setCatalog(catalog.filter(i => i.id !== id));
    } catch (err: any) {
      alert(`삭제 중 오류가 발생했습니다: ${err.message}`);
    }
  };

  const handleUpdatePrice = async (id: string, price: number) => {
    if (isNaN(price) || price < 0) return;
    try {
      const { error } = await supabase.from('catalog').update({ unit_price: price }).eq('id', id);
      if (error) throw error;
      setCatalog(catalog.map(i => i.id === id ? { ...i, unitPrice: price } : i));
    } catch (err: any) {
      alert(`가격 수정 중 오류 발생: ${err.message}`);
    }
  };

  const categories: ClientCategory[] = ['A(VIP)', 'B(일반)', 'C(잠재)'];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
           <svg className="w-6 h-6 text-[#005BAC]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
           새로운 선물 품목 등록
        </h2>
        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1 space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">대상 등급</label>
            <select value={newItem.targetCategory} onChange={e => setNewItem({ ...newItem, targetCategory: e.target.value as ClientCategory })} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#005BAC] bg-slate-50 font-medium">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="md:col-span-1 space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">품목명</label>
            <input required type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#005BAC]" placeholder="예: 한우 세트" />
          </div>
          <div className="md:col-span-1 space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">단가 (원)</label>
            <input required type="number" value={newItem.unitPrice} onChange={e => setNewItem({ ...newItem, unitPrice: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#005BAC]" placeholder="0" />
          </div>
          <button type="submit" disabled={isSubmitting} className="bg-[#005BAC] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#004a8d] transition-all h-[42px] shadow-sm disabled:bg-slate-300">
            {isSubmitting ? '처리 중...' : '등록하기'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${cat.startsWith('A') ? 'bg-indigo-50' : cat.startsWith('B') ? 'bg-blue-50' : 'bg-slate-50'}`}>
              <h3 className="font-bold text-slate-800">{cat} 전용 선물</h3>
              <span className="text-xs font-medium text-slate-500">{catalog.filter(i => i.targetCategory === cat).length}개</span>
            </div>
            <div className="flex-1 divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
              {catalog.filter(i => i.targetCategory === cat).map(item => (
                <div key={item.id} className="px-6 py-4 flex flex-col gap-2 hover:bg-slate-50 group">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-slate-800 text-sm leading-tight">{item.name}</p>
                    <button onClick={() => handleRemoveItem(item.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Price</span>
                    <input type="number" value={item.unitPrice} onBlur={e => handleUpdatePrice(item.id, parseInt(e.target.value) || 0)} className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-xs font-bold text-[#005BAC] text-right" />
                    <span className="text-[10px] text-slate-400">원</span>
                  </div>
                </div>
              ))}
              {catalog.filter(i => i.targetCategory === cat).length === 0 && (
                <div className="py-12 text-center text-slate-300 italic text-xs">등록된 품목이 없습니다.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GiftCatalogManager;
