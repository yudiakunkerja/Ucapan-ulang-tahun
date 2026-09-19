import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MemoryPhoto } from '../types';
import { ChevronLeft, ChevronRight, ZoomIn, X, Camera } from 'lucide-react';

interface PhotoCarouselProps {
  photos: MemoryPhoto[];
  recipientName: string;
}

export const PhotoCarousel: React.FC<PhotoCarouselProps> = ({ photos, recipientName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxPhoto, setLightboxPhoto] = useState<MemoryPhoto | null>(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-6 px-4 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl bg-white/40 dark:bg-zinc-900/40">
        <Camera className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
        <p className="text-xs text-zinc-500">Belum ada foto kenangan yang ditambahkan.</p>
      </div>
    );
  }

  const current = photos[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="relative w-full max-w-md mx-auto my-4 flex flex-col items-center select-none">
      <div className="flex items-center justify-between w-full px-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-rose-500" />
          <span>Galeri Kenangan Bersama</span>
        </span>
        <span className="text-xs text-zinc-400 font-mono">
          {currentIndex + 1} / {photos.length}
        </span>
      </div>

      {/* POLAROID FRAME */}
      <div className="relative w-full aspect-[4/5] max-w-xs sm:max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, rotate: -4, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, rotate: currentIndex % 2 === 0 ? 2 : -2, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -15 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="w-full h-full bg-white dark:bg-zinc-900 p-3 sm:p-4 pb-12 sm:pb-14 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between cursor-pointer group"
            onClick={() => setLightboxPhoto(current)}
          >
            {/* Pushpin decorative graphic */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
              <div className="w-4 h-4 rounded-full bg-rose-600 border-2 border-white shadow-md" />
            </div>

            {/* Photo Container */}
            <div className="relative w-full h-[78%] rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <img
                src={current.url}
                alt={current.caption}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="p-2 rounded-full bg-black/60 text-white backdrop-blur-sm">
                  <ZoomIn className="w-4 h-4" />
                </span>
              </div>
              {current.date && (
                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-white font-medium">
                  {current.date}
                </div>
              )}
            </div>

            {/* Polaroid Handwritten Caption */}
            <div className="pt-3 px-1 text-center">
              <p className="text-sm sm:text-base font-handwriting text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-relaxed font-serif">
                "{current.caption}"
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Buttons */}
        {photos.length > 1 && (
          <>
            <button
              id="btn-foto-sebelumnya"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-1 top-1/2 -translate-y-1/2 -translate-x-3 w-9 h-9 rounded-full bg-white/90 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-30 cursor-pointer"
              title="Foto Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id="btn-foto-berikutnya"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 translate-x-3 w-9 h-9 rounded-full bg-white/90 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-30 cursor-pointer"
              title="Foto Berikutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Dot Indicators */}
      {photos.length > 1 && (
        <div className="flex gap-1.5 mt-4">
          {photos.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 bg-rose-500'
                  : 'w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400'
              }`}
              title={`Foto ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxPhoto(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-xl w-full bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl p-4 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                id="btn-tutup-lightbox"
                onClick={() => setLightboxPhoto(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center z-10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-full max-h-[70vh] overflow-hidden rounded-lg bg-black flex items-center justify-center">
                <img
                  src={lightboxPhoto.url}
                  alt={lightboxPhoto.caption}
                  referrerPolicy="no-referrer"
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>

              <div className="mt-3 text-center px-2">
                <p className="text-white font-medium text-sm sm:text-base">
                  "{lightboxPhoto.caption}"
                </p>
                {lightboxPhoto.date && (
                  <p className="text-xs text-zinc-400 mt-1">{lightboxPhoto.date}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
