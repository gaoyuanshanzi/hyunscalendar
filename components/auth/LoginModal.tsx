'use client';

import { useState } from 'react';
import { Eye, EyeOff, LogIn, Lock, User } from 'lucide-react';

interface LoginModalProps {
  onLogin: () => void;
}

const ADMIN_ID = 'admin';
const ADMIN_PW = '123jesus';

export default function LoginModal({ onLogin }: LoginModalProps) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (id === ADMIN_ID && pw === ADMIN_PW) {
        onLogin();
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        setLoading(false);
      }
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-gray-100 p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="4" width="10" height="14" rx="2" fill="white" opacity="0.8"/>
              <rect x="18" y="4" width="10" height="6" rx="2" fill="white"/>
              <rect x="18" y="14" width="10" height="14" rx="2" fill="white" opacity="0.8"/>
              <rect x="4" y="22" width="10" height="6" rx="2" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">HyunsCalendar</h1>
          <p className="text-sm text-gray-500 mt-1">관리자 로그인</p>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">아이디</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="아이디 입력"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-gray-400" />
              </div>
              <input
                type={showPw ? 'text' : 'password'}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="비밀번호 입력"
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading || !id || !pw}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-medium text-sm transition duration-150"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <LogIn size={16} />
          )}
          {loading ? '로그인 중...' : '로그인'}
        </button>

        <p className="text-xs text-center text-gray-400 mt-4">HyunsCalendar &copy; 2026</p>
      </div>
    </div>
  );
}
