import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { birthdayAudio } from '../utils/audioSynthesizer';
import { Sparkles, Mic, Volume2, RotateCcw, Smartphone, Zap } from 'lucide-react';

interface InteractiveCakeProps {
  recipientName: string;
  age?: number;
  themeColor?: string;
  onBlownOut?: () => void;
}

export const InteractiveCake: React.FC<InteractiveCakeProps> = ({
  recipientName,
  age = 24,
  themeColor = '#e11d48',
  onBlownOut,
}) => {
  const [isBlown, setIsBlown] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [shakeEnabled, setShakeEnabled] = useState(false);
  const [shakeDetectedCount, setShakeDetectedCount] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastShakeTimeRef = useRef<number>(0);
  const lastAccRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

  // Calculate digits for number candle
  const displayAge = age && age > 0 ? age : 24;
  const candleDigits = String(displayAge).split('');

  // Trigger celebratory confetti explosion
  const triggerConfetti = () => {
    try {
      const end = Date.now() + 3.5 * 1000;
      const colors = ['#e11d48', '#fb7185', '#fbbf24', '#38bdf8', '#a855f7'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch {
      // Ignore if canvas is unsupported
    }
  };

  const handleBlowOut = () => {
    if (isBlown) return;
    setIsBlown(true);
    birthdayAudio.playCandleBlowOut();
    triggerConfetti();
    if (onBlownOut) onBlownOut();

    // Stop mic stream if active
    stopMic();
  };

  const handleRelight = () => {
    setIsBlown(false);
  };

  // Shake Phone to Blow Candle Detection
  useEffect(() => {
    if (isBlown) return;

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      const current = e.accelerationIncludingGravity || e.acceleration;
      if (!current || current.x === null || current.y === null || current.z === null) return;

      const now = Date.now();
      if (now - lastShakeTimeRef.current < 250) return; // debounce

      const deltaX = Math.abs(current.x - lastAccRef.current.x);
      const deltaY = Math.abs(current.y - lastAccRef.current.y);
      const deltaZ = Math.abs(current.z - lastAccRef.current.z);

      lastAccRef.current = { x: current.x, y: current.y, z: current.z };

      // Calculate shake magnitude
      const speed = deltaX + deltaY + deltaZ;
      if (speed > 18) {
        lastShakeTimeRef.current = now;
        setShakeDetectedCount((c) => c + 1);
        handleBlowOut();
      }
    };

    if (window.DeviceMotionEvent) {
      setShakeEnabled(true);
      window.addEventListener('devicemotion', handleDeviceMotion);
    }

    return () => {
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleDeviceMotion);
      }
    };
  }, [isBlown]);

  // Request iOS permission if needed
  const requestShakePermission = async () => {
    if (
      typeof (DeviceMotionEvent as any) !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setShakeEnabled(true);
        }
      } catch (e) {
        console.warn('DeviceMotion permission not granted', e);
      }
    } else {
      // Simulate a phone shake for desktop testing or devices without motion sensors
      handleBlowOut();
    }
  };

  // Microphone blow detection
  const startMicDetection = async () => {
    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      setMicActive(true);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkBlow = () => {
        if (!analyser || isBlown) return;
        analyser.getByteFrequencyData(dataArray);

        // Low frequency noise corresponds to puff/wind blowing into mic
        let sumLowFreq = 0;
        for (let i = 0; i < 15; i++) {
          sumLowFreq += dataArray[i];
        }
        const avg = sumLowFreq / 15;

        // Threshold for wind/blow
        if (avg > 75) {
          handleBlowOut();
          return;
        }

        if (streamRef.current) {
          requestAnimationFrame(checkBlow);
        }
      };

      requestAnimationFrame(checkBlow);
    } catch (err: any) {
      setMicError('Akses mikrofon tidak diizinkan. Silakan gunakan tombol tiup.');
      setMicActive(false);
    }
  };

  const stopMic = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMicActive(false);
  };

  useEffect(() => {
    return () => {
      stopMic();
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center p-6 select-none">
      {/* Decorative glow behind cake */}
      <div
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700"
        style={{
          backgroundColor: isBlown ? '#38bdf8' : themeColor,
          transform: isBlown ? 'scale(1.2)' : 'scale(1)',
        }}
      />

      {/* Birthday Banner when blown */}
      <AnimatePresence>
        {isBlown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="mb-4 text-center z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-500 dark:text-amber-300 font-bold text-sm tracking-wide shadow-lg backdrop-blur-md">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Lilin Berhasil Ditiup! Make a Wish ✨</span>
            </div>
            <h3 className="mt-2 text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-amber-400 to-violet-500 font-serif">
              Hore! Selamat Ulang Tahun, {recipientName}!
            </h3>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Birthday Cake Container with responsive auto-scaling */}
      <div className="w-full max-w-full overflow-visible flex flex-col items-center">
        <div
          id="interactive-birthday-cake"
          onClick={handleBlowOut}
          className="cursor-pointer group relative flex flex-col items-center py-6 transition-transform duration-300 hover:scale-105 select-none transform scale-[0.88] sm:scale-100 origin-center"
          title="Klik untuk meniup lilin!"
        >
          {/* CANDLES ROW: NUMBER CANDLES BASED ON AGE */}
          <div className="flex flex-col items-center mb-1 z-20">
            <div className="flex items-end justify-center gap-3 sm:gap-4">
              {candleDigits.map((digit, idx) => (
                <div key={idx} className="relative flex flex-col items-center">
                  {/* FLAME */}
                  <AnimatePresence>
                    {!isBlown ? (
                      <motion.div
                        className="relative mb-1"
                        animate={{
                          scale: [1, 1.15, 0.95, 1],
                          rotate: [-2, 3, -3, 2],
                        }}
                        transition={{
                          duration: 0.65 + idx * 0.15,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        {/* Outer Glow */}
                        <div className="absolute -inset-2.5 bg-amber-400/60 rounded-full blur-md animate-pulse" />
                        {/* Flame Shape */}
                        <div className="relative w-4 h-7 rounded-full bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 shadow-[0_0_14px_#f59e0b]" />
                        {/* Blue Core */}
                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-2 rounded-full bg-blue-400/90" />
                      </motion.div>
                    ) : (
                      /* Smoke Whisp after blown */
                      <motion.div
                        key="smoke"
                        initial={{ opacity: 0.85, y: 0, scaleX: 0.8 }}
                        animate={{ opacity: 0, y: -30, scaleX: 2.2 }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                        className="w-1.5 h-7 bg-gradient-to-t from-zinc-400 to-transparent rounded-full blur-[1px]"
                      />
                    )}
                  </AnimatePresence>

                  {/* WICK */}
                  <div className="w-0.5 h-2.5 bg-zinc-800 dark:bg-zinc-200" />

                  {/* 3D NUMBER CANDLE BODY */}
                  <div
                    className={`relative min-w-[38px] sm:min-w-[42px] h-14 sm:h-16 px-2 rounded-xl shadow-lg border-2 flex items-center justify-center font-serif font-black text-2xl sm:text-3xl select-none ${
                      idx % 2 === 0
                        ? 'bg-gradient-to-br from-rose-400 via-rose-500 to-red-600 text-white border-amber-300 shadow-rose-500/30'
                        : 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-amber-950 border-white shadow-amber-500/30'
                    }`}
                  >
                    {/* Wax Gloss Highlight */}
                    <div className="absolute top-1 left-1.5 w-2 h-4 rounded-full bg-white/40 blur-[0.5px] pointer-events-none" />
                    {/* Number Digit */}
                    <span className="drop-shadow-md tracking-tight leading-none">
                      {digit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Little Age Indicator Pill */}
            <div className="mt-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-[10px] font-bold text-amber-700 dark:text-amber-300 shadow-xs">
              Lilin Usia Ke-{displayAge} Tahun 🕯️
            </div>
          </div>

          {/* CAKE TOP TIER */}
          <div className="relative w-48 sm:w-52 h-14 rounded-t-2xl bg-gradient-to-r from-amber-100 via-pink-100 to-amber-100 dark:from-neutral-800 dark:via-rose-950/70 dark:to-neutral-800 border-2 border-amber-300/40 shadow-md flex items-center justify-center overflow-hidden">
            {/* Frosting Drips */}
            <div className="absolute top-0 inset-x-0 h-4 flex justify-between px-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-5 h-4 bg-white dark:bg-rose-900/80 rounded-b-full shadow-inner"
                />
              ))}
            </div>

            {/* Strawberry / Cherry Toppings */}
            <div className="flex gap-4 z-10">
              <span className="text-xl filter drop-shadow-sm">🍓</span>
              <span className="text-xl filter drop-shadow-sm">🍒</span>
              <span className="text-xl filter drop-shadow-sm">🍓</span>
            </div>
          </div>

          {/* CAKE MIDDLE TIER (ELEGANT BANNER - NO HORIZONTAL CUT-THROUGH LINES) */}
          <div className="relative w-64 sm:w-72 h-14 bg-gradient-to-r from-amber-200 via-rose-200 to-amber-200 dark:from-neutral-900 dark:via-rose-900 dark:to-neutral-900 border-x-2 border-amber-300/40 shadow-md flex items-center justify-center overflow-hidden px-3">
            <div className="flex items-center justify-center gap-2 whitespace-nowrap text-[11px] sm:text-xs font-black tracking-widest text-amber-950 dark:text-amber-100 uppercase drop-shadow-sm">
              <span className="text-amber-500 text-xs">✨</span>
              <span className="font-serif tracking-widest font-extrabold">HAPPY BIRTHDAY</span>
              <span className="text-amber-500 text-xs">✨</span>
            </div>
          </div>

          {/* CAKE BASE TIER (WITH CRYSTAL-CLEAR RECIPIENT NAME PLAQUE - NO LINES CROSSING) */}
          <div className="relative w-76 sm:w-84 h-22 rounded-b-2xl bg-gradient-to-r from-amber-300 via-pink-200 to-amber-300 dark:from-stone-900 dark:via-rose-950 dark:to-stone-900 border-2 border-amber-400/50 shadow-xl flex items-center justify-center px-4">
            {/* Opaque Solid Dark Chocolate Plaque - NO STRIPES, NO DIVIDERS, ZERO OBSTRUCTION */}
            <div className="relative z-20 mx-auto px-5 sm:px-7 py-2 rounded-2xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-2 border-amber-300 shadow-2xl flex items-center justify-center gap-2 max-w-[92%]">
              <span className="text-sm select-none">🍫</span>
              <span className="text-sm sm:text-base font-extrabold text-amber-200 dark:text-amber-100 font-serif tracking-wide truncate">
                {recipientName}
              </span>
              <span className="text-sm select-none">🎉</span>
            </div>
          </div>

          {/* CAKE PLATE */}
          <div className="w-84 sm:w-96 h-5 bg-gradient-to-r from-zinc-200 via-white to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800 rounded-full shadow-2xl border border-zinc-300 dark:border-zinc-600 -mt-1" />
        </div>
      </div>

      {/* ACTION CONTROLS */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 z-10">
        {!isBlown ? (
          <>
            <motion.button
              id="btn-tiup-lilin"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBlowOut}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 text-white font-semibold text-sm shadow-lg hover:shadow-rose-500/25 flex items-center gap-2 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Tiup Lilin Sekarang 🎂</span>
            </motion.button>

            {/* Shake Phone to blow candle button */}
            <motion.button
              id="btn-goyang-hp"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={requestShakePermission}
              className="px-4 py-2.5 rounded-full text-xs font-semibold bg-amber-500/15 dark:bg-amber-400/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Goyangkan HP untuk meniup lilin!"
            >
              <Smartphone className="w-3.5 h-3.5 animate-bounce" />
              <span>Goyangkan HP untuk Meniup 📱💨</span>
            </motion.button>

            <button
              id="btn-deteksi-mic"
              onClick={micActive ? stopMic : startMicDetection}
              className={`px-4 py-2.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                micActive
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-600 dark:text-emerald-400 animate-pulse'
                  : 'bg-white/70 dark:bg-zinc-800/70 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{micActive ? 'Mendengarkan Tiupan... (Tiup ke Mic)' : 'Tiup via Mic'}</span>
            </button>
          </>
        ) : (
          <motion.button
            id="btn-nyalakan-kembali"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRelight}
            className="px-5 py-2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 flex items-center gap-2 shadow cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nyalakan Lilin Lagi</span>
          </motion.button>
        )}
      </div>

      {micError && (
        <p className="mt-2 text-xs text-rose-500 text-center max-w-xs">{micError}</p>
      )}

      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 text-center flex items-center justify-center gap-1.5">
        {!isBlown ? (
          <>
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Tips: Kamu bisa <b>goyang HP</b>, tiup ke mic, atau klik lilin untuk meniupnya!</span>
          </>
        ) : (
          <span>✨ Lilin berhasil ditiup! Semoga semua harapan terkabul.</span>
        )}
      </p>
    </div>
  );
};
