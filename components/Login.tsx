
import React, { useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: (user: User) => void;
  allowedUsers: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, allowedUsers }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const cleanEmail = email.trim().toLowerCase();
    
    if (!cleanEmail.endsWith('@gschargev.co.kr')) {
      setError('사내 이메일(@gschargev.co.kr)만 사용 가능합니다.');
      return;
    }

    const registered = allowedUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);
    if (!registered) {
      setError('시스템에 등록되지 않은 이메일입니다. 관리자에게 문의하세요.');
      return;
    }

    setLoading(true);
    try {
      const { error: sendError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (sendError) throw sendError;
      
      setStep('otp');
      setMessage('이메일로 6자리 인증번호가 발송되었습니다.');
    } catch (err: any) {
      console.error(err);
      setError('인증번호 발송 실패. Supabase 대시보드 설정을 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1단계: 'magiclink' 타입으로 인증 시도 (signInWithOtp 기본값)
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: otp,
        type: 'magiclink',
      });

      if (verifyError) {
        // 2단계: 실패 시 'email' 타입으로 재시도
        const { error: retryError } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: otp,
          type: 'email',
        });
        
        if (retryError) {
          // 3단계: 신규 가입 유저인 경우 'signup' 타입으로 재시도
          const { error: lastError } = await supabase.auth.verifyOtp({
            email: cleanEmail,
            token: otp,
            type: 'signup',
          });
          if (lastError) throw lastError;
        }
      }

      const foundUser = allowedUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);
      if (foundUser) {
        onLogin(foundUser);
      } else {
        setError('인증 성공했으나 등록된 사용자 정보가 없습니다.');
      }
    } catch (err: any) {
      console.error(err);
      setError('인증번호가 일치하지 않거나 만료되었습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-['Pretendard']">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden p-12 border border-slate-100">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#005BAC] rounded-3xl mb-6 shadow-xl shadow-blue-100">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">GS CHARGE-EV</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Gift Management System</p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-widest">사내 이메일 계정</label>
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#005BAC] focus:bg-white outline-none transition-all font-semibold text-slate-700"
                placeholder="id@gschargev.co.kr"
              />
            </div>
            
            {error && (
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex items-center gap-3">
                <svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                <p className="text-rose-600 text-[11px] font-bold leading-tight">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-[#005BAC] hover:bg-[#004a8d] text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-100 active:scale-[0.97] disabled:bg-slate-300"
            >
              {loading ? '인증번호 전송 중...' : '인증번호 발송'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fadeIn">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-widest text-center block">6자리 인증번호를 입력하세요</label>
              <input 
                required
                type="text" 
                maxLength={6}
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-4 py-5 bg-slate-50 border-2 border-blue-50 rounded-2xl focus:border-[#005BAC] focus:bg-white outline-none transition-all font-black text-center text-4xl tracking-[0.2em] text-[#005BAC]"
                placeholder="000000"
              />
            </div>

            {message && <p className="text-center text-[11px] text-emerald-600 font-bold bg-emerald-50 py-2 rounded-xl">{message}</p>}
            {error && <p className="text-center text-[11px] text-rose-600 font-bold bg-rose-50 py-2 rounded-xl">{error}</p>}

            <div className="flex flex-col gap-4 pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-[#005BAC] hover:bg-[#004a8d] text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-100 active:scale-[0.97] disabled:bg-slate-300"
              >
                {loading ? '인증 확인 중...' : '로그인 완료'}
              </button>
              <button 
                type="button" 
                onClick={() => setStep('email')}
                className="w-full py-2 text-[11px] font-black text-slate-400 hover:text-[#005BAC] transition-colors uppercase tracking-widest"
              >
                이메일 주소 수정하기
              </button>
            </div>
          </form>
        )}

        <div className="mt-16 text-center">
          <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">GS Charge-EV Gift Management</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
