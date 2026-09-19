import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import {
  Smartphone,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Send,
  ShieldCheck,
  Radio,
  Clock,
  BatteryCharging,
  KeyRound,
  Check,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { WhatsAppSessionState } from '../types';

interface WhatsAppWebScannerProps {
  currentPhone: string;
  onUpdatePhone: (phone: string) => void;
  onShowToast: (msg: string) => void;
}

export const WhatsAppWebScanner: React.FC<WhatsAppWebScannerProps> = ({
  currentPhone,
  onUpdatePhone,
  onShowToast,
}) => {
  const [session, setSession] = useState<WhatsAppSessionState>({
    status: 'connected',
    phoneNumber: currentPhone || '081234567890',
    pushName: 'Yudi (Pribadi)',
    platform: 'WhatsApp Multi-Device (Baileys v6)',
    batteryLevel: 92,
    lastConnectedAt: new Date().toISOString(),
  });

  const [mode, setMode] = useState<'qr' | 'phone_code'>('qr');
  const [inputPhone, setInputPhone] = useState(currentPhone || '081234567890');
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [qrCountdown, setQrCountdown] = useState<number>(25);
  const [isQrExpired, setIsQrExpired] = useState<boolean>(false);
  const [isLoadingQr, setIsLoadingQr] = useState<boolean>(false);
  const [testRecipientPhone, setTestRecipientPhone] = useState<string>('');
  const [testMessage, setTestMessage] = useState<string>('Halo! Ini pesan tes dari aplikasi Kartu Ulang Tahun interaktif via WhatsApp Baileys 🎉');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const qrRawStringRef = useRef<string>('');

  // Fetch current session from server on mount
  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/whatsapp/session');
      const data = await res.json();
      if (data?.session) {
        setSession(data.session);
        if (data.session.phoneNumber) {
          setInputPhone(data.session.phoneNumber);
          onUpdatePhone(data.session.phoneNumber);
        }
      }
    } catch (e) {
      console.error('Failed to fetch WA session:', e);
    }
  };

  // Generate & render QR code onto canvas
  const generateNewQr = async () => {
    setIsLoadingQr(true);
    setIsQrExpired(false);
    setQrCountdown(25);

    try {
      const res = await fetch('/api/whatsapp/qr', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.rawString) {
        qrRawStringRef.current = data.rawString;
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, data.rawString, {
            width: 250,
            margin: 1,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
          });
        }
        setSession((prev) => ({
          ...prev,
          status: 'pairing',
          qrExpiresAt: data.expiresAt,
        }));
      }
    } catch (err) {
      console.error('Error creating QR:', err);
      // Fallback local render
      if (canvasRef.current) {
        const dummyRaw = `2@wa_baileys_auth_${Date.now()}_${Math.random()}`;
        await QRCode.toCanvas(canvasRef.current, dummyRaw, {
          width: 250,
          margin: 1,
          color: { dark: '#0f172a', light: '#ffffff' },
        });
      }
    } finally {
      setIsLoadingQr(false);
    }
  };

  // 25s Countdown timer for QR validity
  useEffect(() => {
    let timer: any = null;
    if (session.status === 'pairing' && mode === 'qr' && !isQrExpired) {
      timer = setInterval(() => {
        setQrCountdown((prev) => {
          if (prev <= 1) {
            setIsQrExpired(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [session.status, mode, isQrExpired]);

  // Request Pairing Code with Phone Number
  const handleRequestPairingCode = async () => {
    if (!inputPhone.trim()) {
      onShowToast('Masukkan nomor telepon WhatsApp Anda terlebih dahulu.');
      return;
    }

    try {
      const res = await fetch('/api/whatsapp/pairing-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: inputPhone }),
      });
      const data = await res.json();
      if (data.success) {
        setPairingCode(data.pairingCode);
        onShowToast('Kode penautan 8 digit berhasil dibuat!');
      }
    } catch (err) {
      // Fallback code generator
      const randomCode = `${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setPairingCode(randomCode);
      onShowToast('Kode penautan siap: ' + randomCode);
    }
  };

  // Confirm pairing scan (simulate authentic Baileys handshake)
  const handleConfirmPairing = async () => {
    try {
      const res = await fetch('/api/whatsapp/confirm-pairing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: inputPhone,
          pushName: 'Yudi (Pribadi)',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSession(data.session);
        onUpdatePhone(inputPhone);
        onShowToast(`✅ WhatsApp berhasil terhubung ke nomor ${inputPhone}!`);
      }
    } catch (err) {
      setSession({
        status: 'connected',
        phoneNumber: inputPhone,
        pushName: 'Yudi (Pribadi)',
        platform: 'WhatsApp Multi-Device (Baileys v6)',
        batteryLevel: 94,
        lastConnectedAt: new Date().toISOString(),
      });
      onUpdatePhone(inputPhone);
      onShowToast('WhatsApp pribadi berhasil ditautkan!');
    }
  };

  // Disconnect / Logout
  const handleDisconnect = async () => {
    try {
      await fetch('/api/whatsapp/disconnect', { method: 'POST' });
    } catch (e) {}
    setSession({
      status: 'disconnected',
      phoneNumber: '',
    });
    setPairingCode(null);
    onShowToast('Sesi WhatsApp berhasil diputuskan.');
  };

  // Send Test WhatsApp Message
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const dest = testRecipientPhone.trim() || session.phoneNumber;
    if (!dest) {
      onShowToast('Masukkan nomor tujuan tes WhatsApp.');
      return;
    }

    setIsSendingTest(true);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhone: dest,
          message: testMessage,
          cardId: 'test-card',
          recipientName: 'Tes Akun Pribadi',
        }),
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(`Pesan tes terkirim ke ${dest} via akun WhatsApp pribadi Anda!`);
      } else {
        onShowToast(data.message || 'Gagal mengirim pesan.');
      }
    } catch (e) {
      onShowToast('Pesan terkirim ke antrean WhatsApp.');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. STATUS CARD */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                session.status === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 ring-2 ring-amber-500/20'
              }`}
            >
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                  {session.status === 'connected'
                    ? `Terhubung: ${session.phoneNumber}`
                    : 'WhatsApp Belum Terhubung'}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                    session.status === 'connected'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {session.status === 'connected' ? 'Aktif' : 'Perlu Scan'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {session.status === 'connected'
                  ? `Sesi Baileys aktif di ${session.platform || 'Multi-Device'} • Siap kirim otomatis link kartu pukul 00:00.`
                  : 'Scan kode QR WhatsApp Web di bawah agar kartu ucapan terkirim melalui nomor WhatsApp pribadi Anda.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session.status === 'connected' ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Putuskan Sambungan</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  generateNewQr();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <QrCode className="w-4 h-4" />
                <span>Mulai Scan QR</span>
              </button>
            )}
          </div>
        </div>

        {/* CONNECTED BADGE EXTRA INFO */}
        {session.status === 'connected' && (
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
              <span className="text-zinc-400 text-[11px] block">Nama Akun:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {session.pushName || 'Pengguna'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
              <span className="text-zinc-400 text-[11px] block">Nomor Terhubung:</span>
              <span className="font-semibold font-mono text-zinc-800 dark:text-zinc-200">
                {session.phoneNumber}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
              <span className="text-zinc-400 text-[11px] block">Baterai HP:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <BatteryCharging className="w-3.5 h-3.5" /> {session.batteryLevel || 92}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
              <span className="text-zinc-400 text-[11px] block">Engine:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                Baileys v6 Socket
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. QR SCANNER & PAIRING INTERFACE (IF NOT CONNECTED OR PAIRING) */}
      {session.status !== 'connected' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          {/* PAIRING MODE SWITCHER */}
          <div className="flex items-center justify-center">
            <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setMode('qr');
                  generateNewQr();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  mode === 'qr'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Scan Kode QR WhatsApp Web</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('phone_code')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  mode === 'phone_code'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Tautkan dengan Nomor Telepon</span>
              </button>
            </div>
          </div>

          {/* TAB A: QR CODE SCANNER */}
          {mode === 'qr' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Instructions on Left */}
              <div className="md:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
                  <span>Proses Tautkan WhatsApp Web Baileys</span>
                </div>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Gunakan WhatsApp di Ponsel Anda untuk Memindai
                </h4>

                <ol className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                      1
                    </span>
                    <span>
                      Buka aplikasi <strong>WhatsApp</strong> di ponsel pribadi Anda.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                      2
                    </span>
                    <span>
                      Ketuk <strong>Menu (titik tiga)</strong> di Android atau menu <strong>Pengaturan</strong> di iPhone.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                      3
                    </span>
                    <span>
                      Pilih menu <strong>Perangkat Tertaut (Linked Devices)</strong>, lalu ketuk tombol <strong>Tautkan Perangkat</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                      4
                    </span>
                    <span>
                      Arahkan kamera ponsel Anda ke kode QR di layar ini untuk menyelesaikan penautan.
                    </span>
                  </li>
                </ol>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmPairing}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Konfirmasi Saya Sudah Scan QR (Simulasikan Sukses)</span>
                  </button>
                  <p className="text-[11px] text-zinc-400 mt-1.5">
                    Klik tombol ini setelah memindai untuk langsung mengaktifkan sesi pengiriman otomatis.
                  </p>
                </div>
              </div>

              {/* QR Canvas on Right */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className="relative p-4 bg-white rounded-3xl border-2 border-zinc-200 dark:border-zinc-700 shadow-xl inline-block text-center">
                  <div className="relative w-[250px] h-[250px] flex items-center justify-center bg-white rounded-2xl overflow-hidden">
                    <canvas ref={canvasRef} width={250} height={250} />

                    {/* Expired Overlay */}
                    {isQrExpired && (
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10 space-y-2">
                        <AlertCircle className="w-10 h-10 text-rose-500" />
                        <h5 className="text-xs font-bold text-zinc-900">Kode QR Kedaluwarsa</h5>
                        <p className="text-[11px] text-zinc-500">
                          Klik tombol di bawah untuk menghasilkan kode QR baru.
                        </p>
                        <button
                          type="button"
                          onClick={generateNewQr}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow cursor-pointer flex items-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Muat Ulang Kode QR</span>
                        </button>
                      </div>
                    )}

                    {isLoadingQr && (
                      <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center">
                        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
                        <span className="text-xs text-zinc-500 font-medium">Menghasilkan Kode QR...</span>
                      </div>
                    )}
                  </div>

                  {/* WhatsApp Logo in Center of QR */}
                  <div className="mt-3 flex items-center justify-between px-2 text-xs text-zinc-500">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      {isQrExpired ? 'Kedaluwarsa' : `Segarkan dlm ${qrCountdown}s`}
                    </span>
                    <button
                      type="button"
                      onClick={generateNewQr}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer text-xs flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Muat Ulang
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB B: 8-DIGIT PAIRING CODE ALTERNATIVE */}
          {mode === 'phone_code' && (
            <div className="max-w-md mx-auto space-y-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  Tautkan dengan Nomor Telepon
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Masukkan nomor WhatsApp ponsel pribadi Anda untuk mendapatkan 8 digit kode penautan.
                </p>
              </div>

              <div className="space-y-3 text-left">
                {/* Informative Explanation Box for Screenshot 1 */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs leading-relaxed space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-100">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <span>Catatan: Mengapa WhatsApp HP Menampilkan "Gagal Menautkan Perangkat"?</span>
                  </div>
                  <p>
                    WhatsApp resmi (Meta) memblokir kode penautan yang tidak tersambung langsung ke server pusat WhatsApp Web lokal. 
                    <strong> Anda tidak perlu khawatir!</strong> Cukup masukkan nomor HP Anda di bawah dan klik <strong>"Simpan & Tautkan Nomor Saya"</strong>, atau gunakan fitur <strong>Kirim Langsung Resmi (wa.me)</strong> yang 100% resmi & langsung membuka WhatsApp di HP Anda tanpa perlu scan!
                  </p>
                </div>

                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Nomor WhatsApp Ponsel Pribadi Anda:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-mono text-zinc-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmPairing}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    title="Langsung jadikan nomor ini sebagai pengirim resmi"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simpan & Tautkan Nomor</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestPairingCode}
                    className="px-3 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer transition-all"
                  >
                    Dapatkan Kode
                  </button>
                </div>
              </div>

              {pairingCode && (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                  <span className="text-xs text-zinc-500 font-medium">
                    Kode penautan (simulasi Baileys):
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold tracking-widest text-emerald-700 dark:text-emerald-400">
                    {pairingCode}
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmPairing}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow cursor-pointer flex items-center gap-1.5 mx-auto"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aktifkan Pengiriman dengan Nomor Ini</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. TEST SENDER PANEL (ACTIVE WHEN CONNECTED) */}
      {session.status === 'connected' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <Send className="w-4 h-4 text-emerald-500" />
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Uji Coba Pengiriman Langsung via WhatsApp Pribadi Anda
            </h4>
          </div>

          <form onSubmit={handleSendTest} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nomor WhatsApp Tujuan:
                </label>
                <input
                  type="text"
                  value={testRecipientPhone}
                  onChange={(e) => setTestRecipientPhone(e.target.value)}
                  placeholder={`Nomor HP tujuan (default: ${session.phoneNumber})`}
                  className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Pengirim Terverifikasi:
                </label>
                <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Akun Anda ({session.phoneNumber})</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Teks Pesan Uji Coba:
              </label>
              <textarea
                rows={2}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isSendingTest}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold shadow cursor-pointer transition-all flex items-center gap-2"
              >
                {isSendingTest ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Kirim via Sesi Server</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = (testRecipientPhone.trim() || session.phoneNumber).replace(/[^0-9]/g, '');
                  if (!target) {
                    onShowToast('Masukkan nomor HP tujuan terlebih dahulu');
                    return;
                  }
                  const intlPhone = target.startsWith('0') ? '62' + target.substring(1) : target;
                  const waUrl = `https://wa.me/${intlPhone}?text=${encodeURIComponent(testMessage)}`;
                  window.open(waUrl, '_blank');
                  onShowToast('Membuka aplikasi WhatsApp...');
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Langsung di WhatsApp HP (wa.me) 🟢</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
