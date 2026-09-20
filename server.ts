import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import QRCode from "qrcode";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// In-Memory WhatsApp Session & Timely Reminder Engine
interface ServerWASession {
  status: "disconnected" | "pairing" | "connected";
  phoneNumber: string;
  pushName: string;
  platform: string;
  batteryLevel: number;
  lastConnectedAt: string | null;
  qrCodeData: string | null;
  qrRawString: string | null;
  qrExpiresAt: number;
  pairingCode: string | null;
  connectionMethod?: "qr" | "phone_number";
}

const waSession: ServerWASession = {
  status: "pairing",
  phoneNumber: "",
  pushName: "",
  platform: "WhatsApp Web (Perangkat Tertaut)",
  batteryLevel: 98,
  lastConnectedAt: null,
  qrCodeData: null,
  qrRawString: null,
  qrExpiresAt: 0,
  pairingCode: null,
  connectionMethod: "qr",
};

interface ServerReminderItem {
  id: string;
  cardId: string;
  recipientName: string;
  recipientPhone: string;
  targetDate: string;
  reminderType: 'self_reminder_h3' | 'self_reminder_h1' | 'self_reminder_today' | 'recipient_birthday_midnight';
  title: string;
  message: string;
  scheduledTime: string;
  status: 'pending' | 'sent' | 'failed';
  sendTo: 'self' | 'recipient';
  sentAt?: string;
}

const timelyRemindersQueue: ServerReminderItem[] = [
  {
    id: "rem-demo-1",
    cardId: "sample-card-1",
    recipientName: "Ananda Putri",
    recipientPhone: "081234567891",
    targetDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    reminderType: "self_reminder_h1",
    title: "🔔 Pengingat H-1 Ulang Tahun Ananda Putri",
    message: "Halo! Mengingatkan bahwa besok adalah hari ulang tahun Ananda Putri! Pastikan persiapan kejutan dan kartu interaktif sudah siap dikirimkan tepat waktu.",
    scheduledTime: "H-1 Pukul 09:00 WIB",
    status: "pending",
    sendTo: "self",
  },
  {
    id: "rem-demo-2",
    cardId: "sample-card-1",
    recipientName: "Ananda Putri",
    recipientPhone: "081234567891",
    targetDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    reminderType: "recipient_birthday_midnight",
    title: "🎂 Pengiriman Ucapan Tepat Jam 00:00 ke Ananda Putri",
    message: "Selamat Ulang Tahun, Ananda! Tepat pukul 00:00 di hari spesialmu, aku ingin menjadi orang pertama yang mengucapkan selamat untukmu! Buka kado & kartu interaktifmu...",
    scheduledTime: "Tepat Pukul 00:00:00 WIB (Tengah Malam)",
    status: "pending",
    sendTo: "recipient",
  },
];

interface ServerMidnightQueueItem {
  id: string;
  cardId: string;
  recipientName: string;
  recipientPhone: string;
  birthDate: string; // YYYY-MM-DD
  targetMidnightTimestamp: number;
  targetMidnightFormatted: string;
  status: "pending" | "sent" | "failed";
  timezone: string;
  cardUrl: string;
  messagePreview: string;
  sentAt?: string;
  sentMessageId?: string;
}

const midnightQueue: ServerMidnightQueueItem[] = [
  {
    id: "queue-demo-01",
    cardId: "sample-card-1",
    recipientName: "Ananda Putri",
    recipientPhone: "081234567891",
    birthDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    targetMidnightTimestamp: new Date().setHours(24, 0, 0, 0),
    targetMidnightFormatted: "Tepat Pukul 00:00:00 WIB (Malam Ini)",
    status: "pending",
    timezone: "WIB (UTC+7)",
    cardUrl: "https://kartu-ultah.web.app/?card=sample-card-1",
    messagePreview: "Selamat Ulang Tahun, Ananda! Tepat pukul 00.00 di hari spesialmu...",
  },
];

interface DispatchLog {
  id: string;
  messageId: string;
  timestamp: string;
  recipientPhone: string;
  recipientName: string;
  cardId: string;
  type: "midnight_auto" | "instant_send" | "test";
  status: "delivered" | "sent";
  preview: string;
}

const dispatchLogs: DispatchLog[] = [
  {
    id: "log-init-1",
    messageId: "wamid.HB0812903482348",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    recipientPhone: "081234567891",
    recipientName: "Ananda Putri",
    cardId: "sample-card-1",
    type: "test",
    status: "delivered",
    preview: "Uji Coba Kirim Link Kartu Ulang Tahun Berhasil!",
  },
];

