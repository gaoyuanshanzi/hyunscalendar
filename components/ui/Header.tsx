'use client';

import { LogOut, Download, Upload, CalendarDays } from 'lucide-react';
import { exportAllData, importAllData } from '@/lib/storage';
import { useRef } from 'react';

interface HeaderProps {
  onLogout: () => void;
  onDataChange: () => void;
}

export default function Header({ onLogout, onDataChange }: HeaderProps) {
  const importRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hyunscalendar_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const success = importAllData(text);
      if (success) {
        alert('데이터가 성공적으로 가져와졌습니다.');
        onDataChange();
      } else {
        alert('올바르지 않은 파일 형식입니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <CalendarDays size={14} className="text-white" />
        </div>
        <span className="text-sm font-bold text-gray-800">HyunsCalendar</span>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleExport}
          title="데이터 내보내기 (JSON)"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg transition"
        >
          <Download size={13} />
          내보내기
        </button>
        <button
          onClick={() => importRef.current?.click()}
          title="데이터 가져오기 (JSON)"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 rounded-lg transition"
        >
          <Upload size={13} />
          가져오기
        </button>
        <input
          ref={importRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-lg transition"
        >
          <LogOut size={13} />
          로그아웃
        </button>
      </div>
    </header>
  );
}
