// src/components/KeyboardHint.tsx

import React, { useMemo, useEffect } from 'react';
import { X } from 'lucide-react';
import { normalizeNote } from '../utils/musicUtils';

interface KeyboardHintProps {
  targetNote: string;
  onClose: () => void;
}

const pianoKeyLayout = [
  // White Keys
  { note: 'C', computerKey: 'a', type: 'white' },
  { note: 'D', computerKey: 's', type: 'white' },
  { note: 'E', computerKey: 'd', type: 'white' },
  { note: 'F', computerKey: 'f', type: 'white' },
  { note: 'G', computerKey: 'g', type: 'white' },
  { note: 'A', computerKey: 'h', type: 'white' },
  { note: 'B', computerKey: 'j', type: 'white' },
  // Black Keys (with corresponding flat notes)
  { note: 'C#', flatNote: 'Db', computerKey: 'w', type: 'black', position: 0.7 },
  { note: 'D#', flatNote: 'Eb', computerKey: 'e', type: 'black', position: 1.7 },
  { note: 'F#', flatNote: 'Gb', computerKey: 't', type: 'black', position: 3.7 },
  { note: 'G#', flatNote: 'Ab', computerKey: 'y', type: 'black', position: 4.7 },
  { note: 'A#', flatNote: 'Bb', computerKey: 'u', type: 'black', position: 5.7 },
];

export const KeyboardHint: React.FC<KeyboardHintProps> = ({
  targetNote,
  onClose
}) => {
  // Memoize all derived note properties at once to avoid re-calculation and ensure consistency.
  const noteInfo = useMemo(() => {
    if (!targetNote || targetNote === 'rest') {
      return { searchNoteName: null, targetOctave: 4, displayNote: targetNote };
    }

    const normalized = normalizeNote(targetNote);
    const match = normalized.match(/^([A-G]#?)(\d+)$/);

    if (!match) {
      return { searchNoteName: null, targetOctave: 4, displayNote: targetNote };
    }

    // The normalized note name (e.g., "A#") is our search key
    const searchName = match[1];
    const octave = parseInt(match[2], 10);

    // Display the original note ("Bb4") for user clarity
    return { searchNoteName: searchName, targetOctave: octave, displayNote: targetNote };
  }, [targetNote]);

  const { searchNoteName, targetOctave, displayNote } = noteInfo;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-xl p-6 max-w-lg w-full border border-purple-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            Play Note: <span className="text-yellow-400">{displayNote}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-purple-200 mb-4 text-center">
            Press the highlighted key on your computer keyboard.
          </p>

          <div className="relative h-40">
            <div className="flex justify-center h-full">
              {pianoKeyLayout.filter(k => k.type === 'white').map(key => {
                const isHighlighted = searchNoteName === key.note;
                return (
                  <div key={key.computerKey} className={`w-12 h-full border-2 border-slate-500 rounded-b-lg flex flex-col justify-end items-center p-2 transition-all ${isHighlighted ? 'bg-yellow-400 text-black animate-pulse scale-105 shadow-lg shadow-yellow-400/50' : 'bg-white text-slate-600'}`}>
                    <span className="text-2xl font-bold">{key.computerKey.toUpperCase()}</span>
                    <span className="text-xs">{key.note}{targetOctave}</span>
                  </div>
                );
              })}
            </div>
            {pianoKeyLayout.filter(k => k.type === 'black').map(key => {
              const isHighlighted = searchNoteName === key.note;
              return (
                <div key={key.computerKey} className={`absolute top-0 w-8 h-24 border-2 border-slate-900 rounded-b-lg flex flex-col justify-end items-center p-1 z-10 transition-all text-center leading-tight ${isHighlighted ? 'bg-yellow-400 text-black animate-pulse scale-105 shadow-lg shadow-yellow-400/50' : 'bg-black text-white'}`} style={{ left: `calc(50% - (3.5 * 3rem) + (${key.position!} * 3rem))` }}>
                  <span className="text-xl font-bold mb-1">{key.computerKey.toUpperCase()}</span>
                  <div className="text-[10px] font-medium">
                    <div>{key.note}{targetOctave}</div>
                    <div>{key.flatNote}{targetOctave}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};