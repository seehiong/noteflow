// src/App.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { Piano } from './components/Piano';
import { AudioEngine } from './utils/AudioEngine';
import { KeyboardSettings } from './components/KeyboardSettings';
import { MusicalScore } from './components/MusicalScore';
import { noteMapping as defaultNoteMapping } from './utils/noteMapping';
import { sampleSongs } from './data/sampleSongs';
import { Volume2, Music, ChromeIcon as Metronome } from 'lucide-react';
import { normalizeNote } from './utils/musicUtils';

interface KeyboardMapping {
  [key: string]: { note: string; octave: number };
}

function App() {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [octave, setOctave] = useState(4);
  const [volume, setVolume] = useState(0.7);
  const [currentSong, setCurrentSong] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [metronomeBPM, setMetronomeBPM] = useState(120);

  const [keyboardMapping, setKeyboardMapping] = useState<KeyboardMapping>(() => {
    // Initialize with default mapping
    const mapping: KeyboardMapping = {};
    Object.entries(defaultNoteMapping).forEach(([key, note]) => {
      const qwertyKeys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i'];
      const asdfKeys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'];
      const zxcvKeys = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ','];

      let baseOctave = 3;
      if (asdfKeys.includes(key)) baseOctave = 4;
      if (zxcvKeys.includes(key)) baseOctave = 5;

      // Handle octave completion notes
      const isOctaveCompletion = ['i', 'k', ','].includes(key);
      const finalOctave = isOctaveCompletion ? baseOctave + 1 : baseOctave;
      mapping[key] = { note, octave: finalOctave };
    });
    return mapping;
  });

  const audioEngineRef = useRef<AudioEngine | null>(null);
  const pressedKeys = useRef<Set<string>>(new Set());
  const activeKeyToNoteMap = useRef<Map<string, string>>(new Map());
  const songTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    audioEngineRef.current = new AudioEngine();
    return () => { audioEngineRef.current?.dispose(); };
  }, []);

  // Metronome effect
  useEffect(() => {
    if (!audioEngineRef.current) return;

    if (isMetronomeOn) {
      audioEngineRef.current.startMetronome(metronomeBPM);
    } else {
      audioEngineRef.current.stopMetronome();
    }

    return () => {
      audioEngineRef.current?.stopMetronome();
    };
  }, [isMetronomeOn, metronomeBPM]);

  const stopNote = useCallback((rawNote: string) => {
    if (!audioEngineRef.current) return;
    const note = normalizeNote(rawNote);

    audioEngineRef.current.stopNote(note);
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  }, []);

  // Automatically skip 'rest' notes in practice mode
  useEffect(() => {
    // We only run this logic in practice mode with a valid song
    if (isPracticeMode && currentSong && sampleSongs[currentSong]) {
      const song = sampleSongs[currentSong];

      // Ensure we're not at the end of the song
      if (currentNoteIndex < song.notes.length) {
        const currentNote = song.notes[currentNoteIndex];

        // If the current note is a rest, schedule a skip
        if (currentNote === 'rest') {
          const beatDuration = song.durations[currentNoteIndex];
          const restDurationMs = beatDuration * (60 / metronomeBPM) * 1000;
          const timer = setTimeout(() => {
            setCurrentNoteIndex(prev => prev + 1);
          }, restDurationMs);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [currentNoteIndex, isPracticeMode, currentSong, metronomeBPM]);

  const playNote = useCallback((rawNote: string, duration?: number) => {
    if (!audioEngineRef.current) return;
    const note = normalizeNote(rawNote);

    // If the duration is provided, it's a song note from autoplay.
    if (duration) {
      if (!isMuted) {
        audioEngineRef.current.playNote(note, volume, duration);
      }
      setActiveNotes(prev => new Set(prev).add(note));
      return; // End here for autoplay notes
    }

    // Check if we are in practice mode and the note is correct
    if (isPracticeMode && currentSong && sampleSongs[currentSong]) {
      const song = sampleSongs[currentSong];
      // Make sure we're not stuck on a rest (though the useEffect should handle this)
      if (song.notes[currentNoteIndex] === 'rest') return;

      const expectedNote = normalizeNote(song.notes[currentNoteIndex]);

      if (note === expectedNote) {
        // Calculate the note's duration based on the song's tempo
        const beatDuration = song.durations[currentNoteIndex];
        const noteDurationMs = beatDuration * (60 / metronomeBPM) * 1000;

        // Play the audio and visuals for the correct duration
        audioEngineRef.current.playNote(note, volume, noteDurationMs);
        setActiveNotes(prev => new Set(prev).add(note));

        const releaseBuffer = 50;
        setTimeout(() => {
          stopNote(note);
        }, noteDurationMs - releaseBuffer);

        // Advance to the next note in the song
        setCurrentNoteIndex(prev => prev + 1);

        if (currentNoteIndex + 1 >= song.notes.length) {
          setIsPracticeMode(false);
        }
        return; // Handled, so we exit
      }
    }

    // Default handling for FREE PLAY or an INCORRECT NOTE in practice mode
    audioEngineRef.current.playNote(note, volume);

    setActiveNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(note)) {
        newSet.delete(note);
        return newSet;
      }
      return prev;
    });

    setTimeout(() => {
      setActiveNotes(prev => new Set(prev).add(note));
    }, 0);

  }, [volume, isMuted, isPracticeMode, currentSong, currentNoteIndex, metronomeBPM, stopNote]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (pressedKeys.current.has(key) || event.repeat) return;

    const mapping = keyboardMapping[key];
    if (mapping) {
      // Prevent browser shortcuts (e.g., Alt+F opening a menu)
      event.preventDefault();
      pressedKeys.current.add(key);

      let noteToPlay: string;

      // Determine the note based on modifiers (Shift > Alt > Natural)
      if (event.shiftKey && !['E', 'B'].includes(mapping.note)) {
        noteToPlay = `${mapping.note}#${mapping.octave}`;
      } else if (event.altKey && !['C', 'F'].includes(mapping.note)) {
        noteToPlay = `${mapping.note}b${mapping.octave}`;
      } else {
        noteToPlay = `${mapping.note}${mapping.octave}`;
      }

      // Play the note and store the mapping
      playNote(noteToPlay);
      activeKeyToNoteMap.current.set(key, noteToPlay);
    }
  }, [octave, playNote, keyboardMapping]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    pressedKeys.current.delete(key);

    // Look up which note was actually played by this key
    const noteToStop = activeKeyToNoteMap.current.get(key);

    if (noteToStop) {
      stopNote(noteToStop);
      // Clean up the mapping
      activeKeyToNoteMap.current.delete(key);
    }
  }, [stopNote]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const playSong = useCallback((song: { notes: string[]; durations: number[] }) => {
    setIsPlaying(true);
    setCurrentNoteIndex(0);

    // Use metronome BPM for song tempo (quarter note = 1 beat)
    const beatDurationMs = (60 / metronomeBPM) * 1000; 

    let noteIndex = 0;

    const playNextNote = () => {
      if (noteIndex >= song.notes.length) {
        setCurrentSong('');
        setIsPlaying(false);
        setCurrentNoteIndex(0);
        return;
      }

      setCurrentNoteIndex(noteIndex);
      const note = song.notes[noteIndex];
      const duration = song.durations[noteIndex] * beatDurationMs;

      // Check if this note is the same as the previous note (for articulation)
      const previousNote = noteIndex > 0 ? song.notes[noteIndex - 1] : null;
      const isRepeatedNote = note === previousNote && note !== 'rest';

      // Only play automatic song notes when not in practice mode
      if (note !== 'rest' && !isMuted && !isPracticeMode) {
        if (isRepeatedNote) {
          // For repeated notes, add a brief gap for articulation
          const articulationGap = Math.min(50, duration * 0.1); // 10% of duration or 50ms, whichever is smaller
          const actualNoteDuration = duration - articulationGap;

          // Stop the previous note first (if it's still playing)
          stopNote(note);

          // Small delay before playing the new note
          setTimeout(() => {
            playNote(note, actualNoteDuration);
            setTimeout(() => stopNote(note), actualNoteDuration);
          }, articulationGap);
        } else {
          // Normal note playing
          playNote(note, duration);
          setTimeout(() => stopNote(note), duration);
        }
      }

      noteIndex++;
      songTimeoutRef.current = window.setTimeout(playNextNote, duration);
    };

    playNextNote();
  }, [playNote, stopNote, isMuted, isPracticeMode, metronomeBPM]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      // Stop current song
      if (songTimeoutRef.current) {
        clearTimeout(songTimeoutRef.current);
      }
      setIsPlaying(false);
      setIsPracticeMode(false);
      setCurrentNoteIndex(0);
    } else if (currentSong) {
      // Resume or restart current song
      setIsPracticeMode(false);
      playSong(sampleSongs[currentSong]);
    }
  };

  const handleToggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    if (newMutedState && currentSong) {
      // Entering practice mode
      setIsPracticeMode(true);
      setIsPlaying(false);
      setCurrentNoteIndex(0);
      if (songTimeoutRef.current) {
        clearTimeout(songTimeoutRef.current);
      }
    } else {
      // Exiting practice mode
      setIsPracticeMode(false);
    }
  };

  const handleSongSelect = (songName: string) => {
    // Stop any currently playing song
    if (songTimeoutRef.current) {
      clearTimeout(songTimeoutRef.current);
    }
    setIsPlaying(false);
    setCurrentNoteIndex(0);
    setIsPracticeMode(false);
    setCurrentSong(songName);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <div className="container mx-auto px-4 py-4 h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">NoteFlow - MIDI Keyboard Player</h1>
          </div>
          <p className="text-purple-200">Play music using your computer keyboard</p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          {/* Left Column - Controls and Songs */}
          <div className="space-y-4">
            {/* Compact Controls */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Volume Control */}
                <div>
                  <label className="block text-xs font-medium text-purple-300 mb-1">
                    <div className="flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      Vol: {Math.round(volume * 100)}%
                    </div>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Metronome Control */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-purple-300 flex items-center gap-1">
                      <Metronome className="w-3 h-3" />
                      {metronomeBPM} BPM
                    </label>
                    <button
                      onClick={() => setIsMetronomeOn(!isMetronomeOn)}
                      className={`
                        px-2 py-0.5 rounded text-xs font-medium transition-all duration-200
                        ${isMetronomeOn
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                        }
                      `}
                    >
                      {isMetronomeOn ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="240"
                    step="5"
                    value={metronomeBPM}
                    onChange={(e) => setMetronomeBPM(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                    disabled={!isMetronomeOn}
                  />
                  {isMetronomeOn && (
                    <div className="text-xs text-green-400 mt-0.5">
                      {isPlaying ? "• Synced to song" : "• Ready"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sample Songs */}
            <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 rounded-xl p-3 flex-1 min-h-0">
              <h3 className="text-sm font-semibold text-white mb-2 text-center">Sample Songs</h3>

              <div className="space-y-1.5 max-h-full overflow-y-auto">
                {Object.keys(sampleSongs).map(songName => (
                  <button
                    key={songName}
                    onClick={() => handleSongSelect(songName)}
                    className={`
                      w-full p-2 rounded-lg font-medium transition-all duration-200 text-sm
                      ${currentSong === songName
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      }
                    `}
                  >
                    <span className="capitalize">{songName.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Keyboard Settings */}
            <div className="mt-auto">
              <KeyboardSettings
                mapping={keyboardMapping}
                onMappingChange={setKeyboardMapping}
              />
            </div>
          </div>

          {/* Middle Column - Musical Score */}
          <div className="lg:col-span-2">
            <MusicalScore
              currentSong={currentSong}
              isPlaying={isPlaying}
              isMuted={isMuted}
              isPracticeMode={isPracticeMode}
              currentNoteIndex={currentNoteIndex}
              onTogglePlay={handleTogglePlay}
              onToggleMute={handleToggleMute}
              onShowHint={() => setShowHint(true)}
              songData={currentSong ? {
                ...sampleSongs[currentSong],
                title: currentSong.replace(/([A-Z])/g, ' $1').trim()
              } : undefined}
              keyboardMapping={keyboardMapping}
              showHint={showHint}
              onCloseHint={() => setShowHint(false)}
            />
          </div>
        </div>

        {/* Bottom - Piano Component */}
        <div className="mt-4">
          <Piano
            activeNotes={activeNotes}
            onNotePlay={playNote}
            onNoteStop={stopNote}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-2 text-purple-300 text-sm">
          <p>Use your keyboard to play notes • Hold Shift for sharps • Hold Alt/Option for flats</p>
        </div>
      </div>
    </div>
  );
}

export default App;