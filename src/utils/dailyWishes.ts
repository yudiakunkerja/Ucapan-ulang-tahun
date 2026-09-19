import { GreetingCard, RecipientProfile } from '../types';

export interface DailyWishVariation {
  dayName: string; // Senin, Selasa, dst.
  themeTag: string; // misal: "Hari Penuh Semangat", "Hari Refleksi Penuh Cinta"
  greetingIntro: string;
  bodyNote: string;
  emojiSequence: string;
  closingTag: string;
}

// 7 Days of Unique Indonesian Birthday Greetings based on day of week
export const DAILY_WISH_TEMPLATES: Record<number, DailyWishVariation> = {
  0: {
    // Minggu (Sunday)
    dayName: 'Minggu',
    themeTag: 'Minggu Penuh Berkah & Sukacita',
    greetingIntro: 'Selamat Hari Minggu yang sangat istimewa!',
    bodyNote:
      'Di hari Minggu yang tenang dan penuh damai ini, mari kita rayakan kelahiran sosok yang selalu membawa keceriaan dan inspirasi. Semoga awal pekan baru dan tahun barumu dipenuhi keberkahan tanpa batas.',
    emojiSequence: '☀️🌻🎉🕊️✨',
    closingTag: 'Semoga hari minggumu seindah senyumanmu!',
  },
  1: {
    // Senin (Monday)
    dayName: 'Senin',
    themeTag: 'Senin Semangat Baru & Harapan Emas',
    greetingIntro: 'Senin Semangat, Hari Istimewa Milikmu!',
    bodyNote:
      'Mengawali pekan dengan perayaan ulang tahunmu adalah pertanda baik! Semoga di usia baru ini, setiap langkah dan pekerjaanmu selalu dilancarkan, pintu rezeki terbuka lebar, dan energi positifmu tak pernah padam.',
    emojiSequence: '🚀💪🎂🌟🔥',
    closingTag: 'Langkah mantap menuju kesuksesan baru!',
  },
  2: {
    // Selasa (Tuesday)
    dayName: 'Selasa',
    themeTag: 'Selasa Bahagia & Kedamaian Jiwa',
    greetingIntro: 'Selasa Berbunga untuk yang Berulang Tahun!',
    bodyNote:
      'Di hari Selasa yang cerah ini, doa-doa terbaik dipanjatkan untukmu. Semoga kesehatan, kebahagiaan hati, dan rezeki yang melimpah selalu menyertai perjalanan usiamu.',
    emojiSequence: '🌸🍰🎈💖🌈',
    closingTag: 'Teruslah memancarkan kebaikan di sekitarmu!',
  },
  3: {
    // Rabu (Wednesday)
    dayName: 'Rabu',
    themeTag: 'Rabu Harmoni & Kebijaksanaan',
    greetingIntro: 'Rabu Manis Spesial Ulang Tahunmu!',
    bodyNote:
      'Di pertengahan minggu yang manis ini, sejenak rehat dan nikmati perayaan hari jadimu. Kamu adalah hadiah luar biasa bagi semua orang di sekitarmu. Semoga impian-impian besarmu segera terwujud nyata.',
    emojiSequence: '🍯🎁🎊🥂🌟',
    closingTag: 'Nikmati setiap detik kebahagiaan hari ini!',
  },
  4: {
    // Kamis (Thursday)
    dayName: 'Kamis',
    themeTag: 'Kamis Penuh Rasa Syukur',
    greetingIntro: 'Kamis Manis Penuh Kehangatan!',
    bodyNote:
      'Hari Kamis yang hangat menjadi saksi bertambahnya usia sosok berharga. Bersyukur atas segala tawa dan kenangan yang terukir bersama. Semoga hari-harimu ke depan selalu dinaungi cinta dan perlindungan Tuhan.',
    emojiSequence: '☕🍂🎂💛🕯️',
    closingTag: 'Doa terbaik kami selalu menyertai langkahmu!',
  },
  5: {
    // Jumat (Friday)
    dayName: 'Jumat',
    themeTag: 'Jumat Berkah & Berlimpah Rahmat',
    greetingIntro: 'Jumat Berkah, Hari Kelahiranmu yang Suci!',
    bodyNote:
      'Sayyidul Ayyam, hari Jumat yang penuh keberkahan bertepatan dengan hari ulang tahunmu. Semoga umurmu dipanjangkan dalam ketaatan, rezeki yang berkah mengalir deras, dan hatimu senantiasa dipenuhi ketenangan.',
    emojiSequence: '🕌✨🤲🎂🌺',
    closingTag: 'Semoga berkah tiada henti melimpahimu!',
  },
  6: {
    // Sabtu (Saturday)
    dayName: 'Sabtu',
    themeTag: 'Sabtu Perayaan & Ceria Bersama',
    greetingIntro: 'Sabtu Seru, Pesta Ulang Tahun Menanti!',
    bodyNote:
      'Selamat berakhir pekan dan selamat ulang tahun! Waktunya berpesta, tertawa lepas, dan merayakan pencapaian hidupmu. Semoga tahun ini jadi tahun paling spektakuler dan penuh petualangan seru.',
    emojiSequence: '🥳🎸🍕🎈💃',
    closingTag: 'Rayakan hari ini dengan sukacita maksimal!',
  },
};

