import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Send,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  MessageCircle,
  Zap,
  Check,
  ChevronRight,
  Shield,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { GreetingCard, MidnightQueueItem } from '../types';

interface MidnightDispatcherPanelProps {
  cards: GreetingCard[];
  onShowToast: (msg: string) => void;
  onPreviewCard: (card: GreetingCard) => void;
}

export const MidnightDispatcherPanel: React.FC<MidnightDispatcherPanelProps> = ({
  cards,
  onShowToast,
  onPreviewCard,
}) => {
  const [queue, setQueue] = useState<MidnightQueueItem[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [selectedTimezone, setSelectedTimezone] = useState<string>('WIB (UTC+7)');
  const [previewItem, setPreviewItem] = useState<MidnightQueueItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Live clock updating every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      const formatter = new Intl.DateTimeFormat('id-ID', options);
      setCurrentTimeStr(formatter.format(now) + ' WIB');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch queue & logs from backend
  const fetchQueueData = async () => {
    try {
      const res = await fetch('/api/whatsapp/midnight-queue');
      const data = await res.json();
      if (data.queue) {
        setQueue(data.queue);
      }
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error('Failed to fetch midnight queue:', e);
    }
  };

  useEffect(() => {
    fetchQueueData();
    const poll = setInterval(fetchQueueData, 10000); // 10s poll
    return () => clearInterval(poll);
  }, []);

  // Schedule a card for 00:00 midnight
  const handleScheduleMidnight = async (card: GreetingCard) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/whatsapp/schedule-midnight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: card.id,
          recipientName: card.recipientName,
          recipientPhone: card.whatsappNumber,
          birthDate: card.birthDate,
          timezone: selectedTimezone,
          cardUrl: `${window.location.origin}/?card=${card.id}`,
          message: `*Selamat Ulang Tahun Tepat Pukul 00:00, ${card.nickname || card.recipientName}!* 🎉🎂\n\nDi detik pertama hari ulang tahunmu ini, aku ingin menjadi orang pertama yang merayakan kehadiranmu di dunia. Semoga tahun ini membawa ribuan kebahagiaan dan berkah tanpa henti.\n\n🎁 *Buka Hadiah & Kartu Interaktifmu di Sini:*\n👉 ${window.location.origin}/?card=${card.id}\n\n_Dari: ${card.senderName}_`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(`Kartu untuk ${card.recipientName} berhasil dijadwalkan tepat pukul 00:00!`);
        fetchQueueData();
      }
    } catch (e) {
      onShowToast('Gagal menjadwalkan pengiriman.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger instant test for midnight dispatch
  const handleTriggerNow = async (queueId: string) => {
    try {
      const res = await fetch('/api/whatsapp/trigger-midnight-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId }),
      });
      const data = await res.json();
      if (data.success) {
        onShowToast('✅ Berhasil mengirim pesan simulasi Pukul 00:00 ke WhatsApp penerima!');
        fetchQueueData();
      }
    } catch (e) {
      onShowToast('Gagal memproses simulasi.');
    }
  };

  // Helper: Format countdown to midnight
  const getCountdownString = (targetTimestamp: number) => {
    const diff = targetTimestamp - Date.now();
    if (diff <= 0) return 'Sedang diproses pukul 00:00!';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')} Jam : ${mins.toString().padStart(2, '0')} Menit : ${secs.toString().padStart(2, '0')} Detik`;
  };

  return (
    <div className="space-y-6">
      {/* 1. HERO MIDNIGHT BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-900 border border-indigo-800/40 text-white shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Midnight Birthday Surprise (Pukul 00:00:00)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Kirim Link Tepat di Pukul 00.00 Hari Ulang Tahun
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Jadilah orang pertama yang mengucapkan selamat ulang tahun! Sistem otomatis WhatsApp pribadi Anda akan mengirimkan link kartu interaktif dan ucapan personal ke WhatsApp penerima tepat saat jarum jam menyentuh pukul 00:00 di tanggal kelahirannya.
            </p>
          </div>

          {/* Live Clock Card */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center text-center min-w-[200px]">
            <span className="text-[11px] uppercase tracking-widest text-indigo-300 font-semibold mb-1">
              Waktu Server Saat Ini
            </span>
            <div className="text-2xl font-mono font-black text-white tracking-wider">
              {currentTimeStr || '00:00:00 WIB'}
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Sinkronisasi Presisi Aktif
            </span>
          </div>
        </div>
      </div>

      {/* 2. JADWALKAN KARTU KE ANTREAN MIDNIGHT */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Jadwalkan Kartu untuk Pengiriman Tengah Malam (00:00)</span>
            </h4>
            <p className="text-xs text-zinc-500">
              Pilih kartu yang telah Anda buat untuk ditambahkan ke jadwal pengiriman otomatis.
            </p>
          </div>

          {/* Timezone Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">Zona Waktu:</span>
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
            >
              <option value="WIB (UTC+7)">WIB (Jakarta / Sumatra / Jawa / Kalbar)</option>
              <option value="WITA (UTC+8)">WITA (Bali / Kalsel / Kaltim / Sulawesi)</option>
              <option value="WIT (UTC+9)">WIT (Maluku / Papua)</option>
            </select>
          </div>
        </div>

        {/* Cards Quick Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cards.map((card) => {
            const isAlreadyScheduled = queue.some((q) => q.cardId === card.id);
            const queueItem = queue.find((q) => q.cardId === card.id);

            return (
              <div
                key={card.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isAlreadyScheduled
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/70 hover:border-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {card.recipientName} {card.nickname ? `(${card.nickname})` : ''}
                    </span>
                    {isAlreadyScheduled ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        Terjadwal 00:00
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {card.birthDate || 'Belum diatur'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mb-1">
                    WA: {card.whatsappNumber || 'Tanpa nomor'}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 italic">
                    "{card.cardTitle}"
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onPreviewCard(card)}
                    className="text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" /> Pratinjau
                  </button>

                  {isAlreadyScheduled ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (queueItem) handleTriggerNow(queueItem.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-500 cursor-pointer flex items-center gap-1"
                      title="Kirim Sekarang sebagai Tes"
                    >
                      <Send className="w-2.5 h-2.5" /> Tes Kirim Sekarang
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleScheduleMidnight(card)}
                      className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-xs"
                    >
                      <Clock className="w-3 h-3" /> Jadwalkan 00:00
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ANTREAN MIDNIGHT REAL-TIME (ACTIVE QUEUE) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Antrean Pengiriman Pukul 00:00 (Midnight Queue)</span>
            </h4>
            <p className="text-xs text-zinc-500">
              Daftar kartu yang sedang menghitung mundur menuju detik 00:00:00 tanggal ulang tahun.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchQueueData}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            title="Segarkan Antrean"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {queue.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-xs">
            Belum ada kartu dalam antrean pukul 00:00. Klik tombol "Jadwalkan 00:00" di atas untuk menambahkan.
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map((item) => {
              const isSent = item.status === 'sent';
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/70 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">
                        {item.recipientName}
                      </span>
                      <span className="font-mono text-xs text-zinc-500">
                        ({item.recipientPhone})
                      </span>
                      {isSent ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Terkirim Otomatis
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 animate-spin" /> Menunggu Pukul 00:00
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-zinc-500 flex flex-wrap items-center gap-3">
                      <span>Target: <strong>{item.targetMidnightFormatted}</strong></span>
                      <span>Zona: {item.timezone}</span>
                    </div>

                    {!isSent && (
                      <div className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 pt-1">
                        <span>Hitung Mundur:</span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/10">
                          {getCountdownString(item.targetMidnightTimestamp)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-300 cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> Lihat Pesan
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerNow(item.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" /> Uji Coba Kirim Sekarang
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. RIWAYAT & LOG PENGIRIMAN (DISPATCH LOGS) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Riwayat Pengiriman Otomatis WhatsApp (Audit Trail)</span>
        </h4>

        {logs.length === 0 ? (
          <div className="text-xs text-zinc-400 py-4 text-center">
            Belum ada riwayat pengiriman.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/60 flex items-center justify-between gap-3"
              >
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {log.recipientName} ({log.recipientPhone})
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {log.messageId}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {log.preview}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                    Terkirim
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {new Date(log.timestamp).toLocaleTimeString('id-ID')} WIB
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: PREVIEW MIDNIGHT MESSAGE */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-lg w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Pratinjau Pesan Midnight 00:00 untuk {previewItem.recipientName}
                </h3>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  Tutup
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 text-emerald-400 font-mono text-xs whitespace-pre-line border border-zinc-800 leading-relaxed max-h-72 overflow-y-auto">
                {previewItem.messagePreview}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleTriggerNow(previewItem.id);
                    setPreviewItem(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  Kirim Sekarang sebagai Uji Coba
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
