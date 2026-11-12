//src/components/MusicalScore.tsx

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Navigation } from 'lucide-react';
import { KeyboardHint } from './KeyboardHint';
import { CompiledTrack } from './NoteEditor';

interface MusicalScoreProps {
  currentSong: string;
  isPlaying: boolean;
  isMuted: boolean;
  isPracticeMode: boolean;
  currentNoteIndex: number;
  trackNoteIndices?: Record<string, number>;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onShowHint: () => void;
  songData?: {
    notes: string[];
    durations: number[];
    tracks?: CompiledTrack[];
    title: string;
  };
  keyboardMapping: { [key: string]: { note: string; octave: number } };
  showHint: boolean;
  onCloseHint: () => void;
}

const TRACK_COLORS = [
  { accent: '#a78bfa', bg: 'rgba(167,139,250,0.08)', label: 'text-violet-400', border: 'border-violet-500/30' },
  { accent: '#34d399', bg: 'rgba(52,211,153,0.08)', label: 'text-emerald-400', border: 'border-emerald-500/30' },
  { accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'text-amber-400', border: 'border-amber-500/30' },
  { accent: '#38bdf8', bg: 'rgba(56,189,248,0.08)', label: 'text-sky-400', border: 'border-sky-500/30' },
  { accent: '#f87171', bg: 'rgba(248,113,113,0.08)', label: 'text-red-400', border: 'border-red-500/30' },
  { accent: '#e879f9', bg: 'rgba(232,121,249,0.08)', label: 'text-fuchsia-400', border: 'border-fuchsia-500/30' },
  { accent: '#fb923c', bg: 'rgba(251,146,60,0.08)', label: 'text-orange-400', border: 'border-orange-500/30' },
  { accent: '#4ade80', bg: 'rgba(74,222,128,0.08)', label: 'text-green-400', border: 'border-green-500/30' },
];

const SYNTH_LABEL: Record<string, string> = {
  piano: 'Piano', organ: 'Organ', flute: 'Flute', cello: 'Cello',
  sine: 'Sine', triangle: 'Triangle', square: 'Square', sawtooth: 'Sawtooth', drum: 'Drum',
};

