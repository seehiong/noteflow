//src/components/NoteEditor.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Circle, Clipboard, Trash2, HelpCircle, Download, Upload } from 'lucide-react';

export interface SyntaxError {
  line: number;
  token: string;
  message: string;
}

export interface CompiledTrackNote {
  note: string;
  duration: number;
  beatOffset: number;
  noteIndex: number;
}

export interface CompiledTrack {
  id: string;
  synthType: string;
  enabled: boolean;
  notes: CompiledTrackNote[];
}

export interface CompiledSong {
  notes: string[];
  durations: number[];
  tracks: CompiledTrack[];
  error: SyntaxError | null;
}

// Notation compiler function
export const compileNotation = (text: string, activeSynthType: string = 'piano'): CompiledSong => {
  const validInstruments = ['piano', 'organ', 'flute', 'cello', 'violin'];
  const validSynths = ['sine', 'triangle', 'square', 'sawtooth', 'drum'];

  const lines = text.split('\n');
  const tracksMap = new Map<string, CompiledTrack>();
  let hasTrackMarkers = false;

  // Pre-scan for track markers (e.g. "T1", "T2")
  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed && trimmed.match(/^T\d+/)) {
      hasTrackMarkers = true;
      break;
    }
  }

  if (!hasTrackMarkers) {
    // Single track compilation
    const notes: string[] = [];
    const durations: number[] = [];

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex].trim();
      if (!line || line.startsWith('//') || line.startsWith('#')) continue;

      const tokens = line.split(/\s+/);
      for (const token of tokens) {
        if (!token) continue;

        if (!token.includes('/')) {
          return {
            notes: [],
            durations: [],
            tracks: [],
            error: {
              line: lineIndex + 1,
              token,
              message: `Missing duration separator '/' in token '${token}'`
            }
          };
        }

        const parts = token.split('/');
        if (parts.length !== 2) {
          return {
            notes: [],
            durations: [],
            tracks: [],
            error: {
              line: lineIndex + 1,
              token,
              message: `Invalid token structure '${token}'`
            }
          };
        }

        const pitch = parts[0].trim();
        const durationStr = parts[1].trim();
        const duration = parseFloat(durationStr);

        const isRest = pitch.toLowerCase() === 'rest';
        const matchPitch = pitch.match(/^([A-G][#b]?\d+|kick|bd|snare|sd|hihat|hh)$/i);

        if (!isRest && !matchPitch) {
          return {
            notes: [],
            durations: [],
            tracks: [],
            error: {
              line: lineIndex + 1,
              token,
              message: `Invalid pitch format '${pitch}'. Should be C4, D#5, Bb3, drum hits (kick, snare, hihat), or 'rest'`
            }
          };
        }

        if (isNaN(duration) || duration <= 0) {
          return {
            notes: [],
            durations: [],
            tracks: [],
            error: {
              line: lineIndex + 1,
              token,
              message: `Invalid duration value '${durationStr}'. Must be positive.`
            }
          };
        }

        let finalPitch = pitch;
        if (!isRest && matchPitch) {
          if (pitch.match(/^[A-G][#b]?\d+$/i)) {
            const baseMatch = pitch.match(/^([A-G])([#b]?)(\d+)$/i);
            if (baseMatch) {
              const [, base, accidental, octave] = baseMatch;
              finalPitch = `${base.toUpperCase()}${accidental}${octave}`;
            }
          } else {
            finalPitch = pitch.toUpperCase();
          }
        } else if (isRest) {
          finalPitch = 'rest';
        }

        notes.push(finalPitch);
        durations.push(duration);
      }
    }

    const compiledNotes = notes.map((note, index) => {
      const beatOffset = durations.slice(0, index).reduce((a, b) => a + b, 0);
      return { note, duration: durations[index], beatOffset, noteIndex: index };
    });

    const defaultTrack: CompiledTrack = {
      id: 'T1',
      synthType: activeSynthType,
      enabled: true,
      notes: compiledNotes
    };

    return {
      notes,
      durations,
      tracks: [defaultTrack],
      error: null
    };
  }

  // Multi-track compilation
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex].trim();
    if (!line || line.startsWith('//') || line.startsWith('#')) continue;

    const trackMatch = line.match(/^(T\d+)\s+/);
    if (!trackMatch) {
      return {
        notes: [],
        durations: [],
        tracks: [],
        error: {
          line: lineIndex + 1,
          token: line.substring(0, 10),
          message: `Multi-track file lines must start with track ID (e.g. 'T1 ', 'T2 ')`
        }
      };
    }

    const trackId = trackMatch[1];
    let remainingLine = line.substring(trackId.length).trim();

    let synthType = 'piano';
    let enabled = true;

    // Parse key-value parameters like synth=sawtooth or track=off at the beginning of the line
    while (true) {
      const paramMatch = remainingLine.match(/^(\w+)=(\w+)\s+/);
      if (!paramMatch) break;

      const key = paramMatch[1];
      const val = paramMatch[2];

      if (key === 'synth') {
        if (!validSynths.includes(val)) {
          return {
            notes: [],
            durations: [],
            tracks: [],
            error: {
              line: lineIndex + 1,
              token: `${key}=${val}`,
              message: validInstruments.includes(val)
                ? `'${val}' is an acoustic instrument. Use 'instrument=${val}' instead of 'synth=${val}'.`
                : `'${val}' is not a recognized synth waveform (sine, triangle, square, sawtooth, drum).`
            }
          };
        }
        synthType = val;
      } else if (key === 'instrument') {
        if (!validInstruments.includes(val)) {
          return {
            notes: [],
            durations: [],
            tracks: [],
            error: {
              line: lineIndex + 1,
              token: `${key}=${val}`,
              message: validSynths.includes(val)
                ? `'${val}' is a synth waveform. Use 'synth=${val}' instead of 'instrument=${val}'.`
                : `'${val}' is not a recognized instrument (piano, organ, flute, cello, violin).`
            }
          };
        }
        synthType = val;
      } else if (key === 'track') {
        enabled = val !== 'off';
      }

      remainingLine = remainingLine.substring(paramMatch[0].length).trim();
    }

    let track = tracksMap.get(trackId);
    if (!track) {
      track = { id: trackId, synthType, enabled, notes: [] };
      tracksMap.set(trackId, track);
    } else {
      const hasSynth = line.includes('synth=') || line.includes('instrument=');
      if (hasSynth) {
        track.synthType = synthType;
      }
      const hasTrackConfig = line.includes('track=');
      if (hasTrackConfig) {
        track.enabled = enabled;
      }
    }

    const tokens = remainingLine.split(/\s+/);
    for (const token of tokens) {
      if (!token) continue;

      if (!token.includes('/')) {
        return {
          notes: [],
          durations: [],
          tracks: [],
          error: {
            line: lineIndex + 1,
            token,
            message: `Missing duration separator '/' in token '${token}'`
          }
        };
      }

      const parts = token.split('/');
      if (parts.length !== 2) {
        return {
          notes: [],
          durations: [],
          tracks: [],
          error: {
            line: lineIndex + 1,
            token,
            message: `Invalid token structure '${token}'`
          }
        };
      }

      const pitch = parts[0].trim();
      const durationStr = parts[1].trim();
      const duration = parseFloat(durationStr);

      const isRest = pitch.toLowerCase() === 'rest';
      const matchPitch = pitch.match(/^([A-G][#b]?\d+|kick|bd|snare|sd|hihat|hh)$/i);

      if (!isRest && !matchPitch) {
        return {
          notes: [],
          durations: [],
          tracks: [],
          error: {
            line: lineIndex + 1,
            token,
            message: `Invalid pitch format '${pitch}'. Should be pitch (e.g. C4), drums (e.g. kick, snare, hihat), or 'rest'`
          }
        };
      }

      if (isNaN(duration) || duration <= 0) {
        return {
          notes: [],
          durations: [],
          tracks: [],
          error: {
            line: lineIndex + 1,
            token,
            message: `Invalid duration value '${durationStr}'`
          }
        };
      }

      let finalPitch = pitch;
      if (!isRest && matchPitch) {
        if (pitch.match(/^[A-G][#b]?\d+$/i)) {
          const baseMatch = pitch.match(/^([A-G])([#b]?)(\d+)$/i);
          if (baseMatch) {
            const [, base, accidental, octave] = baseMatch;
            finalPitch = `${base.toUpperCase()}${accidental}${octave}`;
          }
        } else {
          finalPitch = pitch.toUpperCase();
        }
      } else if (isRest) {
        finalPitch = 'rest';
      }

      const beatOffset = track.notes.reduce((acc, note) => acc + note.duration, 0);
      const noteIndex = track.notes.length;

      track.notes.push({
        note: finalPitch,
        duration,
        beatOffset,
        noteIndex
      });
    }
  }

  const tracksList = Array.from(tracksMap.values());
  const track1 = tracksMap.get('T1') || tracksList[0];
  const notes = (track1 && track1.enabled) ? track1.notes.map(n => n.note) : [];
  const durations = (track1 && track1.enabled) ? track1.notes.map(n => n.duration) : [];

  return {
    notes,
    durations,
    tracks: tracksList,
    error: null
  };
};

interface NoteEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  isPlaying: boolean;
  isRecording: boolean;
  onTogglePlay: () => void;
  onToggleRecord: () => void;
  onClear: () => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  isMetronomeOn: boolean;
  onToggleMetronome: () => void;
  currentSongName?: string;
  aiCollapsed?: boolean;
  onToggleAi?: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  code,
  onCodeChange,
  isPlaying,
  isRecording,
  onTogglePlay,
  onToggleRecord,
  onClear,
  bpm,
  onBpmChange,
  isMetronomeOn,
  onToggleMetronome,
  currentSongName,
  aiCollapsed,
  onToggleAi,
}) => {
  const [compiled, setCompiled] = useState<CompiledSong>({ notes: [], durations: [], tracks: [], error: null });
  const [showDocs, setShowDocs] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const downloadWorkspace = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const filename = currentSongName
      ? `${currentSongName.toLowerCase().replace(/\s+/g, '_')}.noteflow`
      : 'workspace.noteflow';

    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const uploadWorkspace = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.noteflow,.txt';
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        onCodeChange(text);
      };
      reader.readAsText(file);
    };
    fileInput.click();
  };

  // Compile on code edit
  useEffect(() => {
    const result = compileNotation(code);
    setCompiled(result);
  }, [code]);

  // Sync scrolling of line numbers with text area
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Editor Header */}
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          <span className="text-xs font-semibold text-slate-300 font-mono">workspace.noteflow</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDocs(!showDocs)}
            className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Syntax Docs
          </button>

          {onToggleAi && (
            <button
              onClick={onToggleAi}
              className={`flex items-center gap-1 text-[11px] transition-colors ${
                aiCollapsed ? 'text-purple-400 hover:text-purple-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title={aiCollapsed ? "Show AI Assistant sidebar" : "Hide AI Assistant sidebar"}
            >
              <span>🤖</span>
              {aiCollapsed ? 'Open AI Assist' : 'Hide AI Assist'}
            </button>
          )}
        </div>
      </div>

      {/* Docs Drawer */}
      {showDocs && (
        <div className="bg-slate-950/80 backdrop-blur border-b border-slate-800/80 p-3 text-[11px] leading-relaxed text-slate-300 font-mono space-y-2 overflow-y-auto max-h-60">
          <div className="font-semibold text-purple-400">NoteFlow Notation Syntax (NFN)</div>
          <p>Format each note as: <code className="bg-slate-800 text-white px-1 py-0.5 rounded">PitchOctave/Duration</code> (e.g., <code className="bg-slate-800 text-white px-1">C4/1.0</code>, <code className="bg-slate-800 text-white px-1">F#4/0.5</code>, <code className="bg-slate-800 text-white px-1">rest/2.0</code>)</p>

          <div className="font-semibold text-purple-400 pt-1">🎼 Multi-Track Orchestration</div>
          <p>Prefix lines with a track ID (<code className="bg-slate-800 text-white px-1">T1</code>, <code className="bg-slate-800 text-white px-1">T2</code>, etc.) and optional parameters:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li><code className="bg-slate-800 text-white px-1">T1 synth=piano C4/1 D4/1</code> (Track 1 melody)</li>
            <li><code className="bg-slate-800 text-white px-1">T2 synth=organ C3/2 G3/2</code> (Track 2 bassline)</li>
            <li><code className="bg-slate-800 text-white px-1">T3 synth=drum BD/1 HH/0.5</code> (Track 3 drums)</li>
            <li><strong>Track Toggle:</strong> Add <code className="bg-slate-800 text-white px-1">track=off</code> to mute a track (default is <code className="bg-slate-800 text-white px-1">track=on</code>).</li>
            <li><code className="bg-slate-800 text-white px-1">T1 synth=sawtooth track=off C4/1</code> → silenced, hidden from staff.</li>
            <li><strong>Valid Instruments:</strong> <code className="bg-slate-800 text-white px-1">piano</code>, <code className="bg-slate-800 text-white px-1">organ</code>, <code className="bg-slate-800 text-white px-1">sine</code>, <code className="bg-slate-800 text-white px-1">triangle</code>, <code className="bg-slate-800 text-white px-1">square</code>, <code className="bg-slate-800 text-white px-1">sawtooth</code>, <code className="bg-slate-800 text-white px-1">drum</code>.</li>
          </ul>

          <div className="font-semibold text-purple-400 pt-1">🥁 Drum Track Pitch Map (synth=drum)</div>
          <ul className="list-disc pl-4 space-y-0.5">
            <li><strong>Bass Drum / Kick:</strong> Pitch <code className="bg-slate-800 text-white px-1">C2</code>, <code className="bg-slate-800 text-white px-1">C3</code>, <code className="bg-slate-800 text-white px-1">BD</code>, or <code className="bg-slate-800 text-white px-1">KICK</code> (e.g. <code className="bg-slate-800 text-white px-1">BD/1</code>).</li>
            <li><strong>Snare Drum:</strong> Pitch <code className="bg-slate-800 text-white px-1">D2</code>, <code className="bg-slate-800 text-white px-1">D3</code>, <code className="bg-slate-800 text-white px-1">SD</code>, or <code className="bg-slate-800 text-white px-1">SNARE</code>.</li>
            <li><strong>Closed Hi-Hat:</strong> Pitch <code className="bg-slate-800 text-white px-1">F#2</code>, <code className="bg-slate-800 text-white px-1">HH</code>, or <code className="bg-slate-800 text-white px-1">HIHAT</code>.</li>
          </ul>
          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-850">Separate tokens with spaces. Lines starting with <code className="bg-slate-800 text-white px-1">//</code> or <code className="bg-slate-800 text-white px-1">#</code> are comments. Melody staff visualizes track <code className="bg-slate-800 text-white px-1">T1</code>.</p>
        </div>
      )}

      {/* Compiler Action Bar */}
      <div className="bg-slate-900/60 p-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Playback & Record buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            disabled={!!compiled.error || (compiled.notes.length === 0 && !compiled.tracks.some(t => t.enabled !== false && t.notes.length > 0))}
            className={`
              flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all
              ${isPlaying
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none'
              }
            `}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5" />
                Compile & Stop
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Compile & Play
              </>
            )}
          </button>

          <button
            onClick={onToggleRecord}
            disabled={isPlaying}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${isRecording
                ? 'bg-rose-600 text-white animate-pulse border border-rose-500 shadow-lg shadow-rose-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }
            `}
          >
            <Circle className={`w-3 h-3 ${isRecording ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'}`} />
            {isRecording ? 'Stop MIDI Rec' : 'Record MIDI'}
          </button>
        </div>

        {/* BPM & Metronome controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-mono">BPM:</span>
            <input
              type="number"
              min="40"
              max="240"
              value={bpm}
              onChange={(e) => onBpmChange(parseInt(e.target.value) || 120)}
              className="w-12 px-1 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs text-center font-mono"
            />
          </div>

          <button
            onClick={onToggleMetronome}
            className={`
              px-2 py-1 rounded text-[10px] font-semibold transition-all
              ${isMetronomeOn
                ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                : 'bg-slate-800 text-slate-400 border border-transparent'
              }
            `}
          >
            Metronome {isMetronomeOn ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={`
              px-2 py-1 rounded text-[10px] font-semibold transition-all
              ${wordWrap
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                : 'bg-slate-800 text-slate-400 border border-transparent'
              }
            `}
            title="Toggle Editor Word Wrap"
          >
            Wrap {wordWrap ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Editor Body (Line Numbers + Textarea) */}
      <div className="flex-1 flex overflow-hidden min-h-[150px] font-mono text-sm relative bg-slate-950">
        {/* Line Numbers Column */}
        <div
          ref={lineNumbersRef}
          className="w-9 bg-slate-900 border-r border-slate-800/80 text-slate-600 py-3 text-right pr-2 select-none overflow-hidden h-full flex flex-col"
          style={{ lineHeight: '1.6' }}
        >
          {lineNumbers.map((ln) => (
            <div key={ln}>{ln}</div>
          ))}
        </div>

        {/* Editor Area */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
          wrap={wordWrap ? "soft" : "off"}
          className="flex-1 bg-transparent text-slate-100 p-3 h-full resize-none outline-none border-none leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent overflow-y-auto"
          placeholder="// Write NoteFlow Notation here...&#10;// E.g. C4/0.5 D4/0.5 E4/1.0 C4/1.0"
          style={{
            lineHeight: '1.6',
            whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
            wordBreak: wordWrap ? 'break-word' : 'keep-all',
          }}
        />
      </div>

      {/* Compiler Footer */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
        <div>
          {compiled.error ? (
            <span className="text-rose-400 font-medium">
              ❌ Syntax Error: {compiled.error.message} (Line {compiled.error.line})
            </span>
          ) : (
            <span className="text-emerald-400 font-medium">
              ✓ Compiled: {compiled.notes.length} notes ({compiled.durations.reduce((a, b) => a + b, 0).toFixed(1)} beats)
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={uploadWorkspace}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors flex items-center gap-1 text-[10px]"
            title="Upload Local File"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>
          <button
            onClick={downloadWorkspace}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors flex items-center gap-1 text-[10px]"
            title="Download Workspace"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
          <button
            onClick={copyToClipboard}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors flex items-center gap-1 text-[10px]"
            title="Copy Code"
          >
            <Clipboard className="w-3.5 h-3.5" />
            Copy
          </button>
          <button
            onClick={onClear}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors flex items-center gap-1 text-[10px]"
            title="Clear Workspace"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};
