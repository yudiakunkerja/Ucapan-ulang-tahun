import { ThemeConfig, RecipientProfile, GreetingCard, MusicPresetId } from '../types';

export const MUSIC_PRESETS: Record<
  MusicPresetId,
  { name: string; description: string; mood: string; bpm: number }
> = {
  kids_happy_birthday: {
    name: 'Lagu Anak: Selamat Ulang Tahun Ceria 🎶👶',
    description: 'Aransemen riang gembira lagu Selamat Ulang Tahun & Happy Birthday dengan nada lonceng ceria ala glockenspiel anak-anak.',
    mood: 'Ceria, Polos, Riang Gembira',
    bpm: 105,
  },
  birthday_musicbox: {
    name: 'Kotak Musik Ulang Tahun (Chimes)',
    description: 'Melodi klasik Happy Birthday dengan suara instrumen music box magis & syahdu.',
    mood: 'Magis, Manis, Nostalgia',
    bpm: 85,
  },
  romantic_piano: {
    name: 'Romantic Acoustic Piano',
    description: 'Alunan piano lembut nan puitis, penuh getaran cinta dan kehangatan hati.',
    mood: 'Romantis, Tulus, Syahdu',
    bpm: 72,
  },
  upbeat_party: {
    name: 'Upbeat Confetti Beats',
    description: 'Irama ceria dan energik perayaan pesta dengan synth pop riang.',
    mood: 'Ceria, Semangat, Asyik',
    bpm: 118,
  },
  warm_acoustic: {
    name: 'Warm Family Acoustic',
    description: 'Petikan dawai gitar akustik menenangkan yang membangkitkan rasa syukur keluarga.',
    mood: 'Hangat, Teduh, Berkah',
    bpm: 80,
  },
  chill_lofi: {
    name: 'Modern Champagne Lo-Fi',
    description: 'Nuansa jazz modern minimalis yang santai, berkelas, dan elegan untuk rekan kerja.',
    mood: 'Elegan, Santai, Modern',
    bpm: 90,
  },
};