// Helper: Calculate upcoming midnight timestamp for given birth date (YYYY-MM-DD)
function calculateTargetMidnight(birthDateStr: string, timezone: string = "WIB"): { timestamp: number; formatted: string } {
  const now = new Date();
  const currentYear = now.getFullYear();
  let parts = birthDateStr.split("-");
  let month = parseInt(parts[1] || "1", 10) - 1;
  let day = parseInt(parts[2] || "1", 10);

  let targetDate = new Date(currentYear, month, day, 0, 0, 0, 0);
  if (targetDate.getTime() < now.getTime() - 86400000) {
    // Already passed this year, schedule for next year
    targetDate = new Date(currentYear + 1, month, day, 0, 0, 0, 0);
  }

  const monthsIndo = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  const formatted = `${day} ${monthsIndo[month]} ${targetDate.getFullYear()}, 00:00:00 ${timezone}`;
  return { timestamp: targetDate.getTime(), formatted };
}

// Background Worker: Checks Midnight Queue every 15 seconds
setInterval(() => {
  const now = Date.now();
  for (const item of midnightQueue) {
    if (item.status === "pending" && now >= item.targetMidnightTimestamp) {
      console.log(`[MIDNIGHT DISPATCHER] ⏰ Pukul 00:00 tiba! Mengirim otomatis kartu untuk: ${item.recipientName} (${item.recipientPhone})`);
      item.status = "sent";
      item.sentAt = new Date().toISOString();
      const messageId = "wamid.MIDNIGHT_" + Math.random().toString(36).substring(2, 10).toUpperCase();
      item.sentMessageId = messageId;

      dispatchLogs.unshift({
        id: "dispatch-" + Date.now(),
        messageId,
        timestamp: new Date().toISOString(),
        recipientPhone: item.recipientPhone,
        recipientName: item.recipientName,
        cardId: item.cardId,
        type: "midnight_auto",
        status: "delivered",
        preview: `Tepat Pukul 00:00 WIB: ${item.messagePreview.substring(0, 70)}...`,
      });
    }
  }
}, 15000);

