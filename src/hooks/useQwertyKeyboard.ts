//src/hooks/useQwertyKeyboard.ts

import { useEffect, useRef } from 'react';

interface KeyboardMapping {
  [key: string]: { note: string; octave: number };
}

export const useQwertyKeyboard = (
  keyboardMapping: KeyboardMapping,
  playNote: (note: string, duration?: number, velocity?: number, origin?: string) => void,
  stopNote: (note: string, origin?: string) => void
) => {
  const pressedKeys = useRef<Set<string>>(new Set());
  const activeKeyToNoteMap = useRef<Map<string, string>>(new Map());

  const playNoteRef = useRef(playNote);
  const stopNoteRef = useRef(stopNote);
  const keyboardMappingRef = useRef(keyboardMapping);

  useEffect(() => {
    playNoteRef.current = playNote;
    stopNoteRef.current = stopNote;
    keyboardMappingRef.current = keyboardMapping;
  }, [playNote, stopNote, keyboardMapping]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (pressedKeys.current.has(key) || event.repeat) return;

      // Ignore if typing in text inputs or code editors
      if (
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'INPUT'
      ) {
        return;
      }

      const mapping = keyboardMappingRef.current[key];
      if (mapping) {
        event.preventDefault();
        pressedKeys.current.add(key);

        let noteToPlay: string;
        if (event.shiftKey && !['E', 'B'].includes(mapping.note)) {
          noteToPlay = `${mapping.note}#${mapping.octave}`;
        } else if (event.altKey && !['C', 'F'].includes(mapping.note)) {
          noteToPlay = `${mapping.note}b${mapping.octave}`;
        } else {
          noteToPlay = `${mapping.note}${mapping.octave}`;
        }

        playNoteRef.current(noteToPlay, undefined, 0.7, 'QWERTY Key');
        activeKeyToNoteMap.current.set(key, noteToPlay);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      pressedKeys.current.delete(key);

      if (
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'INPUT'
      ) {
        return;
      }

      const noteToStop = activeKeyToNoteMap.current.get(key);
      if (noteToStop) {
        stopNoteRef.current(noteToStop, 'QWERTY Key');
        activeKeyToNoteMap.current.delete(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      pressedKeys.current.clear();
      activeKeyToNoteMap.current.clear();
    };
  }, []);
};
