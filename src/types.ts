export type RecipientProfile = 'pasangan' | 'teman' | 'keluarga' | 'rekan';

export type WishTone = 'sentimental' | 'funny' | 'poetic' | 'formal' | 'blessing';

export type SurpriseType = 'gift_box' | 'envelope' | 'cake_blow' | 'balloon_pop';

export type MusicPresetId =
  | 'birthday_musicbox'
  | 'kids_happy_birthday'
  | 'romantic_piano'
  | 'upbeat_party'
  | 'warm_acoustic'
  | 'chill_lofi';

export interface MemoryPhoto {
  id: string;
  url: string;
  caption: string;
  date?: string;
}

export interface RecipientResponse {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  emoji: string;
}

export interface ReactionCapture {
  id: string;
  photoUrl: string; // Data URL of the spontaneous reaction photo
  capturedAt: string;
  recipientName: string;
  reactionNote?: string;
}

export type EWalletProvider = 'dana' | 'gopay' | 'shopeepay' | 'ovo';

export interface GiftReward {
  enabled: boolean;
  provider: EWalletProvider;
  amount: number; // e.g., 50000 (Rp 50.000)
  note: string; // "Traktir jajan kopi & kue ulang tahun ya!"
  senderWalletNumber: string; // e.g. nomor DANA / GoPay pengirim
  qrCodeUrl?: string; // QRIS / E-wallet transfer QR image (opsional)
  deeplinkUrl?: string; // Tautan langsung transfer (misal https://link.dana.id/...)
  isClaimed?: boolean;
  claimedAt?: string;
  claimedByNumber?: string;
}

export interface GreetingCard {
  id: string;
  recipientName: string;
  nickname: string;
  profile: RecipientProfile;
  relationshipDetail?: string;
  birthDate: string; // YYYY-MM-DD
  scheduledDeliveryDate: string; // YYYY-MM-DDTHH:mm
  autoScheduleEnabled: boolean;
  whatsappNumber: string;
  senderName: string;
  senderWhatsApp?: string; // WhatsApp pribadi pengirim / admin
  cardTitle: string;
  message: string;
  highlightQuote: string;
  musicPreset: MusicPresetId;
  surpriseType: SurpriseType;
  photos: MemoryPhoto[];
  status: 'draft' | 'scheduled' | 'sent' | 'opened';
  createdAt: string;
  responses: RecipientResponse[];
  turningAge?: number;
  reactions?: ReactionCapture[];
  giftReward?: GiftReward; // Fitur Hadiah / Kado E-Wallet Terverifikasi
  // Pengiriman Otomatis & Pengingat Tepat Waktu via WhatsApp Pribadi
  midnightSendEnabled?: boolean;
  midnightSendStatus?: 'pending' | 'sent' | 'failed' | 'disabled';
  midnightSentAt?: string;
  midnightTimezone?: 'WIB' | 'WITA' | 'WIT' | 'LOCAL';
  midnightCustomMessage?: string;
  remindSelfH3?: boolean;
  remindSelfH1?: boolean;
  remindSelfMorning?: boolean;
}

export interface WhatsAppReminderItem {
  id: string;
  cardId: string;
  recipientName: string;
  recipientPhone: string;
  targetDate: string;
  reminderType: 'self_reminder_h3' | 'self_reminder_h1' | 'self_reminder_today' | 'recipient_birthday_midnight' | 'recipient_birthday_morning';
  title: string;
  message: string;
  scheduledTime: string;
  status: 'pending' | 'sent' | 'failed';
  sendTo: 'self' | 'recipient';
  sentAt?: string;
}

export interface WhatsAppSessionState {
  status: 'disconnected' | 'pairing' | 'connected';
  phoneNumber: string;
  pushName?: string;
  platform?: string;
  batteryLevel?: number;
  lastConnectedAt?: string;
  qrCodeData?: string;
  qrExpiresAt?: number;
  pairingCode?: string;
  connectionMethod?: 'qr' | 'phone_number';
}

export interface MidnightQueueItem {
  id: string;
  cardId: string;
  recipientName: string;
  recipientPhone: string;
  birthDate: string; // YYYY-MM-DD
  targetMidnightTimestamp: number; // Unix ms when 00:00 strikes
  targetMidnightFormatted: string; // e.g., "19 Sep 2026, 00:00 WIB"
  status: 'pending' | 'sent' | 'failed';
  timezone: string;
  cardUrl: string;
  messagePreview: string;
  sentAt?: string;
  sentMessageId?: string;
}

export interface ThemeConfig {
  id: RecipientProfile;
  label: string;
  tagline: string;
  badge: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    bgGradientLight: string;
    bgGradientDark: string;
    cardBgLight: string;
    cardBgDark: string;
    borderLight: string;
    borderDark: string;
    textPrimaryLight: string;
    textPrimaryDark: string;
    textSecondaryLight: string;
    textSecondaryDark: string;
    glowColor: string;
  };
  particles: 'hearts' | 'confetti' | 'stars' | 'sparkles';
  icon: string;
  defaultMusic: MusicPresetId;
  samplePhotos: MemoryPhoto[];
}

export interface AISuggestion {
  title: string;
  wishes: string;
  highlightQuote: string;
  themeSuggestion?: string;
}
