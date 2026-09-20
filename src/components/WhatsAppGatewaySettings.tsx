import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Smartphone,
  QrCode,
  CheckCircle2,
  Clock,
  Radio,
  FileCode,
  BookOpen,
  Send,
  Zap,
  ShieldCheck,
  Copy,
  ExternalLink,
  Bell,
  Sparkles,
} from 'lucide-react';
import { WhatsAppWebScanner } from './WhatsAppWebScanner';
import { MidnightDispatcherPanel } from './MidnightDispatcherPanel';
import { TimelyRemindersPanel } from './TimelyRemindersPanel';
import { GreetingCard } from '../types';

interface WhatsAppGatewaySettingsProps {
  senderWhatsApp: string;
  cards: GreetingCard[];
  onUpdateSenderWhatsApp: (phone: string) => void;
  onPreviewCard: (card: GreetingCard) => void;
  onShowToast: (msg: string) => void;
}

export const WhatsAppGatewaySettings: React.FC<WhatsAppGatewaySettingsProps> = ({
  senderWhatsApp,
  cards,
  onUpdateSenderWhatsApp,
  onPreviewCard,
  onShowToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'scanner' | 'reminders' | 'midnight' | 'guide'>('scanner');

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              WhatsApp Web Scanner & Pengingat Tepat Waktu
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mt-1.5 tracking-tight">
            Pindai Kode QR WhatsApp Web & Pusat Pengingat Ulang Tahun
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-2xl">
            Pindai kode QR WhatsApp Web secara langsung di bawah ini menggunakan aplikasi WhatsApp di ponsel Anda untuk menghubungkan akun WhatsApp pribadi Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {senderWhatsApp ? (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>WA: {senderWhatsApp}</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Menunggu Scan QR WhatsApp</span>
            </div>
          )}
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveSubTab('scanner')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeSubTab === 'scanner'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Kode QR WhatsApp Web (Langsung Muncul)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('reminders')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeSubTab === 'reminders'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-300" />
          <span>Pengingat Tepat Waktu (WhatsApp Saya)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('midnight')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeSubTab === 'midnight'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Pengiriman Otomatis Jam 00:00 (Midnight)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('guide')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeSubTab === 'guide'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Panduan Pengingat & Tautan</span>
        </button>
      </div>

      {/* TAB 1: PENGINGAT TEPAT WAKTU (TIMELY REMINDERS PANEL) */}
      {activeSubTab === 'reminders' && (
        <TimelyRemindersPanel
          cards={cards}
          connectedPhone={senderWhatsApp}
          onShowToast={onShowToast}
          onPreviewCard={onPreviewCard}
        />
      )}

      {/* TAB 2: PENAUTAN WHATSAPP (QR CODE / NOMOR TELEPON) */}
      {activeSubTab === 'scanner' && (
        <WhatsAppWebScanner
          currentPhone={senderWhatsApp}
          onUpdatePhone={onUpdateSenderWhatsApp}
          onShowToast={onShowToast}
        />
      )}

      {/* TAB 3: MIDNIGHT 00:00 DISPATCHER */}
      {activeSubTab === 'midnight' && (
        <MidnightDispatcherPanel
          cards={cards}
          onShowToast={onShowToast}
          onPreviewCard={onPreviewCard}
        />
      )}

      {/* TAB 4: GUIDELINES */}
      {activeSubTab === 'guide' && (
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-4 text-xs text-zinc-600 dark:text-zinc-300">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Cara Kerja Penautan & Pengingat Tepat Waktu</span>
          </h4>
          <ol className="list-decimal list-inside space-y-2.5 leading-relaxed">
            <li>
              <strong>Penautan WhatsApp Mudah & Aman:</strong> Anda dapat menautkan nomor WhatsApp pribadi Anda dengan memasukkan nomor HP secara langsung (misal: 081234567890) atau dengan memindai kode QR melalui WhatsApp &gt; Perangkat Tertaut.
            </li>
            <li>
              <strong>Pengingat H-3 & H-1 ke WhatsApp Pribadi Anda:</strong> Agar Anda tidak lupa, aplikasi akan mengirimkan notifikasi pengingat H-3 dan H-1 ke WhatsApp pribadi Anda yang tersambung. Anda dapat menguji kirim pengingat kapan saja dengan tombol uji coba.
            </li>
            <li>
              <strong>Pengiriman Tepat Jam 00:00:00 ke Penerima:</strong> Tepat di detik pertama pergantian hari ulang tahun penerima, ucapan spesial beserta link kado interaktif akan dikirimkan otomatis ke WhatsApp penerima.
            </li>
            <li>
              <strong>Balasan Langsung Masuk ke HP Anda:</strong> Karena pesan dikirimkan dari nomor WhatsApp pribadi Anda, balasan atau ucapan terima kasih dari penerima akan langsung masuk ke ruang obrolan WhatsApp di ponsel Anda.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
