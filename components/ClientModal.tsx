
import React, { useState, useEffect, useMemo } from 'react';
import { Client, GiftCatalogItem, GiftRecord, ClientCategory } from '../types';

interface ClientModalProps {
  client?: Client;
  catalog: GiftCatalogItem[];
  onClose: () => void;
  onSave: (client: Client) => void;
}

declare global {
  interface Window {
    daum: any;
  }
}

const ClientModal: React.FC<ClientModalProps> = ({ client, catalog, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    company: '',
    position: '',
    phone: '',
    category: 'B(일반)',
    postcode: '',
    address: '',
    addressDetail: '',
    giftHistory: [],
    ...client
  });

  const [currentGift, setCurrentGift] = useState<Partial<GiftRecord>>(
    client?.giftHistory?.[0] || {
      catalogItemId: '',
      quantity: 1,
      note: '',
      holiday: '설날',
      year: 2024,
      status: '준비중'
    }
  );

  const filteredCatalog = useMemo(() => {
    return catalog.filter(item => item.targetCategory === formData.category);
  }, [catalog, formData.category]);

  useEffect(() => {
    const isStillValid = filteredCatalog.some(item => item.id === currentGift.catalogItemId);
    if (!isStillValid && currentGift.catalogItemId !== '') {
      setCurrentGift(prev => ({ ...prev, catalogItemId: '' }));
    }
  }, [formData.category, filteredCatalog]);

  const handlePostcodeSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('주소 서비스 로딩 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data: any) => {
        // 도로명 주소 또는 지번 주소를 선택함에 따라 전체 주소 변수 설정
        let fullAddr = data.address;
        let extraAddr = '';

        if (data.addressType === 'R') {
          if (data.bname !== '') extraAddr += data.bname;
          if (data.buildingName !== '') extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
          fullAddr += (extraAddr !== '' ? ' (' + extraAddr + ')' : '');
        }

        // 상태 업데이트가 렌더링 사이클에서 확실히 인지되도록 처리
        setFormData(prev => ({
          ...prev,
          postcode: data.zonecode,
          address: fullAddr
        }));
        
        // 상세주소 입력창으로 포커스 이동 (선택 사항)
        setTimeout(() => {
          const detailInput = document.getElementById('addressDetail') as HTMLInputElement;
          if (detailInput) detailInput.focus();
        }, 100);
      },
      width: '100%',
      height: '100%'
    }).open();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.postcode || !formData.address) {
      alert('주소 검색을 통해 주소를 입력해 주세요.');
      return;
    }
    
    const selectedItem = catalog.find(i => i.id === currentGift.catalogItemId);
    const giftRecord: GiftRecord = {
      id: currentGift.id || Date.now().toString(),
      year: currentGift.year || 2024,
      holiday: currentGift.holiday || '설날',
      catalogItemId: currentGift.catalogItemId || '',
      itemName: selectedItem?.name || '기타',
      quantity: currentGift.quantity || 1,
      price: (selectedItem?.unitPrice || 0) * (currentGift.quantity || 1),
      status: currentGift.status || '준비중',
      note: currentGift.note
    };

    onSave({ ...formData as Client, giftHistory: [giftRecord] });
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
            <h2 className="text-xl font-bold text-slate-800">{client ? '정보 수정' : '신규 내역 입력'}</h2>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-1">핵심 분류: 거래처 등급</label>
                  <p className="text-xs text-indigo-400 italic">등급에 따라 선택 가능한 선물 품목이 필터링됩니다.</p>
                </div>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({ ...formData, category: e.target.value as ClientCategory })}
                  className="px-4 py-2 border-2 border-indigo-200 rounded-lg outline-none focus:border-indigo-500 font-bold text-indigo-700 bg-white"
                >
                  <option value="A(VIP)">A(VIP)</option>
                  <option value="B(일반)">B(일반)</option>
                  <option value="C(잠재)">C(잠재)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">업체명 *</label>
                <input required type="text" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="업체명" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">담당자 성함 *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="담당자 이름" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">직함</label>
                <input type="text" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="직함" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">연락처</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="010-0000-0000" />
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span> 선물 신청 정보
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  formData.category?.startsWith('A') ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {formData.category} 전용 품목만 표시 중
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">선물 품목 선택</label>
                  <select required value={currentGift.catalogItemId} onChange={e => setCurrentGift({ ...currentGift, catalogItemId: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">품목을 선택하세요</option>
                    {filteredCatalog.map(item => (
                      <option key={item.id} value={item.id}>{item.name} (₩{item.unitPrice.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">수량</label>
                  <input type="number" min="1" value={currentGift.quantity} onChange={e => setCurrentGift({ ...currentGift, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">비고 (참고사항)</label>
                <input type="text" value={currentGift.note} onChange={e => setCurrentGift({ ...currentGift, note: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="기타 전달 사항 등" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">배송 주소</label>
              <div className="flex gap-2">
                <input readOnly type="text" value={formData.postcode} className="w-32 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg outline-none font-bold text-[#005BAC]" placeholder="우편번호" />
                <button type="button" onClick={handlePostcodeSearch} className="px-4 py-2 bg-[#005BAC] text-white rounded-lg text-sm font-bold hover:bg-[#004a8d] transition-colors shadow-sm">주소 검색</button>
              </div>
              <input readOnly type="text" value={formData.address} className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg outline-none font-medium text-slate-700" placeholder="기본 주소" />
              <input type="text" id="addressDetail" value={formData.addressDetail} onChange={e => setFormData({ ...formData, addressDetail: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="상세 주소 (동, 호수 등)" />
            </div>
          </div>

          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-slate-300 text-slate-600 rounded-lg font-medium hover:bg-white transition-colors">취소</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">기록 저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