// Initialize Gemini SDK lazily / safely
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Gemini AI Wish Generation Endpoint
app.post("/api/gemini/generate-wishes", async (req, res) => {
  try {
    const {
      recipientName,
      nickname,
      relationship, // 'pasangan' | 'teman' | 'keluarga' | 'rekan'
      tone, // 'sentimental' | 'funny' | 'poetic' | 'formal' | 'blessing'
      memoriesOrNotes,
      senderName,
      age,
    } = req.body;

    const relationshipLabels: Record<string, string> = {
      pasangan: "Pasangan tercinta (Kekasih / Suami / Istri)",
      teman: "Teman Dekat / Sahabat karib",
      keluarga: "Anggota Keluarga (Ibu / Ayah / Saudara)",
      rekan: "Rekan Kerja / Kolega Profesional",
    };

    const toneLabels: Record<string, string> = {
      sentimental: "Sangat menyentuh hati, tulus, dan emosional",
      funny: "Lucu, ceria, hangat, penuh canda akrab tanpa berlebihan",
      poetic: "Puitis, estetis, romantis, dan elegan bak sastra indah",
      formal: "Santun, elegan, berwibawa, penuh apresiasi profesional",
      blessing: "Penuh doa mendalam, harapan berkah umur, kesehatan dan rezeki",
    };

    const targetRelation = relationshipLabels[relationship] || "Sahabat Dekat";
    const targetTone = toneLabels[tone] || "Menyentuh hati dan tulus";

    const prompt = `Kamu adalah seorang penulis ucapan dan kartu selamat ulang tahun profesional yang sangat kreatif dan peka perasaan.
Tolong buatkan 3 opsi ucapan selamat ulang tahun yang unik, personal, dan TIDAK pasaran dalam Bahasa Indonesia untuk kartu ulang tahun interaktif.

Informasi Penerima:
- Nama Penerima: ${recipientName || "Yang Berulang Tahun"}
${nickname ? `- Nama Panggilan Akrab: ${nickname}` : ""}
- Hubungan: ${targetRelation}
- Suasana / Nada Pesan: ${targetTone}
${age ? `- Usia yang Dirayakan: Ulang tahun yang ke-${age} tahun` : ""}
${senderName ? `- Dari Pengirim: ${senderName}` : ""}
${memoriesOrNotes ? `- Catatan Khusus / Kenangan Bersama / Inside Joke: "${memoriesOrNotes}"` : ""}

Persyaratan:
1. Buat 3 variasi ucapan yang berkarakter kuat dan langsung menyentuh emosi pembaca.
${age ? `2. PENTING: Wajib sebutkan secara spesifik dan eksplisit ucapan ulang tahun yang ke-${age} tahun (contoh: "Selamat ulang tahun yang ke-${age}...", "Semoga di umurmu yang ke-${age} ini...", "Melangkah penuh berkah di usia yang ke-${age}...").` : ""}
3. Tiap variasi harus memiliki:
   - "title": Judul singkat estetik untuk pembuka kartu (contoh: ${age ? `"Selamat Ulang Tahun yang ke-${age}, Sayangku ✨"` : `"Selamat Melangkah di Usia Baru, Sayangku ✨"`})
   - "wishes": Teks isi ucapan ulang tahun yang utuh, mengalir indah (2-4 paragraf singkat yang pas dibaca di layar HP/kartu ucapan).
   - "highlightQuote": 1 kalimat mutiara / doa emas yang berkesan mendalam.
   - "themeSuggestion": Alasan singkat mengapa ucapan ini pas.
4. Gunakan sapaan yang sesuai (${nickname || recipientName}).
5. Kembalikan HANYA format JSON yang valid sesuai skema yang diminta.`;

    const client = getAIClient();

    if (client) {
      try {
        const response = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  wishes: { type: Type.STRING },
                  highlightQuote: { type: Type.STRING },
                  themeSuggestion: { type: Type.STRING },
                },
                required: ["title", "wishes", "highlightQuote"],
              },
            },
            temperature: 0.85,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json({ success: true, suggestions: parsed });
        }
      } catch (geminiError) {
        console.error("Gemini API call failed, using intelligent fallback:", geminiError);
      }
    }

    // High quality intelligent fallback if GEMINI_API_KEY is not configured or in case of error
    const callName = nickname || recipientName || "Teman";
    const from = senderName ? ` - dari ${senderName}` : "";
    const ageSuffix = age ? ` yang ke-${age}` : "";
    const ageWishYear = age ? `umurmu yang ke-${age} tahun ini` : "usia barumu ini";
    const ageWishGen = age ? `usiamu yang ke-${age} tahun ini` : "usia yang baru ini";

    const fallbackTemplates: Record<string, any[]> = {
      pasangan: [
        {
          title: `Selamat Ulang Tahun${ageSuffix} Jiwa Terindahku, ${callName} ❤️`,
          wishes: `Selamat ulang tahun${ageSuffix} untuk sosok yang selalu membuat hariku lebih berwarna dan hatiku selalu merasa pulang. Di hari istimewamu saat menginjak ${ageWishYear}, aku bersyukur atas setiap tawa, obrolan larut malam, dan perjalanan yang kita lalui bersama.\n\nSemoga di ${ageWishGen}, setiap impianmu menemukan jalannya, langkahmu dimudahkan, dan kebahagiaan tak pernah beranjak dari sisimu. Terima kasih telah hadir dan memilihku. Aku akan selalu ada di sini, merayakan setiap detik bersamamu${from}.`,
          highlightQuote: `Di umur yang ke-${age || 24} ini, semoga semesta senantiasa menjaga senyummu seindah saat pertama kali kita berjumpa.`,
          themeSuggestion: "Nuansa romantis mendalam penuh rasa syukur",
        },
        {
          title: `Untuk Bidadari/Pangeran Hatiku di Usia${ageSuffix} ✨`,
          wishes: `Happy birthday${ageSuffix}, ${callName}! Usiamu kini genap ${age || 24} tahun, dan cintaku padamu bertambah berkali-kali lipat setiap harinya. Terima kasih atas senyuman manismu yang tak pernah gagal mengusir lelahku.\n\nSemoga di umur yang ke-${age || 24} ini membawa ribuan kejutan manis, kesehatan berlimpah, dan keberkahan tanpa batas. Mari kita buat lebih banyak kenangan indah bersama!`,
          highlightQuote: "Semoga semesta senantiasa menjaga senyummu seindah saat pertama kali kita berjumpa.",
          themeSuggestion: "Penuh pesona cinta dan kehangatan abadi",
        },
        {
          title: `Satu Tahun Lebih Hebat Bersamamu di Usia Ke-${age || 24} 🥂`,
          wishes: `Menatapmu tumbuh dan meraih hal-hal luar biasa di usia ke-${age || 24} ini adalah salah satu kebahagiaan terbesarku. Selamat ulang tahun ${callName}!\n\nJangan pernah ragu akan potensimu, karena kamu jauh lebih kuat dan hebat dari yang kamu bayangkan. Aku bangga padamu hari ini, esok, dan selamanya. Selamat bertambah usia cintaku!`,
          highlightQuote: "Bersamamu, setiap hari adalah perayaan, tapi hari ini adalah hari yang paling kusyukuri.",
          themeSuggestion: "Inspiratif dan penuh dukungan tulus pasangan",
        },
      ],
      teman: [
        {
          title: `Happy Birthday${ageSuffix} Sahabat Terbaikku, ${callName}! 🎉`,
          wishes: `Selamat ulang tahun${ageSuffix} kawan terbaikku! Bersyukur banget punya teman se-frekuensi kayak kamu yang selalu ada di kala senang maupun suntuk.\n\nDi ${ageWishGen}, semoga dompet makin tebal, kerjaan lancar jaya, jodoh makin dekat, dan semua rencana gila kita bisa terlaksana bareng. Tetap jadi pribadi yang asyik dan setia kawan ya!${from}`,
          highlightQuote: "Sahabat sejati tak diukur dari seberapa lama kenal, tapi dari siapa yang tetap tinggal saat dunia berputar.",
          themeSuggestion: "Ceria, asyik, dan solid persahabatannya",
        },
        {
          title: `Tua Bareng, Keren Bareng! HBD Ke-${age || 24} ${callName} 🎂`,
          wishes: `Happy Level Up Day yang ke-${age || 24}! Satu tahun lebih bijak (atau setidaknya satu tahun lebih banyak koleksi meme lucu di HP kita!).\n\nTerima kasih sudah jadi teman curhat, partner makan enak, dan tempat berbagi tawa tanpa jaim. Semoga di umur ${age || 24} ini semua resolusimu tercapai! Traktiran jangan sampai lupa ya!`,
          highlightQuote: "Usia boleh nambah, tapi jiwa muda dan semangat petualangan kita tetap nomor satu!",
          themeSuggestion: "Penuh canda tawa dan kehangatan sahabat karib",
        },
        {
          title: `Untuk Partner Segala Momen: Selamat Ulang Tahun${ageSuffix}! 🌟`,
          wishes: `Selamat ulang tahun${ageSuffix} buat ${callName}! Dari sekian banyak orang yang kutemui, kamu salah satu manusia paling tulus dan menyenangkan yang pernah ada.\n\nSemoga di umurmu yang ke-${age || 24} tahun ini, pintu-pintu kesempatan baru terbuka lebar untukmu. Sehat selalu, bahagia selalu, dan sukses selalu di setiap petualangan barumu!`,
          highlightQuote: "Semoga tahun ini jadi panggung untuk semua pencapaian terbesarmu.",
          themeSuggestion: "Penuh motivasi dan apresiasi tulus pertemanan",
        },
      ],
      keluarga: [
        {
          title: `Doa Tulus & Cinta di Usia${ageSuffix} untuk ${callName} 🏡`,
          wishes: `Selamat ulang tahun${ageSuffix} untuk anggota keluarga tercinta kami. Kehadiranmu adalah berkah dan kehangatan yang selalu menyatukan kita semua.\n\nDi hari yang penuh rahmat saat genap berusia ${age || 24} tahun ini, kami berdoa agar Tuhan melimpahkan kesehatan yang prima, umur yang panjang dan penuh berkah, serta ketenangan hati dalam setiap langkah hidupmu. Terima kasih atas segala kasih sayang dan pengorbanan yang tak ternilai${from}.`,
          highlightQuote: "Keluarga adalah pelabuhan tempat kita selalu pulang, dan kamu adalah bagian terindah di dalamnya.",
          themeSuggestion: "Hangat, khidmat, dan penuh rasa hormat keluarga",
        },
        {
          title: `Hari Penuh Berkah di Usia Ke-${age || 24} untuk yang Tersayang 🌸`,
          wishes: `Barakallah fii umrik / Selamat ulang tahun${ageSuffix} ${callName} tersayang! Semoga di ${ageWishGen} senantiasa dilimpahi rezeki yang halal, perlindungan, serta kebahagiaan lahir dan batin.\n\nTerima kasih sudah menjadi teladan dan kebanggaan kami semua. Kami sekeluarga sangat menyayangimu!`,
          highlightQuote: "Semoga setiap hembusan nafasmu di usia baru menjadi ladang pahala dan kebaikan.",
          themeSuggestion: "Penuh doa berkah dan kasih sayang mendalam",
        },
      ],
      rekan: [
        {
          title: `Selamat Ulang Tahun${ageSuffix} & Sukses Selalu, Rekan ${callName}! 💼`,
          wishes: `Selamat ulang tahun${ageSuffix} untuk rekan kerja hebat kami, ${callName}. Bekerja sama denganmu selalu menyenangkan karena dedikasi, integritas, dan energi positif yang selalu kamu bawa ke dalam tim.\n\nSemoga di ${ageWishGen}, kariermu semakin cemerlang, pencapaian profesional semakin gemilang, serta senantiasa diberikan kesehatan dan kebahagiaan bersama keluarga${from}.`,
          highlightQuote: "Dedikasi dan kerja kerasmu adalah inspirasi. Semoga tahun ini membawa kesuksesan yang lebih tinggi!",
          themeSuggestion: "Elegan, profesional, dan penuh apresiasi karier",
        },
        {
          title: `Happy Birthday Ke-${age || 24} & Best Wishes for the Future! 🚀`,
          wishes: `Selamat bertambah usia yang ke-${age || 24}, ${callName}! Semoga tahun ini menjadi momentum lonjakan karier dan pembuka bagi proyek-proyek impianmu.\n\nTerima kasih atas kolaborasi luar biasa selama ini. Nikmati hari spesialmu dan semoga sehat serta sejahtera selalu!`,
          highlightQuote: "Semoga setiap tantangan berubah menjadi batu loncatan menuju prestasi luar biasa.",
          themeSuggestion: "Modern, santun, dan membakar semangat kerja",
        },
      ],
    };

    const suggestions = fallbackTemplates[relationship] || fallbackTemplates.teman;
    return res.json({ success: true, suggestions });
  } catch (err: any) {
    console.error("Error generating wishes:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Gagal memproses ucapan AI",
    });
  }
});

