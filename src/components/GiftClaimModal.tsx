import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { GiftReward } from '../types';
import {
  Gift,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Wallet,
  ExternalLink,
  Copy,
  Lock,
  Smartphone,
} from 'lucide-react';

interface GiftClaimModalProps {
  gift: GiftReward;
  recipientName: string;
  expectedPhone: string; // Registered phone number required to claim
  senderName: string;
  onClaimSuccess: (claimedPhone: string) => void;
}

export const GiftClaimModal: React.FC<GiftClaimModalProps> = ({
  gift,
  recipientName,
  expectedPhone,
  senderName,
  onClaimSuccess,
}) => {
  const [phoneNumberInput, setPhoneNumberInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isClaimed, setIsClaimed] = useState(gift.isClaimed || false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Normalize phone number (remove spaces, dashes, +62 -> 0)
  const normalize = (num: string) => {
    let clean = num.replace(/[^0-9]/g, '');
    if (clean.startsWith('62')) {
      clean = '0' + clean.slice(2);
    }
    return clean;
  };

  const handleVerifyAndClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const inputClean = normalize(phoneNumberInput);
    const expectedClean = normalize(expectedPhone);

    if (!inputClean) {
      setErrorMsg('Harap masukkan nomor WhatsApp / E-wallet kamu.');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      // Validate phone number against registered number
      // We allow match if clean versions match or either ends with the other (to handle 08 vs 628)
      const isMatch =
        inputClean === expectedClean ||
        (inputClean.length >= 8 &&
          expectedClean.length >= 8 &&
          (inputClean.endsWith(expectedClean.slice(-9)) ||
            expectedClean.endsWith(inputClean.slice(-9))));

      if (isMatch) {
        setIsClaimed(true);
        onClaimSuccess(phoneNumberInput.trim());

        // Launch celebratory confetti
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#10b981', '#fbbf24', '#e11d48', '#38bdf8'],
        });
      } else {
        setErrorMsg(
          `Nomor ${phoneNumberInput} tidak terdaftar sebagai penerima kado ini. Hadiah ini diproteksi secara khusus hanya untuk nomor yang ditentukan oleh ${senderName}.`
        );
      }
    }, 600);
  };

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const providerLogo = {
    dana: {
      name: 'DANA',
      color: 'from-sky-500 to-blue-600',
      textColor: 'text-sky-600 dark:text-sky-400',
      badgeBg: 'bg-sky-500/10 border-sky-500/30',
      icon: '💙',
    },
    gopay: {
      name: 'GoPay',
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
      icon: '🟢',
    },
    shopeepay: {
      name: 'ShopeePay',
      color: 'from-orange-500 to-amber-600',
      textColor: 'text-orange-600 dark:text-orange-400',
      badgeBg: 'bg-orange-500/10 border-orange-500/30',
      icon: '🟠',
    },
    ovo: {
      name: 'OVO',
      color: 'from-purple-600 to-indigo-700',
      textColor: 'text-purple-600 dark:text-purple-400',
      badgeBg: 'bg-purple-500/10 border-purple-500/30',
      icon: '🟣',
    },
  }[gift.provider] || {
    name: 'E-Wallet',
    color: 'from-rose-500 to-pink-600',
    textColor: 'text-rose-600',
    badgeBg: 'bg-rose-500/10 border-rose-500/30',
    icon: '🎁',
  };

  // Format currency
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(gift.amount);

  // Masked expected phone for hint (e.g., 0812****7890)
  const getMaskedHint = (num: string) => {
    const clean = normalize(num);
    if (clean.length < 8) return clean;
    const prefix = clean.slice(0, 4);
    const suffix = clean.slice(-3);
    return `${prefix}****${suffix}`;
  };

  return (
    <motion.div
      id="gift-reward-section"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-purple-500/10 dark:from-amber-950/30 dark:via-rose-950/20 dark:to-purple-950/30 backdrop-blur-xl rounded-3xl border-2 border-amber-400/40 dark:border-amber-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden"
    >
      {/* Decorative background ribbons */}
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-rose-500/20 blur-2xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-amber-200/50 dark:border-amber-800/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Gift className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Kado Kejutan dari {senderName}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white font-serif">
              Hadiah Saldo {providerLogo.name} Spesial 🎁
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Proteksi Nomor Terdaftar</span>
        </div>
      </div>

      {/* Main Claim Interface */}
      <AnimatePresence mode="wait">
        {!isClaimed ? (
          <motion.div
            key="unclaimed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Gift Preview Box */}
            <div className="bg-white/90 dark:bg-zinc-900/90 rounded-2xl p-5 border border-amber-200 dark:border-amber-900/50 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <span className="text-4xl">{providerLogo.icon}</span>
                <div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    Total Kado Saldo Ulang Tahun:
                  </div>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 font-serif">
                    {formattedAmount}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 italic">
                    "{gift.note}"
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 text-center">
                <span className="text-[11px] block text-amber-800 dark:text-amber-300 font-medium">
                  Aplikasi E-Wallet
                </span>
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                  {providerLogo.name} Transfer
                </span>
              </div>
            </div>

            {/* Security Verification Form */}
            <div className="bg-white/80 dark:bg-zinc-800/70 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-700 shadow-md">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Verifikasi Kepemilikan Hadiah
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Untuk memastikan hadiah ini aman dan tidak diambil sembarang orang, masukkan nomor HP
                    terdaftarmu (Petunjuk: <b>{getMaskedHint(expectedPhone)}</b>).
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyAndClaim} className="space-y-4">
                <div>
                  <label
                    htmlFor="input-nomor-klaim"
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    Nomor WhatsApp / {providerLogo.name} Kamu:
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <input
                      id="input-nomor-klaim"
                      type="tel"
                      value={phoneNumberInput}
                      onChange={(e) => {
                        setPhoneNumberInput(e.target.value);
                        setErrorMsg(null);
                      }}
                      placeholder="Contoh: 081234567890"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                <button
                  id="btn-klaim-kado"
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-60"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memverifikasi Nomor...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4" />
                      <span>Verifikasi & Ambil Kado Sekarang 🎁</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          /* CLAIMED SUCCESS STATE */
          <motion.div
            key="claimed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/95 dark:bg-zinc-900/95 rounded-2xl p-6 border-2 border-emerald-500/50 shadow-2xl space-y-6"
          >
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-400 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shadow-lg mb-3">
                <CheckCircle2 className="w-8 h-8 animate-pulse" />
              </div>
              <h4 className="text-2xl font-extrabold text-zinc-900 dark:text-white font-serif">
                Selamat, Kado Siap Diambil! 🎉
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                Nomor kamu terverifikasi resmi. Saldo <b>{formattedAmount}</b> dari {senderName} sudah siap masuk ke akun <b>{providerLogo.name}</b> kamu!
              </p>
            </div>

            {/* Transfer details card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-300 dark:border-emerald-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>E-Wallet Pengirim ({senderName}):</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">
                  {gift.senderWalletNumber || '0812-XXXX-XXXX'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>Penerima Sah:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {recipientName} ({phoneNumberInput || expectedPhone})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>Jumlah Kado:</span>
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formattedAmount}
                </span>
              </div>
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 text-xs italic text-zinc-600 dark:text-zinc-300">
                "{gift.note}"
              </div>
            </div>

            {/* Direct Action Buttons for DANA / Gopay */}
            <div className="space-y-3">
              {gift.deeplinkUrl ? (
                <a
                  id="btn-buka-aplikasi-ewallet"
                  href={gift.deeplinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Buka Aplikasi {providerLogo.name} & Terima Saldo</span>
                </a>
              ) : (
                <a
                  id="btn-klaim-via-whatsapp"
                  href={`https://wa.me/${gift.senderWalletNumber?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(
                    `Halo ${senderName}! Aku sudah membuka kado ulang tahun darimu dan memverifikasi nomorku (${phoneNumberInput || expectedPhone}) di kartu ucapan! Makasih banyak ya untuk kado saldo ${providerLogo.name} sebesar ${formattedAmount}! ❤️🎂`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Konfirmasi Penerimaan Kado ke WhatsApp {senderName}</span>
                </a>
              )}

              <button
                id="btn-salin-kode-kado"
                onClick={() =>
                  handleCopyLink(
                    `KADO ULANG TAHUN DARI ${senderName}: Saldo ${providerLogo.name} ${formattedAmount} untuk ${recipientName} (${phoneNumberInput || expectedPhone}). Kode Hadiah: KADO-${gift.amount}-${Date.now().toString().slice(-4)}`
                  )
                }
                className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? '✓ Bukti Kado Tersalin!' : 'Salin Detail Bukti Hadiah'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