export const THEMES: Record<RecipientProfile, ThemeConfig> = {
  pasangan: {
    id: 'pasangan',
    label: 'Pasangan',
    tagline: 'Kekasih, Suami, atau Istri Tercinta',
    badge: 'Romantis & Penuh Cinta',
    colors: {
      primary: '#e11d48', // rose-600
      secondary: '#fb7185', // rose-400
      accent: '#ffe4e6', // rose-100
      bgGradientLight: 'from-rose-50 via-pink-50 to-red-100',
      bgGradientDark: 'from-zinc-950 via-rose-950 to-neutral-950',
      cardBgLight: 'bg-white/90',
      cardBgDark: 'bg-rose-950/40',
      borderLight: 'border-rose-200',
      borderDark: 'border-rose-800/50',
      textPrimaryLight: 'text-rose-950',
      textPrimaryDark: 'text-rose-100',
      textSecondaryLight: 'text-rose-700',
      textSecondaryDark: 'text-rose-300',
      glowColor: 'rgba(225, 29, 72, 0.35)',
    },
    particles: 'hearts',
    icon: 'Heart',
    defaultMusic: 'romantic_piano',
    samplePhotos: [
      {
        id: 'p1',
        url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
        caption: 'Momen senja pertama kita melihat matahari terbenam bersama ✨',
        date: '14 Februari',
      },
      {
        id: 'p2',
        url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
        caption: 'Tawa manismu yang selalu jadi alasan bahagiaku setiap hari ❤️',
        date: 'Musim Lalu',
      },
      {
        id: 'p3',
        url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80',
        caption: 'Melangkah bergandengan tangan menatap masa depan kita berdua 🥂',
        date: 'Kenangan Terbaik',
      },
    ],
  },
  teman: {
    id: 'teman',
    label: 'Teman Dekat',
    tagline: 'Sahabat Karib, Bestie, & Partner Mabar',
    badge: 'Ceria & Penuh Keseruan',
    colors: {
      primary: '#8b5cf6', // violet-600
      secondary: '#f59e0b', // amber-500
      accent: '#ede9fe', // violet-100
      bgGradientLight: 'from-amber-50 via-purple-50 to-sky-100',
      bgGradientDark: 'from-zinc-950 via-purple-950 to-neutral-950',
      cardBgLight: 'bg-white/90',
      cardBgDark: 'bg-purple-950/40',
      borderLight: 'border-purple-200',
      borderDark: 'border-purple-800/50',
      textPrimaryLight: 'text-purple-950',
      textPrimaryDark: 'text-purple-100',
      textSecondaryLight: 'text-purple-700',
      textSecondaryDark: 'text-purple-300',
      glowColor: 'rgba(139, 92, 246, 0.35)',
    },
    particles: 'confetti',
    icon: 'Sparkles',
    defaultMusic: 'upbeat_party',
    samplePhotos: [
      {
        id: 'f1',
        url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
        caption: 'Keseruan nongkrong sampai larut malam tanpa jaim! 🎉',
        date: 'Trip Liburan',
      },
      {
        id: 'f2',
        url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
        caption: 'Sahabat terbaik yang selalu punya stok cerita lucu tak habis-habis 🎂',
        date: 'Akhir Pekan',
      },
      {
        id: 'f3',
        url: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=800&q=80',
        caption: 'Momen perayaan kelulusan dan perjuangan bareng yang legendaris 🚀',
        date: 'Momen Bersejarah',
      },
    ],
  },
  keluarga: {
    id: 'keluarga',
    label: 'Keluarga',
    tagline: 'Orang Tua, Saudara, & Kerabat Tercinta',
    badge: 'Hangat & Penuh Doa Berkah',
    colors: {
      primary: '#d97706', // amber-600
      secondary: '#059669', // emerald-600
      accent: '#fef3c7', // amber-100
      bgGradientLight: 'from-amber-50 via-orange-50 to-amber-100',
      bgGradientDark: 'from-zinc-950 via-amber-950 to-neutral-950',
      cardBgLight: 'bg-white/90',
      cardBgDark: 'bg-amber-950/40',
      borderLight: 'border-amber-200',
      borderDark: 'border-amber-800/50',
      textPrimaryLight: 'text-amber-950',
      textPrimaryDark: 'text-amber-100',
      textSecondaryLight: 'text-amber-700',
      textSecondaryDark: 'text-amber-300',
      glowColor: 'rgba(217, 119, 6, 0.35)',
    },
    particles: 'stars',
    icon: 'Home',
    defaultMusic: 'warm_acoustic',
    samplePhotos: [
      {
        id: 'k1',
        url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
        caption: 'Hangatnya kumpul bersama keluarga saat makan malam istimewa 🏡',
        date: 'Idul Fitri',
      },
      {
        id: 'k2',
        url: 'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&w=800&q=80',
        caption: 'Pelukan tulus yang selalu memberikan rasa aman dan tenang ❤️',
        date: 'Hari Keluarga',
      },
      {
        id: 'k3',
        url: 'https://images.unsplash.com/photo-1609234656388-0ff363383899?auto=format&fit=crop&w=800&q=80',
        caption: 'Senyum bangga yang selalu menjadi motivasi terbesar kami semua 🌸',
        date: 'Momen Berharga',
      },
    ],
  },
  rekan: {
    id: 'rekan',
    label: 'Rekan Kerja',
    tagline: 'Kolega, Mitra Bisnis, & Tim Kantor',
    badge: 'Elegan & Profesional',
    colors: {
      primary: '#0284c7', // sky-600
      secondary: '#0f766e', // teal-700
      accent: '#e0f2fe', // sky-100
      bgGradientLight: 'from-slate-50 via-sky-50 to-blue-100',
      bgGradientDark: 'from-zinc-950 via-slate-900 to-neutral-950',
      cardBgLight: 'bg-white/90',
      cardBgDark: 'bg-slate-900/50',
      borderLight: 'border-slate-200',
      borderDark: 'border-slate-800/60',
      textPrimaryLight: 'text-slate-900',
      textPrimaryDark: 'text-slate-100',
      textSecondaryLight: 'text-slate-600',
      textSecondaryDark: 'text-slate-300',
      glowColor: 'rgba(2, 132, 199, 0.35)',
    },
    particles: 'sparkles',
    icon: 'Briefcase',
    defaultMusic: 'chill_lofi',
    samplePhotos: [
      {
        id: 'r1',
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        caption: 'Kolaborasi sukses tim dalam menyelesaikan proyek besar bersama 💼',
        date: 'Kuartal Lalu',
      },
      {
        id: 'r2',
        url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
        caption: 'Momen perayaan pencapaian target dan kerja keras tim yang hebat 🏆',
        date: 'Townhall Event',
      },
      {
        id: 'r3',
        url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
        caption: 'Rekan kerja inspiratif yang selalu membawa semangat positif di kantor 🌟',
        date: 'Hari Kantor',
      },
    ],
  },
};