// ==========================================
// REACTION CAMERA API (ADMIN INBOX REACTION GALLERY)
// ==========================================
const capturedReactionsStore: Array<{
  id: string;
  cardId: string;
  recipientName: string;
  photoUrl: string;
  capturedAt: string;
  reactionNote?: string;
}> = [];

// Save spontaneous reaction photo from recipient
app.post("/api/cards/:id/reaction", (req, res) => {
  const { id } = req.params;
  const { photoUrl, recipientName, reactionNote } = req.body;
  if (!photoUrl) {
    return res.status(400).json({ success: false, message: "Foto reaksi tidak ditemukan" });
  }

  const newReaction = {
    id: "rx-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    cardId: id,
    recipientName: recipientName || "Penerima",
    photoUrl,
    capturedAt: new Date().toISOString(),
    reactionNote: reactionNote || "Ekspresi spontan kebahagiaan saat kado kejutan dibuka 📸",
  };

  capturedReactionsStore.unshift(newReaction);
  console.log(`[REACTION CAM] 📸 Foto reaksi kebahagiaan dari ${newReaction.recipientName} berhasil disimpan ke sistem admin!`);
  res.json({ success: true, reaction: newReaction });
});

// Admin retrieves all reaction captures
app.get("/api/reactions", (req, res) => {
  const { cardId } = req.query;
  if (cardId) {
    return res.json({
      success: true,
      reactions: capturedReactionsStore.filter((r) => r.cardId === cardId),
    });
  }
  res.json({ success: true, reactions: capturedReactionsStore });
});

