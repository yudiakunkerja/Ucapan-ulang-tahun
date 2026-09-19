import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GreetingCard } from '../types';
import { DAILY_WISH_TEMPLATES, generateDailyWhatsAppMessage, getDailyWhatsAppLink } from '../utils/dailyWishes';
import {
  MessageCircle,
  Calendar,
  Sparkles,
  Copy,
  ExternalLink,
  Check,
  Send,
  X,
  Share2,
} from 'lucide-react';

interface DailyShareModalProps {
  card: GreetingCard;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const DailyShareModal: React.FC<DailyShareModalProps> = ({
  card,
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [selectedDayOffset, setSelectedDayOffset] = useState(0); // 0 = Hari Ini, 1 = Besok, etc.
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentMsg = generateDailyWhatsAppMessage(card, selectedDayOffset, true);
  const waLink = getDailyWhatsAppLink(card, selectedDayOffset);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMsg.message);
    setCopied(true);
    onShowToast('Teks ucapan WhatsApp berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  // 7 Days selection pills
  const days = [
    { offset: 0, label: 'Hari Ini' },
    { offset: 1, label: 'Besok' },
    { offset: 2, label: '+2 Hari' },
    { offset: 3, label: '+3 Hari' },
    { offset: 4, label: '+4 Hari' },
    { offset: 5, label: '+5 Hari' },
    { offset: 6, label: '+6 Hari' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                Bagikan ke WhatsApp ({card.nickname || card.recipientName})
              </h3>
              <p className="text-xs text-zinc-500">
                Pilih variasi ucapan harian yang unik dan berbeda setiap harinya.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* DAY SELECTOR PILLS */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-rose-500" />
            <span>Pilih Hari Pengiriman (Variasi Ucapan Khusus):</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {days.map((d) => {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() + d.offset);
              const dayName = DAILY_WISH_TEMPLATES[targetDate.getDay()].dayName;
              const isSelected = selectedDayOffset === d.offset;

              return (
                <button
                  key={d.offset}
                  onClick={() => setSelectedDayOffset(d.offset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm scale-105'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                  }`}
                >
                  <span>{d.label}</span>
                  <span className="text-[10px] opacity-80">({dayName})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* THEME TAG BANNER */}
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>Tema Hari Ini: <strong>{currentMsg.title}</strong></span>
        </div>

        {/* MESSAGE PREVIEW BOX */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Pratinjau Pesan yang Akan Dikirim:</span>
            <span className="font-mono text-[10px]">Format: WhatsApp Text & Link</span>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-950 text-zinc-100 font-sans text-xs whitespace-pre-line border border-zinc-800 max-h-60 overflow-y-auto leading-relaxed">
            {currentMsg.message}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-transform active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Langsung ke WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
