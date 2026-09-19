import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GreetingCard,
  RecipientProfile,
  MusicPresetId,
  SurpriseType,
  MemoryPhoto,
  AISuggestion,
  GiftReward,
  EWalletProvider,
} from '../types';
import { THEMES, MUSIC_PRESETS } from '../data/themes';
import { AIGeneratorModal } from './AIGeneratorModal';
import { WhatsAppGatewaySettings } from './WhatsAppGatewaySettings';
import { DailyShareModal } from './DailyShareModal';
import { birthdayAudio } from '../utils/audioSynthesizer';
import {
  Heart,
  Sparkles,
  Home,
  Briefcase,
  Plus,
  Calendar,
  Clock,
  Send,
  Eye,
  Trash2,
  Edit3,
  Copy,
  Check,
  Music,
  Camera,
  Upload,
  MessageSquare,
  Gift,
  Mail,
  Volume2,
  VolumeX,
  Square,
  Pause,
  Share2,
  ExternalLink,
  MessageCircle,
  Wallet,
  ShieldCheck,
} from 'lucide-react';

interface DashboardViewProps {
  cards: GreetingCard[];
  onSaveCard: (card: GreetingCard) => void;
  onDeleteCard: (id: string) => void;
  onPreviewCard: (card: GreetingCard) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cards,
  onSaveCard,
  onDeleteCard,
  onPreviewCard,
}) => {
  // Navigation Tabs: 'editor' | 'schedule' | 'inbox' | 'whatsapp'
  const [activeTab, setActiveTab] = useState<'editor' | 'schedule' | 'inbox' | 'whatsapp'>('editor');
  const [sharingCard, setSharingCard] = useState<GreetingCard | null>(null);

  // Form State
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [nickname, setNickname] = useState('');
  const [profile, setProfile] = useState<RecipientProfile>('pasangan');
  const [birthDate, setBirthDate] = useState('2026-09-20');
  const [scheduledDeliveryDate, setScheduledDeliveryDate] = useState('2026-09-20T00:00');
  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('6281234567890');
  const [senderName, setSenderName] = useState('Yudi');
  const [senderWhatsApp, setSenderWhatsApp] = useState('6281234567890');
  const [cardTitle, setCardTitle] = useState('Selamat Ulang Tahun Jiwa Terindahku ❤️');
  const [message, setMessage] = useState(
    'Selamat ulang tahun untuk sosok yang selalu membuat hariku lebih berwarna. Semoga di usia yang baru ini, setiap impianmu terwujud indah dan kebahagiaan selalu menyertaimu.'
  );
  const [highlightQuote, setHighlightQuote] = useState(
    'Bersamamu, setiap detik adalah kado terindah yang kusyukuri.'
  );
  const [musicPreset, setMusicPreset] = useState<MusicPresetId>('kids_happy_birthday');
  const [surpriseType, setSurpriseType] = useState<SurpriseType>('gift_box');
  const [photos, setPhotos] = useState<MemoryPhoto[]>(THEMES.pasangan.samplePhotos);

  // Gift / Kado E-Wallet state
  const [giftEnabled, setGiftEnabled] = useState(true);
  const [giftProvider, setGiftProvider] = useState<EWalletProvider>('dana');
  const [giftAmount, setGiftAmount] = useState(100000);
  const [giftNote, setGiftNote] = useState('Kado jajan & traktiran ulang tahun spesial dariku!');
  const [giftSenderWalletNumber, setGiftSenderWalletNumber] = useState('081234567890');
  const [giftDeeplinkUrl, setGiftDeeplinkUrl] = useState('');

  // New photo input
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoDate, setNewPhotoDate] = useState('');

  // AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio audition test
  const [auditioningMusic, setAuditioningMusic] = useState<MusicPresetId | null>(null);

  // Midnight 00:00 WhatsApp Baileys state
  const [midnightSendEnabled, setMidnightSendEnabled] = useState(true);
  const [midnightTimezone, setMidnightTimezone] = useState<'WIB' | 'WITA' | 'WIT' | 'LOCAL'>('WIB');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load a card into the editor
  const handleEditCard = (card: GreetingCard) => {
    setEditingCardId(card.id);
    setRecipientName(card.recipientName);
    setNickname(card.nickname);
    setProfile(card.profile);
    setBirthDate(card.birthDate);
    setScheduledDeliveryDate(card.scheduledDeliveryDate);
    setAutoScheduleEnabled(card.autoScheduleEnabled);
    setWhatsappNumber(card.whatsappNumber);
    setSenderName(card.senderName);
    setSenderWhatsApp(card.senderWhatsApp || '6281234567890');
    setCardTitle(card.cardTitle);
    setMessage(card.message);
    setHighlightQuote(card.highlightQuote);
    setMusicPreset(card.musicPreset);
    setSurpriseType(card.surpriseType);
    setPhotos(card.photos || []);
    setMidnightSendEnabled(card.midnightSendEnabled ?? true);
    setMidnightTimezone(card.midnightTimezone || 'WIB');

    // Load gift
    if (card.giftReward) {
      setGiftEnabled(card.giftReward.enabled);
      setGiftProvider(card.giftReward.provider);
      setGiftAmount(card.giftReward.amount);
      setGiftNote(card.giftReward.note);
      setGiftSenderWalletNumber(card.giftReward.senderWalletNumber);
      setGiftDeeplinkUrl(card.giftReward.deeplinkUrl || '');
    } else {
      setGiftEnabled(false);
    }

    setActiveTab('editor');
    showToast(`Memuat data ucapan untuk ${card.recipientName}`);
  };

  // Reset form for new card
  const handleNewCard = () => {
    setEditingCardId(null);
    setRecipientName('');
    setNickname('');
    setProfile('teman');
    setBirthDate(new Date().toISOString().split('T')[0]);
    setScheduledDeliveryDate(`${new Date().toISOString().split('T')[0]}T00:00`);
    setAutoScheduleEnabled(true);
    setWhatsappNumber('');
    setSenderName('Yudi');
    setSenderWhatsApp('6281234567890');
    setCardTitle('Selamat Ulang Tahun! 🎂🎉');
    setMessage('Selamat ulang tahun sahabat terbaik! Semoga panjang umur, sehat dan sukses selalu!');
    setHighlightQuote('Sahabat sejati selalu ada di setiap cerita hidup.');
    setMusicPreset('kids_happy_birthday');
    setSurpriseType('gift_box');
    setPhotos(THEMES.teman.samplePhotos);
    setGiftEnabled(true);
    setMidnightSendEnabled(true);
    setMidnightTimezone('WIB');
    setGiftProvider('dana');
    setGiftAmount(50000);
    setGiftNote('Kado traktiran jajan dari aku ya!');
    setGiftSenderWalletNumber('081234567890');
    setGiftDeeplinkUrl('');
    setActiveTab('editor');
  };

  // When changing profile, update default presets and sample photos if user desires
  const handleProfileChange = (newProfile: RecipientProfile) => {
    setProfile(newProfile);
    const th = THEMES[newProfile];
    setMusicPreset(th.defaultMusic);
    if (photos.length === 0) {
      setPhotos(th.samplePhotos);
    }
  };

  // Add photo
  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    const newP: MemoryPhoto = {
      id: `photo-${Date.now()}`,
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || 'Momen indah bersama',
      date: newPhotoDate.trim() || 'Kenangan Spesial',
    };
    setPhotos([...photos, newP]);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setNewPhotoDate('');
    showToast('Foto kenangan berhasil ditambahkan!');
  };

  // Handle local file image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const newP: MemoryPhoto = {
        id: `photo-${Date.now()}`,
        url: base64,
        caption: newPhotoCaption.trim() || file.name.split('.')[0] || 'Momen indah bersama',
        date: newPhotoDate.trim() || 'Foto Bersama',
      };
      setPhotos([...photos, newP]);
      setNewPhotoCaption('');
      setNewPhotoDate('');
      showToast('Foto dari perangkat berhasil diunggah!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id));
  };

  // Audition music preview with exclusive single-track playback
  const auditionTimerRef = useRef<number | null>(null);

  const stopAuditionMusic = () => {
    if (auditionTimerRef.current !== null) {
      clearTimeout(auditionTimerRef.current);
      auditionTimerRef.current = null;
    }
    birthdayAudio.stopBackgroundMusic();
    setAuditioningMusic(null);
  };

  const handleAuditionMusic = (presetId: MusicPresetId) => {
    // If clicking the track that is already playing, stop it immediately
    if (auditioningMusic === presetId) {
      stopAuditionMusic();
      return;
    }

    // Always clear existing timer and stop any existing music first
    if (auditionTimerRef.current !== null) {
      clearTimeout(auditionTimerRef.current);
      auditionTimerRef.current = null;
    }
    birthdayAudio.stopBackgroundMusic();

    // Start playing the newly selected track exclusively
    birthdayAudio.playBackgroundMusic(presetId);
    setAuditioningMusic(presetId);

    // Auto-stop preview after 14 seconds to prevent endless looping if user walks away
    auditionTimerRef.current = window.setTimeout(() => {
      birthdayAudio.stopBackgroundMusic();
      setAuditioningMusic(null);
      auditionTimerRef.current = null;
    }, 14000);
  };

  // Stop auditioning whenever active tab changes or component unmounts
  useEffect(() => {
    return () => {
      stopAuditionMusic();
    };
  }, [activeTab]);

  // Handle AI selection
  const handleSelectAISuggestion = (suggestion: AISuggestion) => {
    setCardTitle(suggestion.title);
    setMessage(suggestion.wishes);
    if (suggestion.highlightQuote) {
      setHighlightQuote(suggestion.highlightQuote);
    }
    showToast('Ucapan dari AI Gemini berhasil diterapkan ke kartu!');
  };

  // Save Card
  const handleSave = () => {
    if (!recipientName.trim()) {
      showToast('Harap isi nama penerima');
      return;
    }

    const cardToSave: GreetingCard = {
      id: editingCardId || `card-${Date.now()}`,
      recipientName: recipientName.trim(),
      nickname: nickname.trim() || recipientName.trim(),
      profile,
      relationshipDetail: THEMES[profile].tagline,
      birthDate,
      scheduledDeliveryDate,
      autoScheduleEnabled,
      whatsappNumber: whatsappNumber.trim(),
      senderName: senderName.trim() || 'Sahabatmu',
      senderWhatsApp: senderWhatsApp.trim() || whatsappNumber.trim(),
      cardTitle: cardTitle.trim() || 'Selamat Ulang Tahun!',
      message: message.trim(),
      highlightQuote: highlightQuote.trim(),
      musicPreset,
      surpriseType,
      photos,
      status: editingCardId ? 'scheduled' : 'scheduled',
      createdAt: new Date().toISOString(),
      midnightSendEnabled,
      midnightTimezone,
      midnightSendStatus: midnightSendEnabled ? 'pending' : 'disabled',
      giftReward: giftEnabled
        ? {
            enabled: true,
            provider: giftProvider,
            amount: Number(giftAmount) || 50000,
            note: giftNote.trim() || 'Kado spesial untukmu!',
            senderWalletNumber: giftSenderWalletNumber.trim() || senderWhatsApp.trim(),
            deeplinkUrl: giftDeeplinkUrl.trim() || undefined,
            isClaimed: false,
          }
        : undefined,
      responses: editingCardId
        ? cards.find((c) => c.id === editingCardId)?.responses || []
        : [],
    };

    onSaveCard(cardToSave);

    // Register into Baileys Midnight 00:00 queue if enabled
    if (midnightSendEnabled && cardToSave.whatsappNumber && cardToSave.birthDate) {
      fetch('/api/whatsapp/schedule-midnight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: cardToSave.id,
          recipientName: cardToSave.recipientName,
          recipientPhone: cardToSave.whatsappNumber,
          birthDate: cardToSave.birthDate,
          timezone: midnightTimezone,
          cardUrl: `${window.location.origin}/?card=${cardToSave.id}`,
          message: `*Selamat Ulang Tahun Tepat Pukul 00:00, ${cardToSave.nickname || cardToSave.recipientName}!* 🎉🎂\n\nDi detik pertama hari kelahiranmu ini, aku ingin menjadi orang pertama yang merayakan hari istimewamu! Semoga selalu sehat, bahagia, dan limpahan rezeki berkah selalu menyertaimu.\n\n🎁 *Buka Hadiah & Kartu Animasi Interaktifmu:* \n👉 ${window.location.origin}/?card=${cardToSave.id}\n\n_Dari: ${cardToSave.senderName}_`,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log('Midnight dispatch queue synced:', data.item);
          }
        })
        .catch((err) => console.error('Error syncing midnight schedule:', err));
    }

    showToast(
      midnightSendEnabled
        ? 'Kartu berhasil disimpan & dijadwalkan otomatis pukul 00:00 via WhatsApp!'
        : 'Kartu ucapan berhasil disimpan dan dijadwalkan!'
    );
    setActiveTab('schedule');
  };

  // Generate WhatsApp Direct Share link
  const getWhatsAppShareLink = (card: GreetingCard) => {
    const cleanNumber = card.whatsappNumber.replace(/[^0-9]/g, '');
    const cardUrl = `${window.location.origin}/?card=${card.id}`;
    const text = `*Selamat Ulang Tahun ${card.nickname || card.recipientName}!* 🎂✨\n\n${card.cardTitle}\n\nAda kado kartu ucapan animasi spesial dengan lagu dan foto kenangan kita yang sudah disiapkan khusus untukmu.\n\n👉 *Buka kado kejutanmu di sini:*\n${cardUrl}\n\n_Dari: ${card.senderName}_`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
  };

  const copyCardLink = (cardId: string) => {
    const url = `${window.location.origin}/?card=${cardId}`;
    navigator.clipboard.writeText(url);
    showToast('Link kartu ucapan berhasil disalin ke clipboard!');
  };

  // Stats calculation
  const totalCards = cards.length;
  const scheduledCards = cards.filter((c) => c.status === 'scheduled').length;
  const sentCards = cards.filter((c) => c.status === 'sent').length;
  const totalResponses = cards.reduce((acc, c) => acc + (c.responses?.length || 0), 0);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* TOAST ALERT */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xl border border-zinc-700 dark:border-zinc-200 text-xs font-semibold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DASHBOARD HEADER & STATS */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pusat Pengaturan & Penjadwalan Ucapan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white font-serif">
              Studio Kartu Ulang Tahun
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Rancang kartu interaktif beranimasi, jadwalkan pengiriman otomatis ke WhatsApp, dan
              buat momen berkesan bagi orang tersayang.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-buat-kartu-baru"
              onClick={handleNewCard}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-500/25 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Kartu Baru</span>
            </button>
          </div>
        </div>

        {/* METRIC BADGES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-xs text-zinc-500 font-medium">Total Kartu</span>
            <div className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">
              {totalCards}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Terjadwal Otomatis
            </span>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {scheduledCards}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Siap / Terkirim
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {sentCards}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              Balasan Masuk
            </span>
            <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
              {totalResponses}
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS WITH SPRING SURPRISE ANIMATION (MOBILE-RESPONSIVE SCROLL) */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6 gap-2 overflow-x-auto scrollbar-none max-w-full pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          id="tab-editor-kartu"
          onClick={() => setActiveTab('editor')}
          className={`relative pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap ${
            activeTab === 'editor'
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>{editingCardId ? 'Edit Kartu' : 'Buat & Sesuaikan Kartu'}</span>
          {activeTab === 'editor' && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 inset-x-0 h-0.5 bg-rose-600 dark:bg-rose-400"
            />
          )}
        </button>

        <button
          id="tab-jadwal-kartu"
          onClick={() => setActiveTab('schedule')}
          className={`relative pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Daftar Jadwal & Riwayat ({cards.length})</span>
          {activeTab === 'schedule' && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 inset-x-0 h-0.5 bg-rose-600 dark:bg-rose-400"
            />
          )}
        </button>

        <button
          id="tab-inbox-balasan"
          onClick={() => setActiveTab('inbox')}
          className={`relative pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap ${
            activeTab === 'inbox'
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Kotak Balasan Penerima ({totalResponses})</span>
          {activeTab === 'inbox' && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 inset-x-0 h-0.5 bg-rose-600 dark:bg-rose-400"
            />
          )}
        </button>

        <button
          id="tab-whatsapp-baileys"
          onClick={() => setActiveTab('whatsapp')}
          className={`relative pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap ${
            activeTab === 'whatsapp'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-emerald-500" />
          <span>WhatsApp Baileys & Jam 00:00</span>
          {activeTab === 'whatsapp' && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-600 dark:bg-emerald-400"
            />
          )}
        </button>
      </div>

      {/* TAB CONTENT: EDITOR */}
      {activeTab === 'editor' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* STEP 1: PILIH PROFIL PENERIMA & TEMA */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="mb-4">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                Langkah 1
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                Pilih Profil Penerima & Tema Spesial
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Setiap profil memiliki palet warna eksklusif, musik instrumen, animasi partikel, dan
                suasana yang disesuaikan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['pasangan', 'teman', 'keluarga', 'rekan'] as RecipientProfile[]).map((key) => {
                const item = THEMES[key];
                const isSelected = profile === key;
                return (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleProfileChange(key)}
                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 shadow-lg shadow-rose-500/10'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 hover:border-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: item.colors.primary }}
                        >
                          {key === 'pasangan' && <Heart className="w-5 h-5 fill-current" />}
                          {key === 'teman' && <Sparkles className="w-5 h-5" />}
                          {key === 'keluarga' && <Home className="w-5 h-5" />}
                          {key === 'rekan' && <Briefcase className="w-5 h-5" />}
                        </div>
                        {isSelected && (
                          <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                        {item.label}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {item.tagline}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-[11px]">
                      <span className="font-medium text-zinc-600 dark:text-zinc-300">
                        {item.badge}
                      </span>
                      <span className="capitalize text-zinc-400 font-mono">
                        {item.particles}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: DATA PENERIMA & PENJADWALAN */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="mb-4">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                Langkah 2
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                Data Penerima & Waktu Pengiriman Otomatis
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Atur jadwal hari ulang tahun dan waktu yang tepat saat ucapan dikirimkan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nama Lengkap Penerima *
                </label>
                <input
                  id="input-nama-penerima"
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Contoh: Adinda Permatasari"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nama Panggilan / Sapaan Hangat
                </label>
                <input
                  id="input-panggilan-akrab"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Contoh: Dinda Sayang / Bestie Rian"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nama Pengirim (Anda)
                </label>
                <input
                  id="input-nama-pengirim"
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Contoh: Yudi"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tanggal Ulang Tahun
                </label>
                <input
                  id="input-tanggal-ulang-tahun"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Jadwal Pengiriman Otomatis (Tanggal & Jam)
                </label>
                <input
                  id="input-jadwal-pengiriman"
                  type="datetime-local"
                  value={scheduledDeliveryDate}
                  onChange={(e) => setScheduledDeliveryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nomor WhatsApp Penerima (Hak Akses Hadiah & Pengiriman)
                </label>
                <input
                  id="input-nomor-whatsapp"
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="Contoh: 6281234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nomor WhatsApp Pribadi / Admin Anda (Tujuan Balasan & Konfirmasi)
                </label>
                <input
                  id="input-nomor-whatsapp-pengirim"
                  type="text"
                  value={senderWhatsApp}
                  onChange={(e) => setSenderWhatsApp(e.target.value)}
                  placeholder="Contoh: 6281234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 font-mono"
                />
              </div>

              {/* FITUR PENGIRIMAN OTOMATIS PUKUL 00:00 (MIDNIGHT SURPRISE) */}
              <div className="sm:col-span-2 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-rose-500/10 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Clock className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <span>Pengiriman Otomatis Tepat Pukul 00:00 (Midnight Surprise)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                          Baileys Socket
                        </span>
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Kirim tautan kartu ucapan otomatis melalui WhatsApp pribadi Anda di detik pertama tanggal {birthDate || 'ulang tahun'}.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      id="checkbox-midnight-00"
                      type="checkbox"
                      checked={midnightSendEnabled}
                      onChange={(e) => setMidnightSendEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {midnightSendEnabled && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-indigo-200/40 dark:border-indigo-800/40 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600 dark:text-zinc-300 font-medium">Zona Waktu 00:00:</span>
                      <select
                        value={midnightTimezone}
                        onChange={(e) => setMidnightTimezone(e.target.value as any)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
                      >
                        <option value="WIB">WIB (Jakarta / Jawa / Sumatra / Kalbar)</option>
                        <option value="WITA">WITA (Bali / Kalsel / Kaltim / Sulawesi)</option>
                        <option value="WIT">WIT (Maluku / Papua)</option>
                      </select>
                    </div>

                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Jadilah orang pertama yang mengirimkan ucapan di hari bahagianya!
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 3: ISI KARTU & AI ASSISTANT */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                  Langkah 3
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                  Teks Ucapan & Generator AI
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Tulis pesan dari hati atau gunakan AI Gemini untuk mendapatkan variasi kata yang
                  puitis dan berkesan.
                </p>
              </div>

              <motion.button
                id="btn-buka-modal-ai-gemini"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsAiModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white font-semibold text-xs shadow-md shadow-purple-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Rangkai Kata dengan AI Gemini ✨</span>
              </motion.button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Judul Pembuka Kartu
                </label>
                <input
                  id="input-judul-kartu"
                  type="text"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  placeholder="Contoh: Selamat Ulang Tahun Jiwa Terindahku ❤️"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 font-serif font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Isi Pesan Ulang Tahun Lengkap
                </label>
                <textarea
                  id="textarea-isi-pesan"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan ucapan penuh cinta, doa, dan harapanmu..."
                  className="w-full px-4 py-3 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 leading-relaxed resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Kutipan Mutiara Emas (Highlight Quote)
                </label>
                <input
                  id="input-highlight-quote"
                  type="text"
                  value={highlightQuote}
                  onChange={(e) => setHighlightQuote(e.target.value)}
                  placeholder="Contoh: Bersamamu, setiap detik adalah kado terindah yang kusyukuri."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 italic"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: FOTO KENANGAN BERSAMA */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="mb-4">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                Langkah 4
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                Foto Kenangan Bersama (Galeri Polaroid)
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tambahkan foto-foto kenangan berharga yang akan ditampilkan sebagai polaroid
                beranimasi di kartu ucapan penerima.
              </p>
            </div>

            {/* List of current photos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {photos.map((p, idx) => (
                <div
                  key={p.id}
                  className="relative group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 p-2 shadow-sm"
                >
                  <img
                    src={p.url}
                    alt={p.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-36 object-cover rounded-xl"
                  />
                  <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 mt-2 px-1 line-clamp-2">
                    "{p.caption}"
                  </p>
                  {p.date && (
                    <span className="text-[10px] text-zinc-400 px-1">{p.date}</span>
                  )}
                  <button
                    onClick={() => handleRemovePhoto(p.id)}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                    title="Hapus Foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Photo Form */}
            <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-3 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-rose-500" />
                <span>Tambah Foto Kenangan Baru</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                    URL Foto Online (Atau unggah file di bawah)
                  </label>
                  <input
                    type="text"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                    Tanggal / Tag Momen
                  </label>
                  <input
                    type="text"
                    value={newPhotoDate}
                    onChange={(e) => setNewPhotoDate(e.target.value)}
                    placeholder="Contoh: Liburan Pertama"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                    Keterangan / Caption Manis untuk Foto
                  </label>
                  <input
                    type="text"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    placeholder="Contoh: Senja pertama saat kita merayakan ulang tahun bareng ✨"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  disabled={!newPhotoUrl.trim()}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambahkan via URL</span>
                </button>

                <span className="text-xs text-zinc-400">atau</span>

                <label className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah File dari Komputer/HP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* STEP 5: MUSIK LATAR & KEJUTAN INTERAKTIF */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="mb-4">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                Langkah 5
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                Musik Latar & Jenis Kejutan Animasi
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Pilih lagu dan animasi pembuka yang akan menyambut penerima saat membuka link.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Musik Latar */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-rose-500" />
                    <span>Pilihan Musik Latar</span>
                  </span>
                  <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">
                    Hanya 1 lagu berputar per waktu
                  </span>
                </label>

                {/* ACTIVE AUDITION BANNER */}
                {auditioningMusic && (
                  <div className="mb-2.5 px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between text-xs animate-pulse">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="flex gap-0.5 items-end h-3.5 shrink-0">
                        <span className="w-1 bg-rose-500 rounded-full h-full" />
                        <span className="w-1 bg-rose-500 rounded-full h-2.5" />
                        <span className="w-1 bg-rose-500 rounded-full h-3" />
                      </span>
                      <span className="font-semibold text-rose-700 dark:text-rose-300 truncate">
                        Memutar: {MUSIC_PRESETS[auditioningMusic]?.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        stopAuditionMusic();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm cursor-pointer shrink-0"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop</span>
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {(Object.keys(MUSIC_PRESETS) as MusicPresetId[]).map((mId) => {
                    const m = MUSIC_PRESETS[mId];
                    const isSelected = musicPreset === mId;
                    const isAuditioning = auditioningMusic === mId;
                    return (
                      <div
                        key={mId}
                        onClick={() => setMusicPreset(mId)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'border-rose-500 bg-rose-500/10'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 hover:border-zinc-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <span className="truncate">{m.name}</span>
                            {isSelected && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white shrink-0">
                                Terpilih
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                            {m.mood}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAuditionMusic(mId);
                          }}
                          className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                            isAuditioning
                              ? 'bg-rose-600 text-white shadow-md shadow-rose-500/30'
                              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                          }`}
                          title={isAuditioning ? 'Hentikan Musik Ini' : 'Dengarkan Contoh Melodi'}
                        >
                          {isAuditioning ? (
                            <>
                              <Square className="w-3.5 h-3.5 fill-current" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Dengarkan</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Jenis Kejutan Awal */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-rose-500" />
                  <span>Kejutan Animasi Pembuka</span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSurpriseType('gift_box')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                      surpriseType === 'gift_box'
                        ? 'border-rose-500 bg-rose-500/10'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40'
                    }`}
                  >
                    <Gift className="w-8 h-8 text-rose-500 mb-2 animate-bounce" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      Kotak Kado Berpita
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-1">
                      Pita terlepas & semburan konfeti
                    </span>
                  </div>

                  <div
                    onClick={() => setSurpriseType('envelope')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                      surpriseType === 'envelope'
                        ? 'border-rose-500 bg-rose-500/10'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40'
                    }`}
                  >
                    <Mail className="w-8 h-8 text-amber-500 mb-2 animate-pulse" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      Amplop Segel Lilin
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-1">
                      Surat emas romantis & hangat
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 6: KADO & HADIAH E-WALLET (DANA / GOPAY) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                  Langkah 6
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-500" />
                  <span>Kado Uang E-Wallet (DANA / GoPay) dengan Proteksi Nomor</span>
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Kirimkan kado nyata berupa saldo DANA atau GoPay yang terproteksi khusus hanya bisa
                  diklaim oleh nomor penerima yang Anda daftarkan.
                </p>
              </div>

              {/* Toggle Enable Gift */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="checkbox-aktifkan-kado"
                  type="checkbox"
                  checked={giftEnabled}
                  onChange={(e) => setGiftEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
                <span className="ml-3 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {giftEnabled ? 'Kado Aktif' : 'Nonaktif'}
                </span>
              </label>
            </div>

            {giftEnabled && (
              <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Pilihan E-Wallet
                    </label>
                    <select
                      id="select-provider-ewallet"
                      value={giftProvider}
                      onChange={(e) => setGiftProvider(e.target.value as EWalletProvider)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    >
                      <option value="dana">DANA (Dompet Digital)</option>
                      <option value="gopay">GoPay (Gojek / Tokopedia)</option>
                      <option value="shopeepay">ShopeePay</option>
                      <option value="ovo">OVO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Nominal Saldo Kado (Rupiah)
                    </label>
                    <input
                      id="input-nominal-kado"
                      type="number"
                      step="5000"
                      value={giftAmount}
                      onChange={(e) => setGiftAmount(Number(e.target.value))}
                      placeholder="50000"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Nomor Akun {giftProvider.toUpperCase()} Anda (Pengirim)
                    </label>
                    <input
                      id="input-nomor-akun-pengirim"
                      type="text"
                      value={giftSenderWalletNumber}
                      onChange={(e) => setGiftSenderWalletNumber(e.target.value)}
                      placeholder="081234567890"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Pesan Singkat di Kado
                    </label>
                    <input
                      id="input-pesan-kado"
                      type="text"
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      placeholder="Contoh: Kado jajan kopi & dessert ya!"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Tautan Langsung Transfer (Opsional, Misal: DANA Kaget / Link Aja)
                    </label>
                    <input
                      id="input-deeplink-kado"
                      type="url"
                      value={giftDeeplinkUrl}
                      onChange={(e) => setGiftDeeplinkUrl(e.target.value)}
                      placeholder="https://link.dana.id/... atau kosongkan untuk transfer via WA"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900 dark:text-amber-200">
                    <b>Proteksi Hak Akses Hadiah Aktif:</b> Hanya nomor WhatsApp penerima (<b>{whatsappNumber || 'Belum diisi'}</b>) yang dapat memverifikasi dan membuka hadiah ini. Orang lain yang membuka link kartu tidak akan bisa mengambilnya.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                Siap Meluncurkan Kejutan?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Simpan kartu ke jadwal atau langsung uji buka sebagai penerima.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="btn-uji-pratinjau-kartu"
                onClick={() => {
                  const tempCard: GreetingCard = {
                    id: editingCardId || 'preview-card',
                    recipientName: recipientName || 'Adinda',
                    nickname: nickname || recipientName || 'Dinda',
                    profile,
                    relationshipDetail: THEMES[profile].tagline,
                    birthDate,
                    scheduledDeliveryDate,
                    autoScheduleEnabled,
                    whatsappNumber,
                    senderName,
                    senderWhatsApp,
                    cardTitle,
                    message,
                    highlightQuote,
                    musicPreset,
                    surpriseType,
                    photos,
                    status: 'scheduled',
                    createdAt: new Date().toISOString(),
                    giftReward: giftEnabled
                      ? {
                          enabled: true,
                          provider: giftProvider,
                          amount: Number(giftAmount) || 50000,
                          note: giftNote.trim() || 'Kado spesial!',
                          senderWalletNumber: giftSenderWalletNumber.trim() || senderWhatsApp.trim(),
                          deeplinkUrl: giftDeeplinkUrl.trim() || undefined,
                          isClaimed: false,
                        }
                      : undefined,
                    responses: [],
                  };
                  onPreviewCard(tempCard);
                }}
                className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <Eye className="w-4 h-4" />
                <span>Uji Buka Kartu (Preview)</span>
              </button>

              <button
                id="btn-simpan-dan-jadwalkan"
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/25 transition-transform active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Simpan & Aktifkan Jadwal</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB CONTENT: JADWAL & RIWAYAT */}
      {activeTab === 'schedule' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Daftar Jadwal Kartu Ulang Tahun
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Kelola kartu yang dijadwalkan dan kirimkan langsung melalui WhatsApp kapan saja.
              </p>
            </div>

            <button
              onClick={handleNewCard}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Penerima</span>
            </button>
          </div>

          {cards.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <Calendar className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
              <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-300">
                Belum Ada Kartu yang Dijadwalkan
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto mb-4">
                Buat kartu pertama Anda untuk pasangan, sahabat, keluarga, atau rekan kerja
                sekarang.
              </p>
              <button
                onClick={handleNewCard}
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold"
              >
                Buat Kartu Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {cards.map((card) => {
                const themeConfig = THEMES[card.profile] || THEMES.teman;
                const formattedDate = new Date(card.scheduledDeliveryDate).toLocaleString('id-ID', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                });

                return (
                  <motion.div
                    key={card.id}
                    whileHover={{ scale: 1.005 }}
                    className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar / Theme Icon */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
                        style={{ backgroundColor: themeConfig.colors.primary }}
                      >
                        {card.profile === 'pasangan' && <Heart className="w-6 h-6 fill-current" />}
                        {card.profile === 'teman' && <Sparkles className="w-6 h-6" />}
                        {card.profile === 'keluarga' && <Home className="w-6 h-6" />}
                        {card.profile === 'rekan' && <Briefcase className="w-6 h-6" />}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                            {card.recipientName}
                          </h3>
                          {card.nickname && (
                            <span className="text-xs text-zinc-500 font-serif">
                              ({card.nickname})
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold border border-zinc-200 dark:border-zinc-700">
                            {themeConfig.label}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
                          {card.cardTitle}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>Jadwal: {formattedDate}</span>
                          </span>
                          {card.midnightSendEnabled && (
                            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full text-[10px] border border-indigo-200 dark:border-indigo-800">
                              <Clock className="w-3 h-3 text-indigo-500 animate-pulse" />
                              <span>Auto Kirim 00:00 ({card.midnightTimezone || 'WIB'})</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5 text-rose-500" />
                            <span>{card.photos?.length || 0} Foto</span>
                          </span>
                          {card.responses && card.responses.length > 0 && (
                            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{card.responses.length} Balasan Masuk!</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100 dark:border-zinc-800">
                      <button
                        onClick={() => onPreviewCard(card)}
                        className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                        title="Uji Buka Kartu"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Pratinjau</span>
                      </button>

                      {card.midnightSendEnabled && (
                        <button
                          onClick={() => setActiveTab('whatsapp')}
                          className="px-2.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-indigo-200 dark:border-indigo-800/60"
                          title="Lihat status antrean pukul 00:00 Baileys"
                        >
                          <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                          <span className="hidden lg:inline">Antrean 00:00</span>
                        </button>
                      )}

                      <button
                        onClick={() => copyCardLink(card.id)}
                        className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                        title="Salin Link Khusus"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="hidden sm:inline">Salin Link</span>
                      </button>

                      <button
                        onClick={() => setSharingCard(card)}
                        className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow cursor-pointer"
                        title="Bagikan ke WhatsApp dengan variasi teks harian unik"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Kirim WA Harian</span>
                      </button>

                      <a
                        href={getWhatsAppShareLink(card)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        title="Kirim Langsung Format Standar"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => handleEditCard(card)}
                        className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                        title="Edit Kartu"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus kartu ucapan untuk ${card.recipientName}?`)) {
                            onDeleteCard(card.id);
                            showToast('Kartu berhasil dihapus');
                          }
                        }}
                        className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-600 cursor-pointer"
                        title="Hapus Kartu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* TAB CONTENT: INBOX BALASAN & DOA */}
      {activeTab === 'inbox' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Kotak Balasan & Doa dari Penerima
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Pesan balasan haru dan terima kasih yang dikirimkan oleh orang-orang yang telah membuka
              kartu ucapan Anda.
            </p>
          </div>

          {totalResponses === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <MessageSquare className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
              <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-300">
                Belum Ada Balasan Masuk
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Ketika penerima membuka link kartu ucapan mereka dan menuliskan doa balasan, pesan
                mereka akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.flatMap((c) =>
                (c.responses || []).map((resp) => (
                  <div
                    key={resp.id}
                    className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{resp.emoji}</span>
                          <div>
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                              {resp.sender}
                            </h4>
                            <span className="text-[10px] text-zinc-400">
                              Untuk kartu: {c.recipientName}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {resp.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-700 dark:text-zinc-200 italic font-serif leading-relaxed mt-2 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl">
                        "{resp.text}"
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <button
                        onClick={() => onPreviewCard(c)}
                        className="text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Kartu Terkait</span>
                      </button>

                      {c.whatsappNumber && (
                        <a
                          href={`https://wa.me/${c.whatsappNumber.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat di WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* TAB CONTENT: WHATSAPP BAILEYS CONNECTION */}
      {activeTab === 'whatsapp' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <WhatsAppGatewaySettings
            senderWhatsApp={senderWhatsApp}
            cards={cards}
            onPreviewCard={onPreviewCard}
            onUpdateSenderWhatsApp={(newPhone) => {
              setSenderWhatsApp(newPhone);
              showToast('Nomor WhatsApp pengirim berhasil diupdate: ' + newPhone);
            }}
            onShowToast={showToast}
          />
        </motion.div>
      )}

      {/* DAILY WHATSAPP SHARE MODAL */}
      {sharingCard && (
        <DailyShareModal
          card={sharingCard}
          isOpen={!!sharingCard}
          onClose={() => setSharingCard(null)}
          onShowToast={showToast}
        />
      )}

      {/* AI GEMINI WISHES GENERATOR MODAL */}
      <AIGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSelectSuggestion={handleSelectAISuggestion}
        initialRecipientName={recipientName}
        initialNickname={nickname}
        initialProfile={profile}
        initialSenderName={senderName}
      />
    </div>
  );
};
