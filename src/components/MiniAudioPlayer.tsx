import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MusicPresetId } from '../types';
import { MUSIC_PRESETS } from '../data/themes';
import { birthdayAudio } from '../utils/audioSynthesizer';
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Disc3,
  ListMusic,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MiniAudioPlayerProps {
  currentPreset: MusicPresetId;
  isPlaying: boolean;
  isMuted: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onChangePreset?: (newPreset: MusicPresetId) => void;
  allowPresetSwitching?: boolean;
}

export const MiniAudioPlayer: React.FC<MiniAudioPlayerProps> = ({
  currentPreset,
  isPlaying,
  isMuted,
  onTogglePlay,
  onToggleMute,
  onChangePreset,
  allowPresetSwitching = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(75);
  const info = MUSIC_PRESETS[currentPreset] || MUSIC_PRESETS.kids_happy_birthday;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolumeLevel(val);
    birthdayAudio.setVolume(val / 100);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-[320px] sm:max-w-sm w-[calc(100vw-32px)]">
      <motion.div
        layout
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="rounded-2xl backdrop-blur-xl bg-white/90 dark:bg-zinc-900/90 border border-rose-200/80 dark:border-rose-900/60 shadow-2xl overflow-hidden p-3.5"
      >
        {/* PLAYER MAIN ROW */}
        <div className="flex items-center justify-between gap-2.5">
          {/* Vinyl Disc Animation */}
          <div className="relative flex-shrink-0">
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-black text-rose-400 flex items-center justify-center shadow-md border-2 border-rose-400/40 relative"
            >
              <Disc3 className="w-6 h-6 text-rose-300" />
              {/* Center hole */}
              <div className="absolute w-2 h-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-500" />
            </motion.div>
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            )}
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300">
                Lagu Kartu
              </span>
              {isPlaying && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 animate-spin" /> Sedang Diputar
                </span>
              )}
            </div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
              {info.name}
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              {info.mood}
            </p>
          </div>

          {/* Controls: Play/Pause, Mute, Expand */}
          <div className="flex items-center gap-1">
            <button
              id="btn-mini-play-pause"
              onClick={onTogglePlay}
              className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md cursor-pointer transition-transform active:scale-95"
              title={isPlaying ? 'Jeda Musik' : 'Putar Musik'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              id="btn-mini-mute"
              onClick={onToggleMute}
              className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              title={isMuted ? 'Nyalakan Suara' : 'Bisukan'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {allowPresetSwitching && (
              <button
                id="btn-mini-expand-playlist"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-7 h-7 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center justify-center cursor-pointer"
                title="Pilih Lagu Lain"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* EXPANDED CONTROLS & PLAYLIST */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 pt-3 border-t border-zinc-200/70 dark:border-zinc-800/80 space-y-2.5 overflow-hidden"
            >
              {/* Volume slider */}
              <div className="flex items-center gap-2 px-1">
                <Volume2 className="w-3 h-3 text-zinc-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumeLevel}
                  onChange={handleVolumeChange}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <span className="text-[10px] text-zinc-400 w-6 text-right font-mono">
                  {volumeLevel}%
                </span>
              </div>

              {/* Preset List Selection */}
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                  Ganti Pilihan Musik:
                </div>
                {(Object.keys(MUSIC_PRESETS) as MusicPresetId[]).map((pId) => {
                  const p = MUSIC_PRESETS[pId];
                  const isCurrent = currentPreset === pId;
                  return (
                    <button
                      key={pId}
                      onClick={() => {
                        if (onChangePreset) onChangePreset(pId);
                        birthdayAudio.playBackgroundMusic(pId);
                      }}
                      className={`w-full text-left p-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 font-semibold border border-rose-500/20'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="truncate pr-2">{p.name}</span>
                      {isCurrent && <span className="text-[10px] text-rose-500">Aktif</span>}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
