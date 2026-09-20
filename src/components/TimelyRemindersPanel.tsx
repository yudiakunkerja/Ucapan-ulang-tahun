import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Clock,
  Send,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Check,
  Plus,
  Gift,
} from 'lucide-react';
import { GreetingCard, WhatsAppReminderItem } from '../types';

interface TimelyRemindersPanelProps {
  cards: GreetingCard[];
  connectedPhone: string;
  onShowToast: (msg: string) => void;
  onPreviewCard: (card: GreetingCard) => void;
}

export const TimelyRemindersPanel: React.FC<TimelyRemindersPanelProps> = ({
  cards,
  connectedPhone,
  onShowToast,
  onPreviewCard,
}) => {
  const [reminders, setReminders] = useState<WhatsAppReminderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [remindH3, setRemindH3] = useState<boolean>(true);
  const [remindH1, setRemindH1] = useState<boolean>(true);
  const [remindMidnight, setRemindMidnight] = useState<boolean>(true);
  const [customWish, setCustomWish] = useState<string>('');

  // Fetch reminders on mount
  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await fetch('/api/whatsapp/reminders');
      const data = await res.json();
      if (data?.reminders) {
        setReminders(data.reminders);
      }
    } catch (e) {
      console.error('Failed to load reminders:', e);
    }
  };

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  const handleScheduleReminders = async () => {
    if (!selectedCard) {
      onShowToast('Pilih kartu terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/whatsapp/schedule-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: selectedCard.id,
          recipientName: selectedCard.recipientName,
          recipientPhone: selectedCard.whatsappNumber,
          birthDate: selectedCard.birthDate,
          remindSelfH3: remindH3,
          remindSelfH1: remindH1,
          remindSelfMorning: true,
          customWish: customWish || selectedCard.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(`Pengingat tepat waktu untuk ${selectedCard.recipientName} berhasil dijadwalkan!`);
        fetchReminders();
      }
    } catch (e) {
      onShowToast('Gagal menjadwalkan pengingat.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReminderNow = async (reminder: WhatsAppReminderItem) => {
    try {
      const res = await fetch('/api/whatsapp/send-reminder-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderId: reminder.id }),
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(data.message);
        fetchReminders();
      }
    } catch (e) {
      onShowToast('Pengingat dikirimkan ke WhatsApp.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER INFO BANNER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-200/60 dark:border-indigo-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
              <Bell className="w-3.5 h-3.5" />
              <span>Sistem Pengingat Tepat Waktu WhatsApp Pribadi</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
              Jangan Pernah Lewatkan Hari Ulang Tahun Orang Tersayang
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Aplikasi akan secara otomatis mengirimkan notifikasi pengingat ke nomor WhatsApp pribadi Anda (H-3 dan H-1) untuk persiapan kado, serta mengirimkan tautan kartu ucapan interaktif langsung ke WhatsApp penerima tepat di detik pergantian hari (pukul 00:00).
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-500 font-medium">Nomor WhatsApp Terhubung:</span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              {connectedPhone || '081234567890'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. JADWALKAN PENGINGAT UNTUK KARTU TERTENTU */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Atur Pengingat untuk Kartu Ulang Tahun
            </h4>
          </div>
          <span className="text-xs text-zinc-400">Pilih kartu dan aktifkan alarm</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Pilih Kartu Penerima:
            </label>
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white font-medium"
            >
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.recipientName} ({c.profile}) — Ultah: {c.birthDate || 'Belum diatur'}
                </option>
              ))}
            </select>

            {selectedCard && (
              <div className="mt-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tanggal Lahir:</span>
                  <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">
                    {selectedCard.birthDate || '2001-09-20'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Nomor WhatsApp Penerima:</span>
                  <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">
                    {selectedCard.whatsappNumber || '081234567891'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Pilihan Pengingat Otomatis yang Diberikan:
            </label>

            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remindH3}
                  onChange={(e) => setRemindH3(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <div className="text-xs">
                  <strong className="block text-zinc-900 dark:text-white">
                    Pengingat H-3 ke WhatsApp Pribadi Saya
                  </strong>
                  <span className="text-zinc-500">
                    Mengingatkan Anda 3 hari sebelumnya untuk mempersiapkan kado & pesta.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remindH1}
                  onChange={(e) => setRemindH1(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <div className="text-xs">
                  <strong className="block text-zinc-900 dark:text-white">
                    Pengingat H-1 ke WhatsApp Pribadi Saya
                  </strong>
                  <span className="text-zinc-500">
                    Mengingatkan Anda bahwa besok adalah hari ulang tahunnya!
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remindMidnight}
                  onChange={(e) => setRemindMidnight(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <div className="text-xs">
                  <strong className="block text-zinc-900 dark:text-white">
                    Kirim Ucapan Tepat Jam 00:00 ke WhatsApp Penerima
                  </strong>
                  <span className="text-zinc-500">
                    Otomatis mengirim tautan kartu interaktif di detik pertama hari kelahirannya.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleScheduleReminders}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Jadwalkan Pengingat Otomatis Sekarang</span>
          </button>
        </div>
      </div>

      {/* 3. DAFTAR PENGINGAT TEPAT WAKTU (ACTIVE TIMELY REMINDERS QUEUE) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Daftar Pengingat Tepat Waktu yang Siap & Aktif
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {reminders.length} Pengingat
            </span>
          </div>

          <button
            type="button"
            onClick={fetchReminders}
            className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Segarkan
          </button>
        </div>

        {reminders.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 text-zinc-400 text-xs">
            Belum ada jadwal pengingat. Pilih kartu di atas dan klik "Jadwalkan Pengingat Otomatis".
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((item) => {
              const isToSelf = item.sendTo === 'self';
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isToSelf
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isToSelf ? <Bell className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                          {item.title}
                        </h5>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isToSelf
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {isToSelf ? 'Ke WA Pribadi Saya' : 'Ke WhatsApp Penerima'}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 max-w-xl">
                        {item.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400 pt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          Waktu: {item.scheduledTime}
                        </span>
                        <span>•</span>
                        <span className="font-mono">
                          Tujuan: {isToSelf ? connectedPhone : item.recipientPhone}
                        </span>
                        {item.status === 'sent' && (
                          <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Sudah Dikirim
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => handleSendReminderNow(item)}
                      className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Uji Kirim Sekarang</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const target = (isToSelf ? connectedPhone : item.recipientPhone).replace(/[^0-9]/g, '');
                        const intlPhone = target.startsWith('0') ? '62' + target.substring(1) : target;
                        const waUrl = `https://wa.me/${intlPhone}?text=${encodeURIComponent(item.message)}`;
                        window.open(waUrl, '_blank');
                        onShowToast('Membuka WhatsApp...');
                      }}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka WA</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
