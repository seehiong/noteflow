import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Navigation } from 'lucide-react';
import { KeyboardHint } from './KeyboardHint';

interface MusicalScoreProps {
  currentSong: string;
  isPlaying: boolean;
  isMuted: boolean;
  isPracticeMode: boolean;
  currentNoteIndex: number;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onShowHint: () => void;
  songData?: {
    notes: string[];
    durations: number[];
    title: string;
  };
  keyboardMapping: { [key: string]: { note: string; octave: number } };
  showHint: boolean;
  onCloseHint: () => void;
}

export const MusicalScore: React.FC<MusicalScoreProps> = ({
  isPlaying,
  isMuted,
  isPracticeMode,
  currentNoteIndex,
  onTogglePlay,
  onToggleMute,
  onShowHint,
  songData,
  keyboardMapping,
  showHint,
  onCloseHint,
}) => {
  const [autoScroll, setAutoScroll] = useState(true);
  const notesContainerRef = useRef<HTMLDivElement>(null);
  const currentNoteRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep current note in center
  useEffect(() => {
    if (autoScroll && currentNoteRef.current && notesContainerRef.current) {
      const container = notesContainerRef.current;
      const currentNote = currentNoteRef.current;

      const containerWidth = container.clientWidth;
      const noteOffsetLeft = currentNote.offsetLeft;
      const noteWidth = currentNote.clientWidth;

      // Calculate scroll position to center the current note
      const scrollLeft = noteOffsetLeft - (containerWidth / 2) + (noteWidth / 2);

      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [currentNoteIndex, autoScroll]);

  if (!songData) {
    return (
      <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-xl p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-3">Musical Score</h3>
          <p className="text-purple-300">Select a song to see the musical notation</p>
        </div>
      </div>
    );
  }

  const getNoteDisplay = (note: string) => {
    if (note === 'rest') return '𝄽'; // Rest symbol
    return note.replace(/\d+/, ''); // Remove octave number for display
  };

  const getNoteDuration = (duration: number) => {
    if (duration >= 2) return '𝅝'; // Whole note
    if (duration >= 1) return '𝅗𝅥'; // Half note
    if (duration >= 0.5) return '𝅘𝅥'; // Quarter note
    return '𝅘𝅥𝅮'; // Eighth note
  };

  return (
    <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-xl p-4 h-full flex flex-col">
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold text-white mb-1">Musical Score</h3>
        <h4 className="text-lg text-purple-200 mb-3">{songData.title}</h4>

        {/* Controls */}
        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={onTogglePlay}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm
              ${isPlaying
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
              }
            `}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isPlaying ? 'Stop' : 'Play'}
          </button>

          <button
            onClick={onToggleMute}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm
              ${isMuted
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            {isMuted ? 'Practice Mode' : 'Listen Mode'}
          </button>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm
              ${autoScroll
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
              }
            `}
          >
            <Navigation className="w-4 h-4" />
            Auto-scroll
          </button>
        </div>

        {isMuted && (
          <div className="bg-orange-900/30 rounded-lg p-2 mb-3">
            <p className="text-orange-200 text-xs">
              {isPracticeMode
                ? `🎯 Practice Mode: Play the highlighted note "${getNoteDisplay(songData.notes[currentNoteIndex])}" to continue!`
                : '🎯 Practice Mode: Select a song and toggle to practice mode to begin interactive learning!'
              }
            </p>
          </div>
        )}

        {isPracticeMode && currentNoteIndex >= songData.notes.length && (
          <div className="bg-green-900/30 rounded-lg p-3 mb-3">
            <p className="text-green-200 font-semibold text-center">
              🎉 Congratulations! You completed "{songData.title}"!
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 mx-auto block px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Musical Staff */}
      <div
        ref={notesContainerRef}
        className="bg-white/10 rounded-lg p-4 overflow-x-auto flex-1 scroll-smooth"
      >
        <div className="min-w-max relative">
          {/* Staff Lines */}
          <div className="relative mb-4">
            <svg width="100%" height="100" className="absolute top-0">
              {/* Staff lines */}
              {[0, 1, 2, 3, 4].map(line => (
                <line
                  key={line}
                  x1="0"
                  y1={15 + line * 15}
                  x2="100%"
                  y2={15 + line * 15}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
              {/* Treble clef */}
              <text x="10" y="55" fontSize="36" fill="#e5e7eb">𝄞</text>
              {/* Time signature */}
              <text x="60" y="45" fontSize="20" fill="#e5e7eb" fontWeight="bold">4</text>
              <text x="60" y="65" fontSize="20" fill="#e5e7eb" fontWeight="bold">4</text>
            </svg>

            {/* Notes */}
            <div className="flex gap-3 ml-20 pt-1 relative">
              {songData.notes.map((note, index) => {
                const isCurrentNote = index === currentNoteIndex;
                const isPastNote = index < currentNoteIndex;
                const isRest = note === 'rest';
                const isWaitingNote = isPracticeMode && isCurrentNote;

                return (
                  <div
                    ref={isCurrentNote ? currentNoteRef : null}
                    key={index}
                    className={`
                      relative flex flex-col items-center transition-all duration-300
                      ${isCurrentNote ? 'scale-125 z-10' : 'scale-100'}
                      ${isWaitingNote ? 'animate-bounce' : ''}
                    `}
                  >
                    {/* Note symbol */}
                    <div
                      onClick={isWaitingNote ? onShowHint : undefined}
                      className={`
                        text-3xl font-bold transition-all duration-300 mb-1 ${isWaitingNote ? 'cursor-pointer hover:scale-110' : ''}
                        ${isCurrentNote
                          ? isPracticeMode
                            ? 'text-red-400 animate-pulse shadow-lg'
                            : 'text-yellow-400 animate-pulse'
                          : isPastNote
                            ? 'text-green-400'
                            : 'text-white'
                        }
                      `}
                      style={{
                        marginTop: isRest ? '30px' : getVerticalPosition(note)
                      }}
                    >
                      {getNoteDuration(songData.durations[index])}
                    </div>

                    {/* Note name */}
                    <div
                      className={`
                        text-sm font-medium px-2 py-1 rounded transition-all duration-300
                        ${isCurrentNote
                          ? isPracticeMode
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-yellow-500 text-black'
                          : isPastNote
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-700 text-white'
                        }
                      `}
                    >
                      {getNoteDisplay(note)}
                    </div>

                    {/* Beat indicator */}
                    <div className="text-xs text-purple-300">
                      {songData.durations[index]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Hint Modal */}
      {showHint && isPracticeMode && songData && (
        <KeyboardHint
          targetNote={songData.notes[currentNoteIndex]}
          keyboardMapping={keyboardMapping}
          onClose={onCloseHint}
        />
      )}

      {/* Progress indicator */}
      <div className="mt-2">
        <div className="flex justify-between text-sm text-purple-300 mb-2">
          <span>{isPracticeMode ? 'Practice Progress' : 'Playback Progress'}</span>
          <div className="flex items-center gap-3">
            <span>{currentNoteIndex} / {songData.notes.length}</span>
            {autoScroll && (
              <span className="text-xs bg-purple-600 px-2 py-1 rounded">Auto-scroll ON</span>
            )}
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${isPracticeMode
                ? 'bg-gradient-to-r from-red-500 to-orange-500'
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}
            style={{ width: `${(currentNoteIndex / songData.notes.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Helper function to position notes vertically on the staff
const getVerticalPosition = (note: string): string => {
  const notePositions: { [key: string]: number } = {
    'C': 60,  // Below staff
    'D': 52,  // Bottom line
    'E': 45,  // Between bottom lines
    'F': 37,  // Second line
    'G': 30,  // Between middle lines
    'A': 22,  // Third line
    'B': 15,  // Between top lines
  };

  const noteName = note.replace(/[#b]\d+|\d+/g, '');
  const position = notePositions[noteName] || 30;

  return `${position}px`;
};