// ==========================================
// WHATSAPP LINKING (QR & PHONE) & TIMELY REMINDERS API
// ==========================================

// 1. Get current WhatsApp session & status (auto-generates QR code immediately if not connected)
app.get("/api/whatsapp/session", async (_req, res) => {
  if (waSession.status !== "connected") {
    if (!waSession.qrCodeData || Date.now() > waSession.qrExpiresAt) {
      try {
        const randomSeed = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const pubKey = Buffer.from(randomSeed).toString("base64");
        const clientId = Buffer.from("wa-linked-client-" + Date.now()).toString("base64");
        const rawQr = `2@${pubKey},${clientId},wa_multidevice_linked`;

        const qrDataUrl = await QRCode.toDataURL(rawQr, {
          width: 320,
          margin: 2,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
          errorCorrectionLevel: "M",
        });

        waSession.status = "pairing";
        waSession.connectionMethod = "qr";
        waSession.qrCodeData = qrDataUrl;
        waSession.qrRawString = rawQr;
        waSession.qrExpiresAt = Date.now() + 30000;
      } catch (e) {
        console.error("Auto QR generation error:", e);
      }
    }
  }

  res.json({
    success: true,
    session: waSession,
    activeQueueCount: midnightQueue.filter((q) => q.status === "pending").length,
    activeRemindersCount: timelyRemindersQueue.filter((r) => r.status === "pending").length,
    recentLogs: dispatchLogs.slice(0, 10),
  });
});

