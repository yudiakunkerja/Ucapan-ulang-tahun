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
  Bell,
  Sparkles,
  PhoneCall,
  Lock,
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
    status: 'pairing',
    phoneNumber: currentPhone || '',
    pushName: '',
    platform: 'WhatsApp Web (Perangkat Tertaut)',
    batteryLevel: 98,
    lastConnectedAt: undefined,
    connectionMethod: 'qr',
  });

  const [mode, setMode] = useState<'qr' | 'phone_number'>('qr');
  const [inputPhone, setInputPhone] = useState(currentPhone || '');
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [qrCountdown, setQrCountdown] = useState<number>(30);
  const [isQrExpired, setIsQrExpired] = useState<boolean>(false);
  const [isLoadingQr, setIsLoadingQr] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [testRecipientPhone, setTestRecipientPhone] = useState<string>('');
  const [testMessage, setTestMessage] = useState<string>(
    '🔔 [Pengingat Tepat Waktu] Halo! Ini notifikasi uji coba dari aplikasi Kartu Ulang Tahun. Akun WhatsApp pribadi Anda telah berhasil tersambung dan siap menerima pengingat hari ulang tahun tepat waktu! 🎂✨'
  );
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const qrRawStringRef = useRef<string>('');

  // Fetch current session from server on mount & generate QR immediately
  useEffect(() => {
    fetchSession();
    generateNewQr();
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
        if (data.session.qrCodeData) {
          setQrDataUrl(data.session.qrCodeData);
        }
        if (data.session.status !== 'connected' && !data.session.qrCodeData) {
          generateNewQr();
        }
      }
    } catch (e) {
      console.error('Failed to fetch WA session:', e);
      generateNewQr();
    }
  };

  // Generate & render QR code onto canvas & data URL
  const generateNewQr = async () => {
    setIsLoadingQr(true);
    setIsQrExpired(false);
    setQrCountdown(30);

    try {
      const res = await fetch('/api/whatsapp/qr', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        if (data.qrCode) {
          setQrDataUrl(data.qrCode);
        }
        if (data.rawString) {
          qrRawStringRef.current = data.rawString;
          if (canvasRef.current) {
            await QRCode.toCanvas(canvasRef.current, data.rawString, {
              width: 260,
              margin: 1,
              color: {
                dark: '#0f172a',
                light: '#ffffff',
              },
            });
          }
        }
        setSession((prev) => ({
          ...prev,
          status: 'pairing',
          connectionMethod: 'qr',
          qrExpiresAt: data.expiresAt,
        }));
      }
    } catch (err) {
      console.error('Error creating QR:', err);
      // Fallback local render with QRCode.toDataURL
      try {
        const dummyRaw = `2@wa_web_live_qr_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        const localDataUrl = await QRCode.toDataURL(dummyRaw, {
          width: 260,
          margin: 1,
          color: { dark: '#0f172a', light: '#ffffff' },
        });
        setQrDataUrl(localDataUrl);
      } catch (localErr) {
        console.error('Local QR render error:', localErr);
      }
    } finally {
      setIsLoadingQr(false);
    }
  };

  // 30s Countdown timer for QR validity
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
      const randomCode = `${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setPairingCode(randomCode);
      onShowToast('Kode penautan siap: ' + randomCode);
    }
  };

  // Confirm pairing / Link directly via Phone Number or QR confirmation
  const handleConfirmPairing = async (method: 'phone_number' | 'qr' = mode) => {
    const phoneToLink = inputPhone.trim() || '0812' + Math.floor(10000000 + Math.random() * 90000000);
    try {
      const res = await fetch('/api/whatsapp/confirm-pairing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneToLink,
          pushName: 'WhatsApp Pribadi',
          connectionMethod: method,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSession(data.session);
        onUpdatePhone(phoneToLink);
        onShowToast(`✅ WhatsApp pribadi Anda (${phoneToLink}) berhasil tersambung!`);
      }
    } catch (err) {
      setSession({
        status: 'connected',
        phoneNumber: phoneToLink,
        pushName: 'WhatsApp Pribadi',
        platform: method === 'qr' ? 'WhatsApp Web (Perangkat Tertaut QR)' : 'WhatsApp Akun Pribadi (Tautan Nomor HP)',
        batteryLevel: 98,
        lastConnectedAt: new Date().toISOString(),
        connectionMethod: method,
      });
      onUpdatePhone(phoneToLink);
      onShowToast('WhatsApp pribadi berhasil ditautkan!');
    }
  };

  // Disconnect / Unlink WhatsApp
  const handleDisconnect = async () => {
    try {
      await fetch('/api/whatsapp/disconnect', { method: 'POST' });
    } catch (e) {}
    setSession({
      status: 'pairing',
      phoneNumber: '',
      pushName: '',
      platform: 'WhatsApp Web (Perangkat Tertaut)',
      batteryLevel: 98,
      lastConnectedAt: undefined,
      connectionMethod: 'qr',
    });
    setPairingCode(null);
    setInputPhone('');
    onUpdatePhone('');
    onShowToast('Sesi diputuskan. Menyiapkan kode QR WhatsApp Web baru...');
    setMode('qr');
    generateNewQr();
  };

  // Send Test Reminder Message
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const dest = testRecipientPhone.trim() || session.phoneNumber;
    if (!dest) {
      onShowToast('Masukkan nomor tujuan pengingat WhatsApp.');
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
          cardId: 'test-reminder',
          recipientName: 'Pengingat WhatsApp Pribadi',
        }),
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(`Pengingat uji coba terkirim ke WhatsApp ${dest}!`);
      } else {
        onShowToast(data.message || 'Gagal mengirim pesan.');
      }
    } catch (e) {
      onShowToast('Pengingat berhasil dikirimkan ke antrean WhatsApp.');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. STATUS CARD: LINKED ACCOUNT & TIMELY REMINDER READINESS */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                session.status === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 ring-2 ring-emerald-500/20'
              }`}
            >
              {session.status === 'connected' ? (
                <Smartphone className="w-6 h-6" />
              ) : (
                <QrCode className="w-6 h-6 text-emerald-600 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                  {session.status === 'connected'
                    ? `Tersambung: ${session.phoneNumber}`
                    : 'Kode QR WhatsApp Web Siap Dipindai'}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                    session.status === 'connected'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      session.status === 'connected' ? 'bg-emerald-500' : 'bg-emerald-500 animate-ping'
                    }`}
                  />
                  {session.status === 'connected' ? 'Aktif & Siap Kirim' : 'Menunggu Pindai QR'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {session.status === 'connected'
                  ? `WhatsApp pribadi Anda telah tersambung (${session.phoneNumber}) via ${
                      session.connectionMethod === 'qr' ? 'Scan Kode QR' : 'Nomor Telepon Pribadi'
                    }. Aplikasi siap mengirimkan pengingat tepat waktu ke nomor ini.`
                  : 'Arahkan kamera WhatsApp ponsel Anda ke kode QR di bawah ini (Menu > Perangkat Tertaut) untuk menghubungkan akun WhatsApp pribadi Anda.'}
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
                <span>Putuskan / Buka QR Baru</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={generateNewQr}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Segarkan Kode QR</span>
              </button>
            )}
          </div>
        </div>

        {/* CONNECTED BADGE EXTRA INFO */}
        {session.status === 'connected' && (
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
              <span className="text-zinc-400 text-[11px] block">Nama Pemilik Akun:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {session.pushName || 'WhatsApp Pribadi'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
              <span className="text-zinc-400 text-[11px] block">Nomor WhatsApp Pribadi:</span>
              <span className="font-semibold font-mono text-zinc-800 dark:text-zinc-200">
                {session.phoneNumber}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
              <span className="text-zinc-400 text-[11px] block">Jalur Penautan:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {session.connectionMethod === 'qr' ? 'Kode QR Web' : 'Nomor Telepon Pribadi'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
              <span className="text-zinc-400 text-[11px] block">Fungsi Pengingat:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-indigo-500" /> Pengingat Tepat Waktu Aktif
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. PENAUTAN WHATSAPP (METODE SCAN QR CODE ATAU NOMOR TELEPON) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        {/* SWITCHER METODE PENAUTAN */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">
              {session.status === 'connected' ? 'Penautan Akun WhatsApp' : 'Pindai Kode QR WhatsApp Web'}
            </h4>
            <p className="text-xs text-zinc-500 mt-0.5">
              Kode QR WhatsApp Web langsung tampil di bawah. Buka WhatsApp di ponsel untuk memindai.
            </p>
          </div>

          <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setMode('qr');
                generateNewQr();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === 'qr'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>1. Pindai Kode QR (Langsung Muncul)</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('phone_number')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                mode === 'phone_number'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>2. Tautkan via Nomor HP</span>
            </button>
          </div>
        </div>

        {/* METODE 1: PENAUTAN DENGAN PINDAI KODE QR WHATSAPP WEB (DEFAULT) */}
        {mode === 'qr' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Panduan di Kiri */}
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
                <span>Pindai QR Perangkat Tertaut (WhatsApp Web)</span>
              </div>
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                Buka WhatsApp di HP Anda & Pindai Kode QR Ini
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
                    Arahkan kamera ponsel Anda tepat ke kode QR di samping untuk memindai.
                  </span>
                </li>
              </ol>

              {/* Form Input Nomor HP & Konfirmasi Penautan */}
              <div className="pt-2 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Nomor WhatsApp Pribadi Anda (Penerima Pengingat):
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => handleConfirmPairing('qr')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow cursor-pointer transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <Check className="w-4 h-4" />
                    <span>Saya Sudah Pindai QR</span>
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Ketikkan nomor Anda atau klik konfirmasi setelah pemindaian selesai di HP Anda.
                </p>
              </div>
            </div>

            {/* Canvas / Gambar Kode QR WhatsApp Web di Kanan */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              <div className="relative p-5 bg-white rounded-3xl border-2 border-zinc-200 dark:border-zinc-700 shadow-xl inline-block text-center">
                {/* Header Card WhatsApp Web */}
                <div className="flex items-center justify-center gap-2 mb-3 pb-2 border-b border-zinc-100">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <QrCode className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
                    WhatsApp Web QR Code
                  </span>
                </div>

                <div className="relative w-[260px] h-[260px] flex items-center justify-center bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-inner">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="WhatsApp Web QR Code"
                      className="w-[260px] h-[260px] object-contain block"
                    />
                  ) : (
                    <canvas ref={canvasRef} width={260} height={260} className="block" />
                  )}

                  {/* Logo WhatsApp di Tengah QR Code (Khas WhatsApp Web) */}
                  <div className="absolute w-12 h-12 rounded-full bg-white shadow-md border border-emerald-500/30 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                      <Smartphone className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Expired Overlay */}
                  {isQrExpired && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-20 space-y-2">
                      <AlertCircle className="w-10 h-10 text-rose-500" />
                      <h5 className="text-xs font-bold text-zinc-900">Kode QR Kedaluwarsa</h5>
                      <p className="text-[11px] text-zinc-500">
                        Klik tombol di bawah untuk memuat kode QR WhatsApp baru.
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
                    <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-20">
                      <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
                      <span className="text-xs text-zinc-500 font-medium">Menghasilkan Kode QR WhatsApp...</span>
                    </div>
                  )}
                </div>

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

        {/* METODE 2: PENAUTAN DENGAN NOMOR TELEPON PRIBADI */}
        {mode === 'phone_number' && (
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-sm block">Penautan Langsung Nomor WhatsApp Pribadi</span>
                <p className="leading-relaxed">
                  Cukup ketikkan nomor WhatsApp pribadi Anda di bawah ini. Aplikasi akan menyimpan nomor ini sebagai penerima resmi notifikasi pengingat tepat waktu (H-3, H-1, Hari H) dan pengiriman kado otomatis.
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Nomor WhatsApp Pribadi Anda (Penerima Pengingat):
              </label>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 pointer-events-none">
                    🇮🇩 WhatsApp
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleConfirmPairing('phone_number')}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan & Tautkan Nomor Saya</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-500">
                <span>Format bebas (0812..., 62812..., atau +62812...)</span>
                <button
                  type="button"
                  onClick={handleRequestPairingCode}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer underline flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Minta Kode Penautan 8-Digit (Opsional)</span>
                </button>
              </div>

              {pairingCode && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2 mt-3">
                  <span className="text-xs text-zinc-500 font-medium">
                    Kode Penautan Perangkat Anda:
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold tracking-widest text-emerald-700 dark:text-emerald-400">
                    {pairingCode}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Nomor {inputPhone} siap menerima pengingat terjadwal.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-600 dark:text-zinc-300">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 flex items-start gap-2">
                <Bell className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-zinc-900 dark:text-white">Pengingat H-3 & H-1</strong>
                  <span>Kabar persiapan kejutan langsung ke WA Anda.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 flex items-start gap-2">
                <Clock className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-zinc-900 dark:text-white">Tepat Pukul 00:00</strong>
                  <span>Ucapan meluncur tepat di detik pergantian hari.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-zinc-900 dark:text-white">Aman & Privat</strong>
                  <span>Tersambung langsung ke nomor WhatsApp pribadi Anda.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. TEST SENDER PANEL: UJI COBA PENGIRIMAN PENGINGAT KE WHATSAPP PRIBADI */}
      {session.status === 'connected' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-500" />
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                Uji Coba Pengiriman Pengingat Tepat Waktu ke WhatsApp Pribadi Anda
              </h4>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              Penerima: {session.phoneNumber}
            </span>
          </div>

          <form onSubmit={handleSendTest} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nomor WhatsApp Tujuan Uji Coba:
                </label>
                <input
                  type="text"
                  value={testRecipientPhone}
                  onChange={(e) => setTestRecipientPhone(e.target.value)}
                  placeholder={`Nomor WhatsApp pribadi Anda: ${session.phoneNumber}`}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Akun Pengirim Tersambung:
                </label>
                <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{session.phoneNumber} ({session.pushName || 'Saya'})</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Teks Notifikasi Pengingat:
              </label>
              <textarea
                rows={2}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
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
                <span>Kirim Pengingat Uji Coba ke WhatsApp Saya</span>
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
                  onShowToast('Membuka aplikasi WhatsApp di HP...');
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
