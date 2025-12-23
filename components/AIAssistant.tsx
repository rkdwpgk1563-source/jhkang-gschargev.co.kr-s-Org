
import React, { useState } from 'react';
import { Client } from '../types';
import { generateGreetingMessage, suggestGift } from '../services/geminiService';

interface AIAssistantProps {
  clients: Client[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ clients }) => {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedHoliday, setSelectedHoliday] = useState<string>('설날');
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [giftSuggestions, setGiftSuggestions] = useState<string>('');

  const handleGenerateMessage = async () => {
    const client = clients.find(c => c.id === selectedClient);
    if (!client) return alert('거래처를 선택해 주세요.');

    setIsGenerating(true);
    const msg = await generateGreetingMessage(client.name, client.company, client.position, selectedHoliday);
    setGeneratedMessage(msg || '');
    setIsGenerating(false);
  };

  const handleSuggestGift = async () => {
    const client = clients.find(c => c.id === selectedClient);
    if (!client) return alert('거래처를 선택해 주세요.');

    setIsGenerating(true);
    const suggestions = await suggestGift(client.category, selectedHoliday);
    setGiftSuggestions(suggestions || '');
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    alert('인사말이 클립보드에 복사되었습니다.');
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-2xl text-white shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl">✨</div>
          <h2 className="text-2xl font-bold">AI 비즈니스 조력자</h2>
        </div>
        <p className="text-indigo-100 opacity-90">Gemini AI를 활용해 거래처에 딱 맞는 인사말을 작성하고 최적의 선물을 추천받으세요.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Message Generator */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            인사말 자동 생성
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">거래처 선택</label>
              <select 
                value={selectedClient}
                onChange={e => setSelectedClient(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- 선택하세요 --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.company} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">명절 구분</label>
              <div className="flex gap-4">
                {['설날', '추석'].map(h => (
                  <label key={h} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="holiday" 
                      checked={selectedHoliday === h}
                      onChange={() => setSelectedHoliday(h)}
                      className="text-indigo-600 focus:ring-indigo-500" 
                    />
                    <span className="text-sm">{h}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button 
              onClick={handleGenerateMessage}
              disabled={isGenerating || !selectedClient}
              className={`w-full py-3 rounded-lg font-bold transition-all shadow-md ${
                isGenerating || !selectedClient 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:transform active:scale-[0.98]'
              }`}
            >
              {isGenerating ? 'AI가 생각하는 중...' : '인사말 생성하기'}
            </button>
          </div>

          {generatedMessage && (
            <div className="mt-6 animate-fadeIn">
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">생성된 인사말</label>
              <div className="relative">
                <textarea 
                  value={generatedMessage}
                  readOnly
                  rows={8}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm leading-relaxed outline-none"
                />
                <button 
                  onClick={handleCopy}
                  className="absolute bottom-4 right-4 bg-white border border-slate-200 px-3 py-1 rounded shadow-sm text-xs font-medium hover:bg-slate-50"
                >
                  복사하기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Gift Suggestion */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c.053.164.082.34.082.522 0 1.103-.897 2-2 2h-12c-1.103 0-2-.897-2-2 0-.182.029-.358.082-.522j.174-2.541l1.522-1.411c.21-.193.483-.3.765-.3h.142c.282 0 .555.107.765.3l1.522 1.411 1.74 2.541z" /></svg>
            맞춤형 선물 추천
          </h3>
          <p className="text-sm text-slate-500">선택된 거래처의 등급과 과거 이력을 고려하여 AI가 트렌디한 선물을 추천합니다.</p>
          
          <button 
            onClick={handleSuggestGift}
            disabled={isGenerating || !selectedClient}
            className={`w-full py-3 rounded-lg font-bold border-2 border-indigo-600 transition-all ${
              isGenerating || !selectedClient 
              ? 'border-slate-200 text-slate-300 cursor-not-allowed' 
              : 'text-indigo-600 hover:bg-indigo-50 active:transform active:scale-[0.98]'
            }`}
          >
            {isGenerating ? 'AI 분석 중...' : '선물 추천 받기'}
          </button>

          {giftSuggestions && (
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm">
                {giftSuggestions}
              </div>
            </div>
          )}
          
          {!giftSuggestions && !isGenerating && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-300">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              <p className="text-xs">상단 버튼을 눌러 추천을 받아보세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
