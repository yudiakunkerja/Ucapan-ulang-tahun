import React from 'react';
import { Sparkles, Moon, Sun, LayoutDashboard, Gift, MessageCircle } from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'recipient';
  onSelectView: (view: 'dashboard' | 'recipient') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  hasActiveRecipientCard: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  isDarkMode,
  onToggleDarkMode,
  hasActiveRecipientCard,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 dark:bg-zinc-950/85 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors w-full max-w-full overflow-hidden">
      <div className="max-w-6xl mx-auto px-2.5 sm:px-4 h-15 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4 w-full">
        {/* LOGO & TITLE */}
        <div
          onClick={() => onSelectView('dashboard')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-zinc-900 dark:text-white font-serif">
                KadoUlangTahun
              </span>
              <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">
                AI
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 hidden md:block">
              Ucapan Otomatis, Personal & Interaktif
            </p>
          </div>
        </div>

        {/* 2 WEBSITES TOGGLE (Pengaturan Pengguna vs Website Tampilan Ucapan) */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-700 shrink-0">
          <button
            id="nav-btn-dashboard"
            onClick={() => onSelectView('dashboard')}
            className={`px-2.5 sm:px-4 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Pengaturan</span>
            <span className="xs:hidden sm:hidden">Atur</span>
          </button>

          <button
            id="nav-btn-tampilan-ucapan"
            onClick={() => onSelectView('recipient')}
            disabled={!hasActiveRecipientCard}
            className={`px-2.5 sm:px-4 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer disabled:opacity-40 ${
              currentView === 'recipient'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
            title={hasActiveRecipientCard ? 'Buka Website Tampilan Ucapan' : 'Pilih kartu terlebih dahulu'}
          >
            <Gift className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Tampilan Ucapan</span>
            <span className="xs:hidden sm:hidden">Kartu</span>
          </button>
        </div>

        {/* CONTROLS: DARK MODE */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            id="btn-toggle-darkmode"
            onClick={onToggleDarkMode}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