// Default pre-seeded cards so user has ready-to-test examples for each recipient profile
export const INITIAL_CARDS: GreetingCard[] = [
  {
    id: 'card-cinta-1',
    recipientName: 'Adinda Permatasari',
    nickname: 'Dinda Sayang',
    profile: 'pasangan',
    relationshipDetail: 'Kekasih tercinta sejak 3 tahun lalu',
    birthDate: '2026-09-20',
    scheduledDeliveryDate: '2026-09-20T00:00',
    autoScheduleEnabled: true,
    whatsappNumber: '6281234567890',
    senderName: 'Yudi',
    cardTitle: 'Selamat Ulang Tahun Jiwa Terindahku, Dinda ❤️',
    message:
      'Selamat ulang tahun untuk sosok yang selalu membuat duniaku terasa begitu nyaman dan bermakna. Terima kasih untuk setiap tawa manis, kehangatan pelukan, dan kesabaranmu menemani setiap langkahku.\n\nSemoga di usiamu yang baru ini, setiap impian yang kau panjatkan dalam diam segera terwujud indah. Tetaplah menjadi lentera yang menerangi hari-hariku. Aku berjanji akan selalu ada di sampingmu untuk merayakan setiap detik kebahagiaan bersamamu.',
    highlightQuote: 'Di antara miliaran manusia di bumi, bersamamu adalah takdir paling kusyukuri.',
    musicPreset: 'romantic_piano',
    surpriseType: 'gift_box',
    photos: [
      {
        id: 'photo-1',
        url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
        caption: 'Senja terindah waktu pertama kali kita merayakan ulang tahun bareng ✨',
        date: 'Kenangan Manis',
      },
      {
        id: 'photo-2',
        url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
        caption: 'Senyum manismu yang tidak pernah gagal mengusir lelah hariku 🥰',
        date: 'Momen Favorit',
      },
    ],
    status: 'scheduled',
    createdAt: '2026-09-18T10:00:00.000Z',
    senderWhatsApp: '6281234567890',
    giftReward: {
      enabled: true,
      provider: 'dana',
      amount: 150000,
      note: 'Kado spesial dari aku untuk beli dessert & buku favoritmu sayang! ❤️',
      senderWalletNumber: '081234567890',
      deeplinkUrl: 'https://link.dana.id/kado-ulang-tahun-dinda',
      isClaimed: false,
    },
    responses: [
      {
        id: 'resp-1',
        sender: 'Dinda Sayang',
        text: 'MasyaAllah sayang, terharu banget liat animasinya dan foto-foto kita! Makasih banyak kado terindahnya ❤️',
        timestamp: 'Baru saja',
        emoji: '🥰',
      },
    ],
  },
  {
    id: 'card-bestie-2',
    recipientName: 'Rian Pratama',
    nickname: 'Bro Rian',
    profile: 'teman',
    relationshipDetail: 'Sahabat satu tongkrongan & partner futsal',
    birthDate: '2026-09-22',
    scheduledDeliveryDate: '2026-09-22T08:00',
    autoScheduleEnabled: true,
    whatsappNumber: '6289876543210',
    senderName: 'Yudi',
    cardTitle: 'Happy Birthday Bro Rian! Level Up Day! 🎂🎉',
    message:
      'Selamat ulang tahun bro! Usia nambah satu tahun, semoga rezeki dan hoki nambah seratus kali lipat!\n\nMakasih udah jadi sahabat yang selalu ada dari zaman susah sampai sekarang. Tetap jadi kawan yang gokil, setia kawan, dan jangan lupa traktiran kopinya ya!',
    highlightQuote: 'Sahabat sejati tak perlu banyak basa-basi, cukup solid sampai tua nanti!',
    musicPreset: 'upbeat_party',
    surpriseType: 'cake_blow',
    photos: [
      {
        id: 'photo-3',
        url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
        caption: 'Waktu nobar dan jalan-jalan seru tanpa mikir beban hidup! ⚡',
        date: 'Liburan Lalu',
      },
    ],
    status: 'scheduled',
    createdAt: '2026-09-18T11:30:00.000Z',
    responses: [],
  },
  {
    id: 'card-ibu-3',
    recipientName: 'Ibu Rahmawati',
    nickname: 'Ibu Tercinta',
    profile: 'keluarga',
    relationshipDetail: 'Ibu kandung tercinta',
    birthDate: '2026-09-25',
    scheduledDeliveryDate: '2026-09-25T05:30',
    autoScheduleEnabled: true,
    whatsappNumber: '6285211223344',
    senderName: 'Ananda Yudi',
    cardTitle: 'Doa Tulus & Bahagia Tak Terhingga untuk Ibu 🌸',
    message:
      'Selamat ulang tahun Ibu tersayang. Tiada kata yang cukup untuk menggambarkan rasa syukur kami memiliki Ibu yang begitu sabar dan penuh kasih.\n\nSemoga Allah senantiasa menganugerahkan Ibu kesehatan yang prima, kebahagiaan lahir batin, dan umur yang penuh keberkahan. Terima kasih atas setiap doa tulus yang tak pernah putus mengalir untuk kami anak-anakmu.',
    highlightQuote: 'Surga di telapak kaki Ibu, dan doa Ibu adalah payung kehidupan kami.',
    musicPreset: 'warm_acoustic',
    surpriseType: 'envelope',
    photos: [
      {
        id: 'photo-4',
        url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
        caption: 'Hangatnya kumpul keluarga bersama Ibu di rumah 🏡',
        date: 'Momen Paling Berharga',
      },
    ],
    status: 'scheduled',
    createdAt: '2026-09-18T12:00:00.000Z',
    responses: [],
  },
  {
    id: 'card-rekan-4',
    recipientName: 'Pak Hendra Kusuma',
    nickname: 'Pak Hendra',
    profile: 'rekan',
    relationshipDetail: 'Project Lead & Kolega Kolaborasi',
    birthDate: '2026-09-28',
    scheduledDeliveryDate: '2026-09-28T09:00',
    autoScheduleEnabled: false,
    whatsappNumber: '6281355443322',
    senderName: 'Yudi & Tim Development',
    cardTitle: 'Selamat Ulang Tahun & Sukses Selalu, Pak Hendra! 💼✨',
    message:
      'Selamat ulang tahun Pak Hendra! Kami segenap rekan kerja mengucapkan selamat bertambah usia dan sukses selalu.\n\nTerima kasih atas kepemimpinan yang inspiratif dan kerja sama yang sangat produktif selama ini. Semoga tahun ini membawa pencapaian baru yang semakin gemilang dalam karier serta senantiasa dilimpahi kesehatan dan kebahagiaan.',
    highlightQuote: 'Dedikasi luar biasa menghasilkan karya bermakna. Selamat ulang tahun!',
    musicPreset: 'chill_lofi',
    surpriseType: 'gift_box',
    photos: [
      {
        id: 'photo-5',
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        caption: 'Apresiasi bersama tim atas peluncuran produk sukses 🥂',
        date: 'Q3 Review',
      },
    ],
    status: 'sent',
    createdAt: '2026-09-17T09:00:00.000Z',
    responses: [
      {
        id: 'resp-2',
        sender: 'Pak Hendra',
        text: 'Terima kasih banyak rekan-rekan! Sangat kreatif dan berkesan sekali kartu ulang tahunnya.',
        timestamp: 'Kemarin',
        emoji: '🤝',
      },
    ],
  },
];
