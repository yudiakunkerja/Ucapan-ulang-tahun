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
} from 'lucide-react';
import { WhatsAppWebScanner } from './WhatsAppWebScanner';
import { MidnightDispatcherPanel } from './MidnightDispatcherPanel';
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
  const [activeSubTab, setActiveSubTab] = useState<'scanner' | 'midnight' | 'code' | 'guide'>('scanner');

  const sampleBaileysSnippet = `// Implementasi Baileys WhatsApp Gateway & Midnight Dispatcher (Node.js)
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import cron from 'node-cron';

let sock: any = null;

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('baileys-session-personal');
  sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
  });

  sock.ev.on('connection.update', (update: any) => {
    const { connection, lastDisconnect, qr } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) connectToWhatsApp();
    } else if (connection === 'open') {
      console.log('✅ WhatsApp Baileys terhubung ke nomor:', '${senderWhatsApp || '081234567890'}');
    }
  });

  sock.ev.on('creds.update', saveCreds);
  return sock;
}

// ⏰ CRON SCHEDULER: Berjalan tepat pukul 00:00:00 setiap hari
cron.schedule('0 0 0 * * *', async () => {
  console.log('⏰ Jam 00:00 tiba! Mengecek penerima yang berulang tahun hari ini...');
  const todayBirthdays = await getTodayBirthdayCards(); // query database / antrean

  for (const card of todayBirthdays) {
    const jid = \`\${card.recipientPhone.replace(/[^0-9]/g, '')}@s.whatsapp.net\`;
    const message = \`*Selamat Ulang Tahun Pukul 00:00, \${card.recipientName}!* 🎉🎂\\n\\nDi detik pertama hari spesialmu, aku ingin menjadi yang pertama mengucapkan selamat untukmu!\\n\\n🎁 Buka Kartu & Kado Interaktif:\\n👉 \${card.cardUrl}\`;
    
    if (sock) {
      await sock.sendMessage(jid, { text: message });
      console.log(\`✅ Kartu tengah malam berhasil dikirim ke \${card.recipientName}\`);
    }
  }
}, {
  timezone: 'Asia/Jakarta' // WIB (UTC+7)
});`;

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              WhatsApp Baileys & Midnight 00:00 Engine
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mt-1.5 tracking-tight">
            Koneksi WhatsApp Pribadi & Pengiriman Otomatis Pukul 00:00
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Tautkan WhatsApp pribadi Anda melalui Web.whatsapp QR scan untuk mengirimkan tautan kartu ucapan interaktif tepat di detik pertama pukul 00:00 tanggal ulang tahun penerima.
          </p>
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
          <span>Scan QR Web.whatsapp Baileys</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('midnight')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeSubTab === 'midnight'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Pengiriman Tepat Pukul 00:00 (Midnight Surprise)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('code')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
            activeSubTab === 'code'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Kode Node.js Baileys</span>
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
          <span>Panduan Pengiriman</span>
        </button>
      </div>

      {/* TAB 1: WEB.WHATSAPP QR SCANNER */}
      {activeSubTab === 'scanner' && (
        <WhatsAppWebScanner
          currentPhone={senderWhatsApp}
          onUpdatePhone={onUpdateSenderWhatsApp}
          onShowToast={onShowToast}
        />
      )}

      {/* TAB 2: MIDNIGHT 00:00 DISPATCHER */}
      {activeSubTab === 'midnight' && (
        <MidnightDispatcherPanel
          cards={cards}
          onShowToast={onShowToast}
          onPreviewCard={onPreviewCard}
        />
      )}

      {/* TAB 3: CODE IMPLEMENTATION */}
      {activeSubTab === 'code' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-emerald-500" />
              <span>Handler WhatsApp Baileys + Midnight 00:00 Cron Job</span>
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sampleBaileysSnippet);
                onShowToast('Kode Baileys & Cron disalin!');
              }}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 cursor-pointer flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Kode</span>
            </button>
          </div>
          <pre className="p-4 rounded-2xl bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-zinc-800 max-h-80 leading-relaxed">
            {sampleBaileysSnippet}
          </pre>
        </div>
      )}

      {/* TAB 4: GUIDELINES */}
      {activeSubTab === 'guide' && (
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-4 text-xs text-zinc-600 dark:text-zinc-300">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Bagaimana Pengiriman Tepat Pukul 00:00 Bekerja?</span>
          </h4>
          <ol className="list-decimal list-inside space-y-2 leading-relaxed">
            <li>
              <strong>Penyambungan Akun WhatsApp Pribadi:</strong> Melalui protokol WebSocket Multi-Device WhatsApp Web (Baileys), aplikasi ini bertindak sebagai perangkat tertaut resmi seperti browser komputer. Pesan keluar asli berasal dari akun Anda sendiri, bukan bot pihak ketiga.
            </li>
            <li>
              <strong>Sinkronisasi Jam Presisi (00:00:00):</strong> Setiap kartu yang Anda daftarkan memiliki jam kirim yang diatur otomatis ke jam 00:00:00 (tengah malam) waktu setempat (WIB/WITA/WIT). Begitu jam menunjukkan pergantian hari kelahiran, sistem secara instan mengirim pesan personal lengkap dengan link kartu animasi interaktif.
            </li>
            <li>
              <strong>Balasan Langsung Masuk ke HP Anda:</strong> Karena pesan dikirim dari nomor WhatsApp Anda sendiri, setiap kali penerima membalas chat atau mengetuk tombol "Balas Ucapan" di kartu, balasannya akan langsung masuk ke ruang obrolan pribadi Anda di aplikasi WhatsApp ponsel!
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