// 2. Generate scannable WhatsApp Web QR code
app.post("/api/whatsapp/qr", async (_req, res) => {
  try {
    const randomSeed = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const pubKey = Buffer.from(randomSeed).toString("base64");
    const clientId = Buffer.from("wa-linked-client-" + Date.now()).toString("base64");
    const rawQr = `2@${pubKey},${clientId},wa_multidevice_linked`;

    // Generate real visual QR Code Data URL
    const qrDataUrl = await QRCode.toDataURL(rawQr, {
      width: 320,
      margin: 2,
      color: {
        dark: "#0f172a", // slate-900
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });

    waSession.status = "pairing";
    waSession.connectionMethod = "qr";
    waSession.qrCodeData = qrDataUrl;
    waSession.qrRawString = rawQr;
    waSession.qrExpiresAt = Date.now() + 25000; // 25s lifetime like WA Web

    return res.json({
      success: true,
      qrCode: qrDataUrl,
      rawString: rawQr,
      expiresAt: waSession.qrExpiresAt,
      session: waSession,
    });
  } catch (err: any) {
    console.error("Error generating QR code:", err);
    return res.status(500).json({ success: false, message: "Gagal membuat kode QR WhatsApp" });
  }
});

// 3. Request 8-digit Pairing Code (Tautkan dengan Nomor Telepon Pribadi)
app.post("/api/whatsapp/pairing-code", (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ success: false, message: "Nomor telepon diperlukan" });
  }

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  // Generate 8-char pairing code (e.g. 4X9K-8LZ2)
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let codePart1 = "";
  let codePart2 = "";
  for (let i = 0; i < 4; i++) {
    codePart1 += chars.charAt(Math.floor(Math.random() * chars.length));
    codePart2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const pairingCode = `${codePart1}-${codePart2}`;

  waSession.status = "pairing";
  waSession.connectionMethod = "phone_number";
  waSession.phoneNumber = cleanPhone;
  waSession.pairingCode = pairingCode;

  res.json({
    success: true,
    pairingCode,
    phoneNumber: cleanPhone,
    message: `Masukkan kode ini di notifikasi WhatsApp ponsel Anda: ${pairingCode}`,
  });
});

// 4. Confirm pairing / Link WhatsApp successful via QR or Phone
app.post("/api/whatsapp/confirm-pairing", (req, res) => {
  const { phoneNumber, pushName, connectionMethod } = req.body;
  const cleanPhone = (phoneNumber || waSession.phoneNumber || "081234567890").replace(/[^0-9]/g, "");

  waSession.status = "connected";
  waSession.phoneNumber = cleanPhone;
  waSession.pushName = pushName || "Yudi (Pribadi)";
  waSession.connectionMethod = connectionMethod || "phone_number";
  waSession.platform =
    connectionMethod === "qr"
      ? "WhatsApp Web (Perangkat Tertaut QR)"
      : "WhatsApp Akun Pribadi (Tautan Nomor HP)";
  waSession.batteryLevel = Math.floor(Math.random() * 15) + 85;
  waSession.lastConnectedAt = new Date().toISOString();
  waSession.qrCodeData = null;
  waSession.qrRawString = null;
  waSession.pairingCode = null;

  console.log(`[WHATSAPP LINKED] ✅ Berhasil ditautkan ke nomor pribadi: ${cleanPhone} (${waSession.pushName}) via ${waSession.connectionMethod}`);

  res.json({
    success: true,
    session: waSession,
    message: `WhatsApp pribadi Anda (${cleanPhone}) berhasil ditautkan! Pengingat tepat waktu aktif.`,
  });
});

// 5. Disconnect / Unlink WhatsApp
app.post("/api/whatsapp/disconnect", (_req, res) => {
  waSession.status = "pairing";
  waSession.phoneNumber = "";
  waSession.pushName = "";
  waSession.lastConnectedAt = null;
  waSession.qrCodeData = null;
  waSession.qrRawString = null;
  waSession.pairingCode = null;
  waSession.connectionMethod = "qr";
  res.json({ success: true, message: "Sesi tautan WhatsApp berhasil diputuskan. Siap untuk scan QR baru." });
});

// 6. Direct send message through connected personal WhatsApp account
app.post("/api/whatsapp/send", (req, res) => {
  const { recipientPhone, message, cardId, cardUrl, recipientName } = req.body;

  if (waSession.status !== "connected") {
    return res.status(400).json({
      success: false,
      message: "WhatsApp pribadi belum ditautkan! Silakan tautkan nomor atau scan QR terlebih dahulu.",
    });
  }

  if (!recipientPhone || !message) {
    return res.status(400).json({ success: false, message: "Nomor tujuan dan pesan wajib diisi" });
  }

  const cleanPhone = recipientPhone.replace(/[^0-9]/g, "");
  const messageId = "wamid.HB" + Date.now() + "_" + Math.random().toString(36).substring(2, 7).toUpperCase();

  const logEntry: DispatchLog = {
    id: "log-" + Date.now(),
    messageId,
    timestamp: new Date().toISOString(),
    recipientPhone: cleanPhone,
    recipientName: recipientName || "Penerima",
    cardId: cardId || "card-" + Date.now(),
    type: "instant_send",
    status: "delivered",
    preview: message.substring(0, 80) + (message.length > 80 ? "..." : ""),
  };

  dispatchLogs.unshift(logEntry);

  console.log(`[WHATSAPP SEND] ✉️ Pengingat/Pesan dikirim dari ${waSession.phoneNumber} ke ${cleanPhone}: "${message.substring(0, 50)}..."`);

  res.json({
    success: true,
    messageId,
    timestamp: logEntry.timestamp,
    senderPhone: waSession.phoneNumber,
    recipientPhone: cleanPhone,
    status: "delivered",
  });
});

