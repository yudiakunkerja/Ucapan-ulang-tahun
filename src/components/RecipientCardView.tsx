import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { GreetingCard, RecipientResponse } from '../types';
import { THEMES, MUSIC_PRESETS } from '../data/themes';
import { FloatingParticles } from './FloatingParticles';
import { InteractiveCake } from './InteractiveCake';
import { PhotoCarousel } from './PhotoCarousel';
import { GiftClaimModal } from './GiftClaimModal';
import { FireworksCelebration } from './FireworksCelebration';
import { birthdayAudio } from '../utils/audioSynthesizer';
import { MusicPresetId } from '../types';
import {
  Gift,
  Mail,
  Heart,
  Music,
  Volume2,
  VolumeX,
  Share2,
  Send,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  PartyPopper,
  MessageCircle,
  Flame,
} from 'lucide-react';

interface RecipientCardViewProps {
  card: GreetingCard;
  onBackToDashboard?: () => void;
  onAddResponse?: (cardId: string, response: RecipientResponse) => void;
}

export const RecipientCardView: React.FC<RecipientCardViewProps> = ({
  card,
  onBackToDashboard,
  onAddResponse,
}) => {
  const theme = THEMES[card.profile] || THEMES.teman;
  const musicPreset = MUSIC_PRESETS[card.musicPreset] || MUSIC_PRESETS.birthday_musicbox;

  // Surprise phases: 'sealed' -> 'opened'
  const [isOpened, setIsOpened] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activePreset, setActivePreset] = useState<MusicPresetId>(card.musicPreset || 'birthday_musicbox');
  const [cakeBlown, setCakeBlown] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  // Response form
  const [replyText, setReplyText] = useState('');
  const [replyEmoji, setReplyEmoji] = useState('❤️');
  const [replySubmitted, setReplySubmitted] = useState(false);

  // Start background music and fireworks on open
  const handleOpenSurprise = () => {
    setIsOpened(true);
    setShowFireworks(true);
    birthdayAudio.playConfettiPop();
    birthdayAudio.playBackgroundMusic(activePreset);
    setIsPlayingMusic(true);

    // Multi-stage celebratory confetti explosion
    const count = 220;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 100,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 30,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleToggleMusic = () => {
    if (isPlayingMusic) {
      birthdayAudio.stopBackgroundMusic();
      setIsPlayingMusic(false);
    } else {
      birthdayAudio.playBackgroundMusic(activePreset);
      setIsPlayingMusic(true);
    }
  };

  const handleToggleMute = () => {
    const muted = birthdayAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleFireworks = () => {
    setShowFireworks((prev) => !prev);
  };

  const handleChangePreset = (newPreset: MusicPresetId) => {
    setActivePreset(newPreset);
    birthdayAudio.playBackgroundMusic(newPreset);
    setIsPlayingMusic(true);
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newReply: RecipientResponse = {
      id: `resp-${Date.now()}`,
      sender: card.nickname || card.recipientName,
      text: replyText.trim(),
      timestamp: 'Baru saja',
      emoji: replyEmoji,
    };

    if (onAddResponse) {
      onAddResponse(card.id, newReply);
    }

    setReplySubmitted(true);
  };

  // WhatsApp reply link to sender / admin
  const generateWhatsAppReplyLink = () => {
    const defaultText = `Halo ${card.senderName}! Makasih banyak ya untuk kartu ucapan selamat ulang tahunnya yang luar biasa keren dan menyentuh hati! Aku seneng banget liat animasi, lilin, dan foto-fotonya! ❤️🎂`;
    const targetNumber = (card.senderWhatsApp || card.whatsappNumber || '').replace(/[^0-9]/g, '');
    return `https://wa.me/${targetNumber}?text=${encodeURIComponent(replyText.trim() || defaultText)}`;
  };

  useEffect(() => {
    return () => {
      birthdayAudio.stopBackgroundMusic();
    };
  }, []);

  return (
    <div
      className={`min-h-screen w-full max-w-full relative overflow-x-hidden transition-colors duration-500 bg-gradient-to-br ${theme.colors.bgGradientLight} dark:${theme.colors.bgGradientDark} text-zinc-900 dark:text-zinc-100 flex flex-col justify-between`}
    >
      {/* Dynamic Floating Particles based on recipient theme */}
      <FloatingParticles type={theme.particles} count={28} />

      {/* FLOATING TOP CONTROLS */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/60 dark:bg-zinc-950/60 border-b border-zinc-200/50 dark:border-zinc-800/50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {onBackToDashboard ? (
            <button
              id="btn-kembali-ke-dashboard"
              onClick={() => {
                birthdayAudio.stopBackgroundMusic();
                onBackToDashboard();
              }}
              className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 text-xs font-semibold shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Dashboard</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500">
              <Sparkles className="w-4 h-4" />
              <span>Kartu Ucapan Spesial</span>
            </div>
          )}

          {/* Music Controller & Badge */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 text-xs font-medium border border-rose-500/20">
              <span>Tema: {theme.label}</span>
            </div>

            {/* Fireworks Toggle Button */}
            <button
              id="btn-toggle-kembang-api"
              onClick={handleToggleFireworks}
              className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                showFireworks
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-transparent shadow-amber-500/25 animate-pulse'
                  : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 hover:border-amber-400'
              }`}
              title="Nyalakan / Matikan Kembang Api"
            >
              <Sparkles className={`w-3.5 h-3.5 ${showFireworks ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">{showFireworks ? 'Kembang Api 🎆' : 'Kembang Api ✨'}</span>
            </button>

            {/* Audio Toggle button */}
            <div className="flex items-center gap-1">
              <button
                id="btn-toggle-musik-kartu"
                onClick={handleToggleMusic}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                  isPlayingMusic
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700'
                }`}
                title="Putar / Hentikan Musik"
              >
                <Music
                  className={`w-3.5 h-3.5 ${isPlayingMusic ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '4s' }}
                />
                <span className="hidden xs:inline">
                  {isPlayingMusic ? 'Musik Aktif' : 'Putar Musik'}
                </span>
              </button>

              <button
                id="btn-toggle-mute-kartu"
                onClick={handleToggleMute}
                className="w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center cursor-pointer shadow-sm"
                title={isMuted ? 'Nyalakan Suara' : 'Bisukan'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-3xl mx-auto w-full z-10">
        <AnimatePresence mode="wait">
          {/* PHASE 1: UNOPENED GIFT BOX / ENVELOPE SURPRISE */}
          {!isOpened ? (
            <motion.div
              key="unopened"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(8px)' }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center my-auto py-12"
            >
              {/* Badge */}
              <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md shadow-md border border-rose-200 dark:border-rose-900/50 text-xs font-bold text-rose-600 dark:text-rose-400">
                <PartyPopper className="w-4 h-4 animate-bounce" />
                <span>Ada Kejutan Spesial Ulang Tahun Untukmu!</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white font-serif tracking-tight mb-2">
                Halo, {card.nickname || card.recipientName}! ✨
              </h1>

              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-md mx-auto mb-8">
                {card.senderName} telah menyiapkan kado ucapan selamat ulang tahun yang sangat
                spesial dan berkesan untukmu.
              </p>

              {/* INTERACTIVE GIFT BOX / ENVELOPE */}
              <motion.div
                id="interactive-surprise-box"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenSurprise}
                className="relative cursor-pointer group my-4 p-8 rounded-3xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-2 border-dashed border-rose-300 dark:border-rose-700 shadow-2xl flex flex-col items-center"
              >
                {/* Glow ring */}
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-rose-500 via-amber-400 to-purple-500 opacity-40 blur-xl group-hover:opacity-75 transition-opacity" />

                {card.surpriseType === 'envelope' ? (
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    className="relative w-36 h-36 rounded-3xl bg-gradient-to-br from-amber-400 via-rose-500 to-rose-600 flex items-center justify-center text-white shadow-2xl"
                  >
                    <Mail className="w-16 h-16 drop-shadow" />
                    <div className="absolute -bottom-2 w-8 h-8 rounded-full bg-amber-300 border-2 border-white shadow-lg flex items-center justify-center text-rose-700 font-bold text-xs">
                      💌
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, -2, 2, 0],
                    }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="relative w-36 h-36 rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 flex items-center justify-center text-white shadow-2xl"
                  >
                    <Gift className="w-16 h-16 drop-shadow animate-pulse" />
                    {/* Ribbon */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-4 bg-amber-300/80 shadow-sm" />
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 bg-amber-300/80 shadow-sm" />
                  </motion.div>
                )}

                <div className="mt-6 z-10">
                  <span className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-600/30 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Ketuk untuk Membuka Kejutan! 🎁</span>
                  </span>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* PHASE 2: OPENED FULL EXPERIENCE */
            <motion.div
              key="opened"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: 'spring', damping: 20 }}
              className="w-full space-y-8"
            >
              {/* SECTION 1: INTERACTIVE CAKE & CANDLE */}
              <div className="w-full bg-white/75 dark:bg-zinc-900/75 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-zinc-800 shadow-2xl overflow-hidden p-6 sm:p-8">
                <InteractiveCake
                  recipientName={card.nickname || card.recipientName}
                  themeColor={theme.colors.primary}
                  onBlownOut={() => {
                    setCakeBlown(true);
                    setShowFireworks(true);
                  }}
                />
              </div>

              {/* SECTION 2: PERSONAL TOUCHING LETTER */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl rounded-3xl border border-rose-200/60 dark:border-rose-900/40 shadow-2xl p-6 sm:p-10 relative overflow-hidden"
              >
                {/* Decorative corner florals/hearts */}
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-rose-500/10 blur-xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />

                {/* Card Title */}
                <div className="mb-6 text-center border-b border-zinc-200/60 dark:border-zinc-800 pb-4">
                  <div className="inline-block px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-xs tracking-wider uppercase mb-2">
                    Surat Ulang Tahun Spesial
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white font-serif tracking-tight">
                    {card.cardTitle}
                  </h2>
                </div>

                {/* Main Wishes Text */}
                <div className="space-y-4 text-zinc-700 dark:text-zinc-200 text-base sm:text-lg leading-relaxed font-sans font-normal whitespace-pre-line px-2 sm:px-4">
                  {card.message}
                </div>

                {/* Highlight Quote Banner */}
                {card.highlightQuote && (
                  <div className="my-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border-l-4 border-rose-500 dark:border-rose-400">
                    <p className="italic font-serif text-rose-950 dark:text-rose-200 text-sm sm:text-base text-center leading-relaxed">
                      "{card.highlightQuote}"
                    </p>
                  </div>
                )}

                {/* Sender Sign-off */}
                <div className="mt-8 pt-4 flex flex-col items-end border-t border-zinc-200/60 dark:border-zinc-800 pr-2">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Dengan segenap cinta & doa,
                  </span>
                  <span className="text-lg font-bold font-serif text-rose-600 dark:text-rose-400 mt-1">
                    {card.senderName}
                  </span>
                </div>
              </motion.div>

              {/* SECTION 3: MEMORY PHOTO GALLERY POLAROID */}
              {card.photos && card.photos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="w-full bg-white/75 dark:bg-zinc-900/75 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-zinc-800 shadow-2xl p-6 sm:p-8"
                >
                  <PhotoCarousel photos={card.photos} recipientName={card.recipientName} />
                </motion.div>
              )}

              {/* SECTION 4: SECURE E-WALLET GIFT REWARD (DANA / GOPAY) */}
              {card.giftReward && card.giftReward.enabled && (
                <GiftClaimModal
                  gift={card.giftReward}
                  recipientName={card.nickname || card.recipientName}
                  expectedPhone={card.whatsappNumber}
                  senderName={card.senderName}
                  onClaimSuccess={(claimedPhone) => {
                    if (onAddResponse) {
                      onAddResponse(card.id, {
                        id: `resp-gift-${Date.now()}`,
                        sender: card.nickname || card.recipientName,
                        text: `Telah berhasil mengklaim kado ${card.giftReward?.provider.toUpperCase()} sebesar Rp ${card.giftReward?.amount.toLocaleString('id-ID')} dengan nomor terdaftar ${claimedPhone}.`,
                        timestamp: 'Baru saja',
                        emoji: '🎁',
                      });
                    }
                  }}
                />
              )}

              {/* SECTION 5: REPLY & BALAS KE PENGIRIM VIA WHATSAPP */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full bg-gradient-to-br from-white/90 to-rose-50/90 dark:from-zinc-900/90 dark:to-zinc-950/90 backdrop-blur-xl rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-2xl p-6 sm:p-8"
              >
                <div className="text-center max-w-lg mx-auto mb-6">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                    Balas Pesan ke {card.senderName}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Kirimkan ucapan terima kasih atau kesanmu langsung melalui WhatsApp atau
                    tinggalkan doa di kartu ini!
                  </p>
                </div>

                {!replySubmitted ? (
                  <form onSubmit={handleSubmitReply} className="space-y-4 max-w-md mx-auto">
                    <div>
                      <div className="flex gap-2 justify-center mb-3">
                        {['❤️', '🥰', '🥺', '🎉', '🙏', '🥂'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setReplyEmoji(emoji)}
                            className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-transform cursor-pointer ${
                              replyEmoji === emoji
                                ? 'bg-rose-500/20 ring-2 ring-rose-500 scale-110'
                                : 'bg-zinc-100 dark:bg-zinc-800 hover:scale-105'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      <textarea
                        id="textarea-balasan-penerima"
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Tulis balasanmu untuk ${card.senderName}...`}
                        className="w-full px-4 py-3 rounded-2xl text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none shadow-sm"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        id="btn-kirim-balasan-kartu"
                        type="submit"
                        className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        <span>Simpan Doa di Kartu</span>
                      </button>

                      <a
                        id="btn-balas-via-whatsapp"
                        href={generateWhatsAppReplyLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors text-center"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Balas via WhatsApp</span>
                      </a>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
                    <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                      Balasanmu Tersimpan!
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 mb-4">
                      Terima kasih sudah memberikan doa dan kesan balasan.
                    </p>
                    <a
                      href={generateWhatsAppReplyLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Kirimkan juga ke WhatsApp {card.senderName}</span>
                    </a>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="py-6 px-4 text-center text-xs text-zinc-500 dark:text-zinc-400 z-10">
        <p>
          Dibuat dengan segenap cinta & perhatian menggunakan Aplikasi Ucapan Ulang Tahun Personal
          ✨
        </p>
      </footer>

      {/* CELEBRATORY FIREWORKS CANVAS ANIMATION */}
      {showFireworks && (
        <FireworksCelebration
          active={showFireworks}
          intensity={cakeBlown ? 'high' : 'medium'}
        />
      )}
    </div>
  );
};
