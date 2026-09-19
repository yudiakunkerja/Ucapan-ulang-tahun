import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RecipientProfile, WishTone, AISuggestion } from '../types';
import { Sparkles, X, Wand2, RefreshCw, Check, MessageSquareHeart } from 'lucide-react';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSuggestion: (suggestion: AISuggestion) => void;
  initialRecipientName: string;
  initialNickname: string;
  initialProfile: RecipientProfile;
  initialSenderName: string;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSelectSuggestion,
  initialRecipientName,
  initialNickname,
  initialProfile,
  initialSenderName,
}) => {
  const [recipientName, setRecipientName] = useState(initialRecipientName || '');
  const [nickname, setNickname] = useState(initialNickname || '');
  const [profile, setProfile] = useState<RecipientProfile>(initialProfile || 'teman');
  const [tone, setTone] = useState<WishTone>('sentimental');
  const [notes, setNotes] = useState('');
  const [age, setAge] = useState('');
  const [senderName, setSenderName] = useState(initialSenderName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSelectedIdx(null);

    try {
      const response = await fetch('/api/gemini/generate-wishes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          nickname: nickname.trim(),
          relationship: profile,
          tone,
          memoriesOrNotes: notes.trim(),
          senderName: senderName.trim(),
          age: age ? parseInt(age, 10) : undefined,
        }),
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      } else {
        setErrorMsg('Gagal menghasilkan ucapan. Coba beberapa saat lagi.');
      }
    } catch (err: any) {
      setErrorMsg('Terjadi kendala jaringan saat menghubungi server Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChoose = (suggestion: AISuggestion, index: number) => {
    setSelectedIdx(index);
    setTimeout(() => {
      onSelectSuggestion(suggestion);
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 sm:p-7 overflow-hidden my-auto"
      >
        {/* Glow Header background */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-l from-rose-500/20 via-purple-500/20 to-transparent blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="btn-tutup-ai-modal"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Gemini AI Penulis Ucapan</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20">
                Pintar & Kreatif
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Hasilkan ucapan ulang tahun yang menyentuh, personal, dan tidak monoton untuk penerima.
            </p>
          </div>
        </div>

        {/* FORM INPUTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nama Penerima
            </label>
            <input
              id="ai-input-nama-penerima"
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Contoh: Adinda Permatasari"
              className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nama Panggilan Akrab
            </label>
            <input
              id="ai-input-panggilan-akrab"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Contoh: Dinda Sayang / Bro Rian"
              className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Profil Hubungan
            </label>
            <select
              id="ai-select-profil"
              value={profile}
              onChange={(e) => setProfile(e.target.value as RecipientProfile)}
              className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            >
              <option value="pasangan">❤️ Pasangan (Kekasih/Suami/Istri)</option>
              <option value="teman">🎉 Teman Dekat / Sahabat</option>
              <option value="keluarga">🏡 Anggota Keluarga</option>
              <option value="rekan">💼 Rekan Kerja / Kolega</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Gaya & Suasana Pesan (Tone)
            </label>
            <select
              id="ai-select-tone"
              value={tone}
              onChange={(e) => setTone(e.target.value as WishTone)}
              className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            >
              <option value="sentimental">🥺 Menyentuh Hati & Tulus</option>
              <option value="funny">😂 Lucu, Ceria, & Akrab</option>
              <option value="poetic">🌹 Puitis & Romantis Indah</option>
              <option value="blessing">🤲 Penuh Doa Berkah & Syukur</option>
              <option value="formal">👔 Elegan & Profesional</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Kenangan Bersama, Inside Joke, atau Harapan Khusus (Opsional)
            </label>
            <textarea
              id="ai-textarea-catatan-kenangan"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Ingat waktu liburan kita kehujanan di pantai bareng, atau harapan agar promosi jabatannya lancar tahun ini..."
              className="w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none"
            />
          </div>
        </div>

        {/* GENERATE BUTTON */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <p className="text-xs text-zinc-500">
            Powered by Google Gemini 3.8 Flash • Menghasilkan 3 variasi unik
          </p>
          <motion.button
            id="btn-trigger-gemini-ai"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            onClick={handleGenerate}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Merangkai Kata Indah...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Buat Ucapan Sekarang</span>
              </>
            )}
          </motion.button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
            {errorMsg}
          </div>
        )}

        {/* RESULTS SECTION */}
        {suggestions.length > 0 && (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <MessageSquareHeart className="w-4 h-4 text-rose-500" />
              <span>Pilih Ucapan Terbaik:</span>
            </h3>

            {suggestions.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleChoose(item, idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedIdx === idx
                    ? 'border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </h4>
                  <button
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 ${
                      selectedIdx === idx
                        ? 'bg-rose-500 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-rose-500 hover:text-white'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Pakai Ini</span>
                  </button>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed mb-3 line-clamp-3">
                  {item.wishes}
                </p>

                {item.highlightQuote && (
                  <div className="text-xs italic text-rose-600 dark:text-rose-400 border-l-2 border-rose-500 pl-2">
                    "{item.highlightQuote}"
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