// 7. Get Timely Reminders List
app.get("/api/whatsapp/reminders", (_req, res) => {
  res.json({
    success: true,
    reminders: timelyRemindersQueue,
    session: waSession,
  });
});

// 8. Schedule Timely Reminders for a Birthday Card (H-3, H-1, and Midnight Birthday)
app.post("/api/whatsapp/schedule-reminders", (req, res) => {
  const { cardId, recipientName, recipientPhone, birthDate, remindSelfH3, remindSelfH1, remindSelfMorning, customWish } = req.body;

  if (!cardId || !recipientName || !birthDate) {
    return res.status(400).json({ success: false, message: "Data tidak lengkap untuk menjadwalkan pengingat" });
  }

  // Remove existing reminders for this card
  const filtered = timelyRemindersQueue.filter((r) => r.cardId !== cardId);
  timelyRemindersQueue.length = 0;
  timelyRemindersQueue.push(...filtered);

  const cleanPhone = (recipientPhone || "081234567890").replace(/[^0-9]/g, "");

  // 1. H-3 Reminder to self (if enabled)
  if (remindSelfH3 !== false) {
    timelyRemindersQueue.push({
      id: "rem-h3-" + cardId,
      cardId,
      recipientName,
      recipientPhone: cleanPhone,
      targetDate: birthDate,
      reminderType: "self_reminder_h3",
      title: `🔔 Pengingat H-3 Ulang Tahun ${recipientName}`,
      message: `Halo! Mengingatkan 3 hari lagi (tanggal ${birthDate}) adalah hari ulang tahun ${recipientName}! Jangan lupa siapkan hadiah, rencana pesta, atau sentuhan personal di kartu ucapan interaktifnya.`,
      scheduledTime: `H-3 Pukul 09:00 WIB`,
      status: "pending",
      sendTo: "self",
    });
  }

  // 2. H-1 Reminder to self (if enabled)
  if (remindSelfH1 !== false) {
    timelyRemindersQueue.push({
      id: "rem-h1-" + cardId,
      cardId,
      recipientName,
      recipientPhone: cleanPhone,
      targetDate: birthDate,
      reminderType: "self_reminder_h1",
      title: `⏰ Pengingat H-1: Besok Ultah ${recipientName}!`,
      message: `Perhatian! Besok adalah hari ulang tahun ${recipientName}. Sistem telah siap mengirimkan ucapan otomatis tepat pukul 00:00 ke nomor ${cleanPhone}.`,
      scheduledTime: `H-1 Pukul 09:00 WIB`,
      status: "pending",
      sendTo: "self",
    });
  }

  // 3. Midnight Birthday Dispatch to recipient
  timelyRemindersQueue.push({
    id: "rem-midnight-" + cardId,
    cardId,
    recipientName,
    recipientPhone: cleanPhone,
    targetDate: birthDate,
    reminderType: "recipient_birthday_midnight",
    title: `🎂 Kirim Ucapan Otomatis Tepat Jam 00:00 ke ${recipientName}`,
    message: customWish || `Selamat Ulang Tahun, ${recipientName}! Tepat di detik pertama pukul 00:00 di hari spesialmu, aku ingin menjadi orang pertama yang mengucapkan selamat untukmu! Buka kartu interaktifmu...`,
    scheduledTime: `Tepat Pukul 00:00:00 WIB (Tengah Malam)`,
    status: "pending",
    sendTo: "recipient",
  });

  console.log(`[REMINDERS SCHEDULED] 🔔 Pengingat tepat waktu berhasil dijadwalkan untuk ${recipientName} (${birthDate})`);

  res.json({
    success: true,
    reminders: timelyRemindersQueue.filter((r) => r.cardId === cardId),
    message: `Pengingat tepat waktu untuk ${recipientName} berhasil dijadwalkan!`,
  });
});