// Variation generator: Produces unique WhatsApp message texts tailored by profile & today's day
export function generateDailyWhatsAppMessage(
  card: GreetingCard,
  dayOffset: number = 0,
  includeLink: boolean = true
): { title: string; message: string; dayLabel: string; url: string } {
  const now = new Date();
  if (dayOffset !== 0) {
    now.setDate(now.getDate() + dayOffset);
  }
  const dayIndex = now.getDay();
  const dailyTheme = DAILY_WISH_TEMPLATES[dayIndex];
  const targetUrl = `${window.location.origin}/?card=${card.id}`;
  const nickname = card.nickname || card.recipientName;

  // Profile-specific emotional touch
  let customTone = '';
  switch (card.profile) {
    case 'pasangan':
      customTone = `Di hari ${dailyTheme.dayName} yang indah ini, rasa syukurku bertambah karena memiliki sosok seindah kamu di sampingku. Setiap detak jantungku mendoakan kebahagiaanmu. ❤️`;
      break;
    case 'teman':
      customTone = `Hari ${dailyTheme.dayName} ini spesial banget karena sahabat terbaikku lagi nambah umur! Wajib traktir dan jangan lupa bahagia selalu ya bro/sis! 🔥`;
      break;
    case 'keluarga':
      customTone = `Di hari ${dailyTheme.dayName} yang penuh berkah ini, keluarga besar senantiasa mendoakan kesehatan, panjang umur, dan kelimpahan rezeki untukmu. 🏡`;
      break;
    case 'rekan':
      customTone = `Di hari ${dailyTheme.dayName} ini, kami segenap rekan menyampaikan selamat ulang tahun. Sukses selalu untuk karier dan impian-impian cemerlangmu ke depan! 💼`;
      break;
    default:
      customTone = `Hari ${dailyTheme.dayName} yang berbahagia untuk merayakan sosok istimewa sepertimu.`;
  }

  const lines = [
    `*Selamat Ulang Tahun, ${nickname}!* ${dailyTheme.emojiSequence}`,
    `_${dailyTheme.themeTag}_`,
    '',
    `"${card.cardTitle}"`,
    '',
    `${dailyTheme.greetingIntro}`,
    `${customTone}`,
    '',
    `${dailyTheme.bodyNote}`,
    '',
    card.highlightQuote ? `> _"${card.highlightQuote}"_` : '',
    '',
    includeLink
      ? `🎁 *Buka Kartu Interaktif, Tiup Lilin & Dengarkan Lagu Spesialmu di Sini:*\n👉 ${targetUrl}`
      : '',
    '',
    `_Salam hangat & penuh cinta: *${card.senderName}*_`,
  ].filter((l) => l !== '');

  return {
    title: `${dailyTheme.dayName} - ${dailyTheme.themeTag}`,
    dayLabel: dailyTheme.dayName,
    message: lines.join('\n'),
    url: targetUrl,
  };
}

// Generate direct wa.me link
export function getDailyWhatsAppLink(card: GreetingCard, dayOffset: number = 0): string {
  const cleanPhone = (card.whatsappNumber || '').replace(/[^0-9]/g, '');
  const { message } = generateDailyWhatsAppMessage(card, dayOffset, true);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