// SVG note head renderer — avoids all Unicode musical glyph encoding issues
const NoteHead: React.FC<{
  duration: number;
  isRest: boolean;
  color: string;
  size?: number;
}> = ({ duration, isRest, color, size = 14 }) => {
  const filled = duration < 1;       // quarter note and shorter = filled head
  const hasFlag = duration <= 0.25;  // eighth note and shorter gets a flag indicator

  if (isRest) {
    // Rest: small horizontal bar
    return (
      <svg width={size} height={size * 2} viewBox="0 0 14 28">
        <rect x="2" y={duration >= 1 ? 6 : 14} width="10" height={duration >= 1 ? 4 : 3} fill={color} rx="1" />
        {duration < 1 && <rect x="4" y="8" width="6" height="2" fill={color} rx="0.5" />}
      </svg>
    );
  }

  return (
    <svg width={size} height={size * 2.5} viewBox="0 0 14 35">
      {/* Note head: ellipse */}
      <ellipse cx="7" cy="25" rx="6" ry="4.5"
        fill={filled ? color : 'none'}
        stroke={color} strokeWidth="1.5" />
      {/* Stem (always up for simplicity) */}
      {duration < 2 && <line x1="12.5" y1="25" x2="12.5" y2="4" stroke={color} strokeWidth="1.5" />}
      {/* Flag for eighth notes */}
      {hasFlag && duration >= 0.125 && (
        <path d="M12.5 4 Q20 10 14 18" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      )}
      {/* Double flag for sixteenth */}
      {duration < 0.125 && (
        <>
          <path d="M12.5 4 Q20 10 14 18" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12.5 8 Q20 14 14 22" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {/* Accidental dots for dotted notes are skipped for simplicity */}
    </svg>
  );
};

export const MusicalScore: React.FC<MusicalScoreProps> = ({
  isPlaying,
  isMuted,
  isPracticeMode,
  currentNoteIndex,
  trackNoteIndices = {},
  onTogglePlay,
  onToggleMute,
  onShowHint,
  songData,
  showHint,
  onCloseHint,
}) => {
  const [autoScroll, setAutoScroll] = useState(true);
  const laneScrollRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const currentNoteRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Resolve the current index for any given track
  const getTrackCurrentIndex = (trackId: string): number => {
    if (trackId === 'T1') return currentNoteIndex;
    return trackNoteIndices[trackId] ?? -1;
  };

  // Auto-scroll each lane independently to keep its current note centred
  useEffect(() => {
    if (!autoScroll) return;
    laneScrollRefs.current.forEach((container, trackId) => {
      const currentNote = currentNoteRefs.current.get(trackId);
      if (!container || !currentNote) return;
      const containerWidth = container.clientWidth;
      const noteOffsetLeft = currentNote.offsetLeft;
      const noteWidth = currentNote.clientWidth;
      container.scrollTo({
        left: noteOffsetLeft - containerWidth / 2 + noteWidth / 2,
        behavior: 'smooth',
      });
    });
  }, [currentNoteIndex, trackNoteIndices, autoScroll]);

  if (!songData) {
    return (
      <div style={{ background: 'linear-gradient(135deg, rgba(49,46,129,0.4), rgba(88,28,135,0.3))', borderRadius: '12px', padding: '24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#c4b5fd', fontSize: '13px' }}>Select a song to see the staff preview</p>
        </div>
      </div>
    );
  }

  // Use full compiled tracks if available; else wrap flat notes/durations as single T1
  const tracks: CompiledTrack[] =
    songData.tracks && songData.tracks.length > 0
      ? songData.tracks
      : [{
        id: 'T1',
        synthType: 'piano',
        enabled: true,
        notes: songData.notes.map((note, i) => ({
          note,
          duration: songData.durations[i],
          beatOffset: songData.durations.slice(0, i).reduce((a, b) => a + b, 0),
          noteIndex: i,
        })),
      }];

  // ── Helpers ──────────────────────────────────────────────────────────────

  const parseNote = (note: string) => {
    if (note === 'rest') return { base: 'Rest', accidental: '', octave: '' };
    if (/^(BD|SD|HH|KICK|SNARE|HIHAT)$/i.test(note)) return { base: note, accidental: '', octave: '' };
    const m = note.match(/^([A-G])([#b]?)(\d+)$/);
    if (m) return { base: m[1], accidental: m[2], octave: m[3] };
    return { base: note.replace(/\d+/, ''), accidental: '', octave: '' };
  };

  const getStaffTop = (note: string): number => {
    if (note === 'rest' || /^(BD|SD|HH|KICK|SNARE|HIHAT)$/i.test(note)) return 40;
    const { base, accidental, octave } = parseNote(note);
    const noteSteps: Record<string, number> = {
      'C': 0, 'C#': 0, 'Db': 0, 'D': -1, 'D#': -1, 'Eb': -1, 'E': -2,
      'F': -3, 'F#': -3, 'Gb': -3, 'G': -4, 'G#': -4, 'Ab': -4,
      'A': -5, 'A#': -5, 'Bb': -5, 'B': -6,
    };
    const octaveNum = parseInt(octave);
    const octaveOffset = (4 - octaveNum) * 7;
    const noteOffset = noteSteps[base + (accidental || '')] ?? 0;
    // Middle C (C4) sits at y=70; each step is 6px (half of lineSpacing=12)
    return 70 + (octaveOffset + noteOffset) * 6;
  };

  // ── Track Lane ────────────────────────────────────────────────────────────

  const renderTrackLane = (track: CompiledTrack, idx: number) => {
    const color = TRACK_COLORS[idx % TRACK_COLORS.length];
    const label = SYNTH_LABEL[track.synthType] ?? track.synthType;
    const isDrum = track.synthType === 'drum';
    const trackCurrentIdx = getTrackCurrentIndex(track.id);

    // ── Compute vertical layout from the track's actual pitch range ──────────
    const TOP_PAD = 16;    // px clearance above the highest note
    const BOTTOM_PAD = 34; // px reserved for note-name + duration labels

    let verticalOffset = 0;
    let laneHeight = 72; // drum default

    if (!isDrum) {
      const staffTops = track.notes
        .filter(n => n.note !== 'rest' && !/^(BD|SD|HH|KICK|SNARE|HIHAT)$/i.test(n.note))
        .map(n => getStaffTop(n.note));

      if (staffTops.length > 0) {
        const minTop = Math.min(...staffTops); // highest-pitched note (smallest y)
        const maxTop = Math.max(...staffTops); // lowest-pitched note (largest y)
        // Push every note down by verticalOffset so the highest sits at TOP_PAD
        verticalOffset = minTop < TOP_PAD ? TOP_PAD - minTop : 0;
        // Lane tall enough to fit full pitch range + note head + labels
        laneHeight = Math.max(160, verticalOffset + maxTop + 24 + BOTTOM_PAD);
      } else {
        laneHeight = 160; // rests-only track
      }
    }

    // Staff lines shifted by verticalOffset so they move with the notes
    const staffLineYs = [20, 32, 44, 56, 68].map(y => y + verticalOffset);

    return (
      <div
        key={track.id}
        className={`rounded-lg border ${color.border} mb-2 last:mb-0 overflow-hidden`}
        style={{ background: color.bg }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-1 border-b border-white/5">
          <span
            className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${color.label}`}
            style={{ background: color.accent + '20', border: `1px solid ${color.accent}50` }}
          >
            {track.id}
          </span>
          <span className="text-[9px] text-slate-400 font-mono">{label}</span>
          <span className="ml-auto text-[9px] text-slate-600 font-mono tabular-nums">{track.notes.length} notes</span>
        </div>

        {/* Scrollable area — hide scrollbar chrome but keep scroll functional */}
        <div
          ref={el => { if (el) laneScrollRefs.current.set(track.id, el); }}
          className="overflow-x-auto scroll-smooth"
          style={{
            height: `${laneHeight}px`,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          } as React.CSSProperties}
        >
          <div className="min-w-max relative" style={{ height: `${laneHeight}px` }}>

            {/* Staff lines — shifted by verticalOffset so they sit with the notes */}
            {!isDrum && (
              <svg
                width="100%"
                height={laneHeight}
                className="absolute top-0 left-0"
                style={{ zIndex: 1 }}
              >
                {staffLineYs.map((y, si) => (
                  <line key={si} x1="0" y1={y} x2="100%" y2={y} stroke={color.accent + '40'} strokeWidth="1" />
                ))}
                {/* Treble clef — Unicode G-clef; y/size anchored to bottom staff line */}
                <text
                  x="2"
                  y={staffLineYs[4] + 8}
                  fontSize={Math.round((staffLineYs[4] - staffLineYs[0]) * 1.85)}
                  fill={color.accent + '90'}
                  fontFamily="'Palatino Linotype', 'Book Antiqua', Palatino, 'Times New Roman', Georgia, serif"
                  style={{ userSelect: 'none' }}
                >
                  {String.fromCodePoint(0x1D11E)}
                </text>
              </svg>
            )}

            {/* Notes */}
            <div
              className={`flex relative ${isDrum ? 'items-center h-full gap-2 ml-4' : 'gap-2 ml-16'}`}
              style={{ zIndex: 2 }}
            >
              {track.notes.map((noteEvent, ni) => {
                const { note, duration } = noteEvent;
                const isCurrentNote = ni === trackCurrentIdx;
                const isPastNote = ni < trackCurrentIdx && trackCurrentIdx >= 0;
                const isRest = note === 'rest';
                const isDrumNote = /^(BD|SD|HH|KICK|SNARE|HIHAT)$/i.test(note);
                const isWaiting = isPracticeMode && isCurrentNote;
                const { base, accidental, octave } = parseNote(note);
                const accSym = accidental === '#' ? '#' : accidental === 'b' ? 'b' : '';

                // Apply verticalOffset so all notes stay within the lane
                const rawTop = getStaffTop(note);
                const adjustedTop = rawTop + verticalOffset;

                // Ledger lines relative to the adjusted staff positions
                const topStaff = staffLineYs[staffLineYs.length - 1]; // highest line
                const bottomStaff = staffLineYs[0];                   // lowest line
                const spacing = 12;
                const ledgers: number[] = [];
                if (!isRest && !isDrumNote) {
                  if (adjustedTop > bottomStaff) {
                    ledgers.push(bottomStaff + spacing);
                    if (adjustedTop > bottomStaff + spacing) ledgers.push(bottomStaff + spacing * 2);
                    if (adjustedTop > bottomStaff + spacing * 2) ledgers.push(bottomStaff + spacing * 3);
                  } else if (adjustedTop < topStaff) {
                    ledgers.push(topStaff - spacing);
                    if (adjustedTop < topStaff - spacing) ledgers.push(topStaff - spacing * 2);
                  }
                }

                const noteColor = isCurrentNote
                  ? (isPracticeMode ? '#ef4444' : color.accent)
                  : isPastNote ? color.accent + '50' : 'rgba(255,255,255,0.85)';

                // ── Drum pill ─────────────────────────────────────────────
                if (isDrum) {
                  return (
                    <div
                      key={ni}
                      ref={isCurrentNote ? el => { if (el) currentNoteRefs.current.set(track.id, el); } : null}
                      className={`flex flex-col items-center gap-0.5 shrink-0 transition-all duration-200 ${isCurrentNote ? 'scale-125' : ''}`}
                      style={{ minWidth: '40px' }}
                    >
                      <span
                        className={`text-[9px] font-bold px-1.5 py-1 rounded font-mono ${isCurrentNote ? 'text-slate-900' : isPastNote ? 'opacity-40' : color.label}`}
                        style={isCurrentNote
                          ? { background: color.accent, boxShadow: `0 0 10px ${color.accent}` }
                          : { border: `1px solid ${color.accent}35` }}
                      >
                        {note}
                      </span>
                      <span className="text-[8px] text-slate-600 font-mono">{duration}</span>
                    </div>
                  );
                }

                // ── Melody note ───────────────────────────────────────────
                return (
                  <div
                    key={ni}
                    ref={isCurrentNote ? el => { if (el) currentNoteRefs.current.set(track.id, el); } : null}
                    className={`relative shrink-0 transition-all duration-300
                      ${isCurrentNote ? 'scale-125 z-10' : ''}
                      ${isWaiting ? 'animate-bounce' : ''}`}
                    style={{ minWidth: '44px', height: `${laneHeight}px` }}
                    onClick={isWaiting ? onShowHint : undefined}
                  >
                    {/* Ledger lines using adjusted positions */}
                    {ledgers.map((lineY, li) => (
                      <div
                        key={li}
                        style={{
                          position: 'absolute',
                          left: '10px', width: '24px', height: '1px',
                          top: `${lineY}px`,
                          background: color.accent + '70',
                        }}
                      />
                    ))}

                    {/* SVG note head — placed at adjustedTop */}
                    <div
                      style={{
                        position: 'absolute',
                        top: `${adjustedTop - 20}px`,
                        left: '8px',
                        filter: isCurrentNote && !isPracticeMode
                          ? `drop-shadow(0 0 6px ${color.accent})`
                          : undefined,
                        opacity: isPastNote ? 0.4 : 1,
                        cursor: isWaiting ? 'pointer' : 'default',
                      }}
                    >
                      {accSym && (
                        <span style={{ fontSize: '9px', color: noteColor, position: 'absolute', left: '-7px', top: '14px', fontWeight: 'bold' }}>
                          {accSym}
                        </span>
                      )}
                      <NoteHead duration={duration} isRest={isRest} color={noteColor} size={13} />
                    </div>

                    {/* Note name badge — fixed to bottom of lane */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '9px',
                        fontFamily: 'monospace',
                        whiteSpace: 'nowrap',
                        padding: '1px 4px',
                        borderRadius: '3px',
                        background: isCurrentNote
                          ? (isPracticeMode ? '#ef4444' : color.accent)
                          : isPastNote ? color.accent + '25' : '#1e293b',
                        color: isCurrentNote ? (isPracticeMode ? 'white' : '#0f172a') : isPastNote ? color.accent : '#64748b',
                        boxShadow: isCurrentNote ? `0 0 8px ${color.accent}80` : 'none',
                      }}
                    >
                      {isRest ? 'rest' : `${base}${accSym}${octave}`}
                    </div>

                    {/* Duration label */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '1px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '8px',
                        fontFamily: 'monospace',
                        color: color.accent + '70',
                      }}
                    >
                      {duration}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Main ──────────────────────────────────────────────────────────────────

  const t1 = tracks.find(t => t.id === 'T1') ?? tracks[0];
  const t1Length = t1?.notes.length ?? 0;

  return (
    <div
      className="rounded-xl p-3 h-full flex flex-col gap-2.5 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,27,75,0.7))' }}
    >
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs shadow transition-all
            ${isPlaying ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isPlaying ? 'Stop' : 'Play'}
        </button>

        <button
          onClick={onToggleMute}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs shadow transition-all
            ${isMuted ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          {isMuted ? 'Practice' : 'Listen'}
        </button>

        <button
          onClick={() => setAutoScroll(a => !a)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium text-xs shadow transition-all
            ${autoScroll ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
        >
          <Navigation className="w-3 h-3" />
          Scroll
        </button>

        <span className="ml-auto text-[10px] font-mono text-slate-500 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
          {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
        </span>
      </div>

      {/* Practice banner */}
      {isMuted && (
        <div className="shrink-0 rounded-lg px-3 py-1.5 border border-orange-700/30" style={{ background: 'rgba(120,53,15,0.25)' }}>
          <p className="text-orange-200 text-[10px]">
            {isPracticeMode
              ? `Practice: Play "${t1?.notes[currentNoteIndex]?.note ?? '...'}" to continue!`
              : 'Practice Mode: Select a song and enable practice mode!'}
          </p>
        </div>
      )}

      {isPracticeMode && currentNoteIndex >= t1Length && t1Length > 0 && (
        <div className="shrink-0 rounded-lg p-2 border border-green-700/30 text-center" style={{ background: 'rgba(20,83,45,0.25)' }}>
          <p className="text-green-300 font-semibold text-[11px]">Congratulations! Song complete!</p>
        </div>
      )}

      {/* All track lanes */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {tracks.map((track, i) => renderTrackLane(track, i))}
      </div>

      {/* Progress bar */}
      <div className="shrink-0">
        <div className="flex justify-between text-[9px] text-slate-600 font-mono mb-1">
          <span>{isPracticeMode ? 'Practice (T1)' : 'Playback (T1)'}</span>
          <span>{Math.min(currentNoteIndex, t1Length)} / {t1Length}</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1">
          <div
            className={`h-1 rounded-full transition-all duration-300 ${isPracticeMode
              ? 'bg-gradient-to-r from-red-500 to-orange-500'
              : 'bg-gradient-to-r from-violet-500 to-indigo-400'}`}
            style={{ width: `${t1Length > 0 ? (Math.min(currentNoteIndex, t1Length) / t1Length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Keyboard hint modal */}
      {showHint && isPracticeMode && t1?.notes[currentNoteIndex] && (
        <KeyboardHint
          targetNote={t1.notes[currentNoteIndex].note}
          onClose={onCloseHint}
        />
      )}
    </div>
  );
};