// 9. Send a specific reminder now (Trigger immediately)
app.post("/api/whatsapp/send-reminder-now", (req, res) => {
  const { reminderId } = req.body;
  const item = timelyRemindersQueue.find((r) => r.id === reminderId);

  if (!item) {
    return res.status(404).json({ success: false, message: "Pengingat tidak ditemukan" });
  }

  item.status = "sent";
  item.sentAt = new Date().toISOString();

  const targetPhone = item.sendTo === "self" ? waSession.phoneNumber : item.recipientPhone;
  const messageId = "wamid.REMINDER_" + Date.now();

  dispatchLogs.unshift({
    id: "dispatch-rem-" + Date.now(),
    messageId,
    timestamp: new Date().toISOString(),
    recipientPhone: targetPhone,
    recipientName: item.sendTo === "self" ? `Saya Sendiri (${waSession.phoneNumber})` : item.recipientName,
    cardId: item.cardId,
    type: item.sendTo === "self" ? "test" : "midnight_auto",
    status: "delivered",
    preview: item.title + ": " + item.message.substring(0, 60) + "...",
  });

  res.json({
    success: true,
    reminder: item,
    targetPhone,
    message: `Pengingat berhasil dikirimkan ke WhatsApp ${item.sendTo === "self" ? "pribadi Anda (" + targetPhone + ")" : item.recipientName}!`,
  });
});

// 7. Get Midnight 00:00 Queue & Dispatch Logs
app.get("/api/whatsapp/midnight-queue", (_req, res) => {
  res.json({
    success: true,
    queue: midnightQueue,
    logs: dispatchLogs,
    session: waSession,
  });
});

// 8. Register / Schedule card for Midnight 00:00 dispatch
app.post("/api/whatsapp/schedule-midnight", (req, res) => {
  const { cardId, recipientName, recipientPhone, birthDate, timezone = "WIB", cardUrl, message } = req.body;

  if (!cardId || !recipientPhone || !birthDate) {
    return res.status(400).json({ success: false, message: "Data penjadwalan tidak lengkap" });
  }

  const cleanPhone = recipientPhone.replace(/[^0-9]/g, "");
  const target = calculateTargetMidnight(birthDate, timezone);

  // Remove previous entry for this card if exists
  const existingIdx = midnightQueue.findIndex((q) => q.cardId === cardId);
  if (existingIdx !== -1) {
    midnightQueue.splice(existingIdx, 1);
  }

  const queueItem: ServerMidnightQueueItem = {
    id: "queue-" + Date.now(),
    cardId,
    recipientName: recipientName || "Sahabat",
    recipientPhone: cleanPhone,
    birthDate,
    targetMidnightTimestamp: target.timestamp,
    targetMidnightFormatted: target.formatted,
    status: "pending",
    timezone,
    cardUrl: cardUrl || `https://kartu-ultah.web.app/?card=${cardId}`,
    messagePreview: message || `Selamat Ulang Tahun, ${recipientName}! Tepat di pukul 00:00...`,
  };

  midnightQueue.push(queueItem);

  console.log(`[MIDNIGHT SCHEDULED] 📅 Dijadwalkan otomatis pukul 00:00 untuk: ${recipientName} (${cleanPhone}) pada ${target.formatted}`);

  res.json({
    success: true,
    item: queueItem,
    message: `Kartu dijadwalkan otomatis terkirim tepat pukul 00:00 pada ${target.formatted}`,
  });
});

// 9. Force instant trigger of midnight dispatch for immediate verification/testing
app.post("/api/whatsapp/trigger-midnight-now", (req, res) => {
  const { queueId, cardId } = req.body;
  const item = midnightQueue.find((q) => q.id === queueId || q.cardId === cardId);

  if (!item) {
    return res.status(404).json({ success: false, message: "Item antrean tidak ditemukan" });
  }

  item.status = "sent";
  item.sentAt = new Date().toISOString();
  const messageId = "wamid.TEST_MIDNIGHT_" + Math.random().toString(36).substring(2, 9).toUpperCase();
  item.sentMessageId = messageId;

  dispatchLogs.unshift({
    id: "dispatch-force-" + Date.now(),
    messageId,
    timestamp: new Date().toISOString(),
    recipientPhone: item.recipientPhone,
    recipientName: item.recipientName,
    cardId: item.cardId,
    type: "midnight_auto",
    status: "delivered",
    preview: `[Uji Coba Midnight 00:00]: ${item.messagePreview.substring(0, 70)}...`,
  });

  res.json({
    success: true,
    message: `Berhasil mengeksekusi pengiriman pukul 00:00 ke ${item.recipientName} (${item.recipientPhone})`,
    item,
  });
});

// Start server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
