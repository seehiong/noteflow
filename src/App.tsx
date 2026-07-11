//src/App.tsx

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Piano } from './components/Piano';
import { KeyboardSettings } from './components/KeyboardSettings';
import { MusicalScore } from './components/MusicalScore';
import { noteMapping as defaultNoteMapping } from './utils/noteMapping';
import { sampleSongs } from './data/sampleSongs';
import { Volume2, Activity } from 'lucide-react';
import { normalizeNote } from './utils/musicUtils';
import { NoteEditor, compileNotation } from './components/NoteEditor';
import { MidiConsole, ConsoleLog } from './components/MidiConsole';
import { AIAssistant } from './components/AIAssistant';
import { MidiRecorder } from './utils/MidiRecorder';

// Imported components & custom hooks
import { SynthSettings } from './components/SynthSettings';
import { MelodyExplorer } from './components/MelodyExplorer';
import { useWebMidi } from './hooks/useWebMidi';
import { useQwertyKeyboard } from './hooks/useQwertyKeyboard';
import { useSynth } from './hooks/useSynth';

interface KeyboardMapping {
  [key: string]: { note: string; octave: number };
}

// Convert note arrays to NoteFlow text notation format
const convertSongToNotation = (notes: string[], durations: number[]): string => {
  const tokens: string[] = [];
  for (let i = 0; i < notes.length; i++) {
    tokens.push(`${notes[i]}/${durations[i]}`);
  }

  // Arrange into lines of 8 notes for readable formatting
  const lines: string[] = [];
  for (let i = 0; i < tokens.length; i += 8) {
    lines.push(tokens.slice(i, i + 8).join(' '));
  }
  return lines.join('\n');
};

// Generates the initial key map configurations
const generateDefaultKeyboardMapping = (): KeyboardMapping => {
  const mapping: KeyboardMapping = {};
  Object.entries(defaultNoteMapping).forEach(([key, note]) => {
    const asdfKeys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'];
    const zxcvKeys = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ','];

    let baseOctave = 3;
    if (asdfKeys.includes(key)) baseOctave = 4;
    if (zxcvKeys.includes(key)) baseOctave = 5;

    const isOctaveCompletion = ['i', 'k', ','].includes(key);
    const finalOctave = isOctaveCompletion ? baseOctave + 1 : baseOctave;
    mapping[key] = { note, octave: finalOctave };
  });
  return mapping;
};

function App() {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [currentSong, setCurrentSong] = useState<string>('Twinkle Twinkle Star');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [trackNoteIndices, setTrackNoteIndices] = useState<Record<string, number>>({});
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [metronomeBPM, setMetronomeBPM] = useState(120);
  const [staffExpanded, setStaffExpanded] = useState(false);
  const [staffFullscreen, setStaffFullscreen] = useState(false);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const [aiCollapsed, setAiCollapsed] = useState(false);

  // Custom states for MIDI IDE workspace
  const [code, setCode] = useState<string>(() => {
    const saved = localStorage.getItem('noteflow_workspace');
    if (saved) return saved;
    const song = sampleSongs['Twinkle Twinkle Star'];
    return convertSongToNotation(song.notes, song.durations);
  });

  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const [keyboardMapping, setKeyboardMapping] = useState<KeyboardMapping>(generateDefaultKeyboardMapping);

  const songTimeoutRef = useRef<number | null>(null);
  const playbackTimeoutsRef = useRef<number[]>([]);
  const midiRecorderRef = useRef(new MidiRecorder());

  // Declare console logging helper
  const addConsoleLog = useCallback((type: ConsoleLog['type'], message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => {
      const newLogs = [...prev, { timestamp, type, message }];
      return newLogs.slice(-100);
    });
  }, []);

  // Hook in audio synthesis engine & parameters
  const {
    audioEngineRef,
    synthType,
    setSynthType,
    attack,
    setAttack,
    decay,
    setDecay,
    sustain,
    setSustain,
    release,
    setRelease,
    reverbLevel,
    setReverbLevel,
    volume,
    setVolume,
    handleResetSynth,
  } = useSynth(addConsoleLog);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      playbackTimeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const stopNote = useCallback((rawNote: string, origin: string = 'Virtual Key') => {
    if (!audioEngineRef.current) return;
    const note = normalizeNote(rawNote);

    audioEngineRef.current.stopNote(note);
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });

    addConsoleLog('input-off', `${note} (${origin})`);

    // MIDI Recording stop logs
    if (midiRecorderRef.current.getRecordingStatus()) {
      midiRecorderRef.current.recordNoteOff(note);
    }
  }, [audioEngineRef, addConsoleLog]);

  const compiledSongData = useMemo(() => {
    const res = compileNotation(code);
    if (res.error) return undefined;
    return {
      notes: res.notes,
      durations: res.durations,
      tracks: res.tracks,
      title: currentSong ? currentSong.replace(/([A-Z])/g, ' $1').trim() : 'Custom Song Workspace'
    };
  }, [code, currentSong]);

  const playNote = useCallback((rawNote: string, duration?: number, velocity: number = 0.7, origin: string = 'Virtual Key') => {
    if (!audioEngineRef.current) return;
    const note = normalizeNote(rawNote);

    if (duration) {
      if (!isMuted) {
        audioEngineRef.current.playNote(note, velocity, duration, undefined, true);
      }
      setActiveNotes(prev => new Set(prev).add(note));
      return;
    }

    addConsoleLog('input-on', `${note} - Velocity: ${Math.round(velocity * 127)} (${origin})`);

    // Record midi signals
    if (midiRecorderRef.current.getRecordingStatus()) {
      midiRecorderRef.current.recordNoteOn(note);
    }

    // Practice mode inputs validation
    if (isPracticeMode && compiledSongData) {
      const song = compiledSongData;
      if (song.notes[currentNoteIndex] === 'rest') return;

      const expectedNote = normalizeNote(song.notes[currentNoteIndex]);

      if (note === expectedNote) {
        const beatDuration = song.durations[currentNoteIndex];
        const noteDurationMs = beatDuration * (60 / metronomeBPM) * 1000;

        audioEngineRef.current.playNote(note, velocity, noteDurationMs);
        setActiveNotes(prev => new Set(prev).add(note));

        const releaseBuffer = 50;
        setTimeout(() => {
          stopNote(note, 'Practice Playback');
        }, noteDurationMs - releaseBuffer);

        setCurrentNoteIndex(prev => prev + 1);

        if (currentNoteIndex + 1 >= song.notes.length) {
          setIsPracticeMode(false);
          addConsoleLog('system', 'Congratulations! You completed practicing the song.');
        }
        return;
      }
    }

    audioEngineRef.current.playNote(note, velocity);
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

  }, [audioEngineRef, isMuted, isPracticeMode, compiledSongData, currentNoteIndex, metronomeBPM, stopNote, addConsoleLog]);

  // Bind key listeners using custom hooks
  useQwertyKeyboard(keyboardMapping, playNote, stopNote);

  const handleMidiNoteOn = useCallback((noteName: string, velocity: number) => {
    playNote(noteName, undefined, velocity, 'MIDI Keyboard');
  }, [playNote]);

  const handleMidiNoteOff = useCallback((noteName: string) => {
    stopNote(noteName, 'MIDI Keyboard');
  }, [stopNote]);

  const { midiConnected, midiDeviceName } = useWebMidi(handleMidiNoteOn, handleMidiNoteOff, addConsoleLog);

  // Autosave code content to local storage
  useEffect(() => {
    localStorage.setItem('noteflow_workspace', code);
  }, [code]);

  // Metronome listeners
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
  }, [audioEngineRef, isMetronomeOn, metronomeBPM]);

  // Autoplay AudioContext state handler
  useEffect(() => {
    const checkSuspended = () => {
      if (audioEngineRef.current) {
        const state = audioEngineRef.current.audioContext.state;
        if (state === 'suspended') {
          addConsoleLog('system', '⚠️ Audio Engine is suspended by browser autoplay policy. Click anywhere or press a piano key to enable sound!');
        }
      }
    };
    const timer = setTimeout(checkSuspended, 1000);
    return () => clearTimeout(timer);
  }, [audioEngineRef, addConsoleLog]);

  useEffect(() => {
    const resumeAudio = () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.resumeContext().then(() => {
          if (audioEngineRef.current?.audioContext.state === 'running') {
            addConsoleLog('system', '🔊 Audio Engine is active and running.');
            window.removeEventListener('click', resumeAudio);
            window.removeEventListener('keydown', resumeAudio);
          }
        });
      }
    };

    window.addEventListener('click', resumeAudio);
    window.addEventListener('keydown', resumeAudio);
    return () => {
      window.removeEventListener('click', resumeAudio);
      window.removeEventListener('keydown', resumeAudio);
    };
  }, [audioEngineRef, addConsoleLog]);

  // Practice mode skips rest notes automatically
  useEffect(() => {
    if (isPracticeMode && compiledSongData) {
      const song = compiledSongData;
      if (currentNoteIndex < song.notes.length) {
        const currentNote = song.notes[currentNoteIndex];
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
  }, [currentNoteIndex, isPracticeMode, compiledSongData, metronomeBPM]);

  // Load initial code when currentSong changes
  useEffect(() => {
    if (currentSong && sampleSongs[currentSong]) {
      const song = sampleSongs[currentSong];

      // Load raw lines for multi-track notation or compile arrays for standard format
      if (song.notes.length > 0 && song.notes[0].startsWith('T')) {
        setCode(song.notes.join('\n'));
      } else {
        const notationStr = convertSongToNotation(song.notes, song.durations);
        setCode(notationStr);
      }
      addConsoleLog('system', `Loaded song workspace: ${currentSong}`);
    }
  }, [currentSong, addConsoleLog]);

  // Play compiled song sequence
  const playSong = useCallback((compiled: any) => {
    setIsPlaying(true);
    setCurrentNoteIndex(0);
    setTrackNoteIndices({});

    const beatDurationMs = (60 / metronomeBPM) * 1000;
    addConsoleLog('system', `Starting multi-track playback...`);

    const timeouts: number[] = [];

    const enabledTracks = compiled.tracks.filter((t: any) => t.enabled !== false);
    const disabledTracks = compiled.tracks.filter((t: any) => t.enabled === false);
    if (disabledTracks.length > 0) {
      const skippedIds = disabledTracks.map((t: any) => t.id).join(', ');
      addConsoleLog('system', `Skipping ${disabledTracks.length} disabled track(s): ${skippedIds}`);
    }
    addConsoleLog('system', `Playing ${enabledTracks.length} active track(s)...`);


    // Schedule note events for enabled tracks only
    compiled.tracks.forEach((track: any) => {
      if (track.enabled === false) return; // Skip disabled tracks

      track.notes.forEach((noteEvent: any) => {
        const playTimeMs = noteEvent.beatOffset * beatDurationMs;
        const durationMs = noteEvent.duration * beatDurationMs;

        // Schedule ALL notes (including rests) so the visual cursor stays in sync
        const onTimeout = window.setTimeout(() => {
          // Update per-track note index for visual highlighting on ALL tracks
          setTrackNoteIndices(prev => ({ ...prev, [track.id]: noteEvent.noteIndex }));

          // Also keep T1 in sync for practice mode
          if (track.id === 'T1') {
            setCurrentNoteIndex(noteEvent.noteIndex);
          }

          // Play audio and simulate keyboard press only for non-rest notes
          if (noteEvent.note !== 'rest') {
            const normalized = normalizeNote(noteEvent.note);
            
            // Press the key visually
            setActiveNotes(prev => new Set(prev).add(normalized));

            if (!isMuted) {
              audioEngineRef.current?.playNote(noteEvent.note, 0.7, durationMs, track.synthType);
            }

            // Release the key visually slightly before the next note starts (articulation gap)
            // This ensures repeated consecutive notes trigger distinct down/up animations
            const visualHoldTime = Math.max(30, durationMs - 45);
            const offTimeout = window.setTimeout(() => {
              setActiveNotes(prev => {
                const newSet = new Set(prev);
                newSet.delete(normalized);
                return newSet;
              });
            }, visualHoldTime);
            
            timeouts.push(offTimeout);
          }
        }, playTimeMs);

        timeouts.push(onTimeout);
      });
    });

    // Schedule end of song event (maximum length across enabled tracks)
    const maxLengthBeats = compiled.tracks.reduce((max: number, track: any) => {
      if (track.enabled === false) return max; // Ignore disabled tracks
      const trackLength = track.notes.reduce((sum: number, n: any) => sum + n.duration, 0);
      return Math.max(max, trackLength);
    }, 0);

    const endTimeout = window.setTimeout(() => {
      setIsPlaying(false);
      setCurrentNoteIndex(0);
      setTrackNoteIndices({});
      setActiveNotes(new Set()); // Clear any stuck active notes
      addConsoleLog('system', 'Playback finished successfully.');
    }, maxLengthBeats * beatDurationMs);

    timeouts.push(endTimeout);

    playbackTimeoutsRef.current = timeouts;
  }, [audioEngineRef, isMuted, metronomeBPM, addConsoleLog]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (playbackTimeoutsRef.current) {
        playbackTimeoutsRef.current.forEach(clearTimeout);
        playbackTimeoutsRef.current = [];
      }
      setIsPlaying(false);
      setIsPracticeMode(false);
      setCurrentNoteIndex(0);
      setTrackNoteIndices({});
      setActiveNotes(new Set()); // Clear any stuck active notes
      if (audioEngineRef.current) {
        audioEngineRef.current.stopAllNotes();
      }
      addConsoleLog('system', 'Playback stopped.');
    } else {
      const result = compileNotation(code, synthType);
      if (result.error) {
        addConsoleLog('error', `Compile failed: ${result.error.message}`);
        return;
      }
      setIsPracticeMode(false);
      playSong(result);
    }
  };

  const handleToggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    if (newMutedState && compiledSongData) {
      setIsPracticeMode(true);
      setIsPlaying(false);
      setCurrentNoteIndex(0);
      if (playbackTimeoutsRef.current) {
        playbackTimeoutsRef.current.forEach(clearTimeout);
        playbackTimeoutsRef.current = [];
      }
      addConsoleLog('system', 'Practice Mode enabled. Play highlighted notes to advance!');
    } else {
      setIsPracticeMode(false);
      addConsoleLog('system', 'Listen Mode enabled.');
    }
  };

  const handleSongSelect = (songName: string) => {
    if (playbackTimeoutsRef.current) {
      playbackTimeoutsRef.current.forEach(clearTimeout);
      playbackTimeoutsRef.current = [];
    }
    setIsPlaying(false);
    setCurrentNoteIndex(0);
    setIsPracticeMode(false);
    setCurrentSong(songName);
  };

  const handleNewSong = () => {
    if (playbackTimeoutsRef.current) {
      playbackTimeoutsRef.current.forEach(clearTimeout);
      playbackTimeoutsRef.current = [];
    }
    setIsPlaying(false);
    setCurrentNoteIndex(0);
    setIsPracticeMode(false);
    setCurrentSong('');
    setCode('// Write your new melody here\n// Use format: C4/1 D4/1 E4/1 C4/1\n\n');
    addConsoleLog('system', 'Created new empty song workspace.');
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      midiRecorderRef.current.stop();
      setIsRecording(false);
      addConsoleLog('system', 'MIDI recording complete.');
    } else {
      setIsRecording(true);
      addConsoleLog('system', `Recording started (Metronome: ${metronomeBPM} BPM). Play on keyboard...`);
      midiRecorderRef.current.start(metronomeBPM, (token) => {
        setCode(prev => {
          const trimmed = prev.trim();
          const lines = trimmed.split('\n');
          const lastLine = lines[lines.length - 1] || '';
          const tokensInLastLine = lastLine.split(/\s+/).filter(Boolean);

          if (tokensInLastLine.length >= 8) {
            return trimmed + '\n' + token;
          }
          return prev ? trimmed + ' ' + token : token;
        });
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">
              NoteFlow Studio
            </h1>
            <p className="text-[10px] text-purple-300 font-mono tracking-wider uppercase">
              MIDI Synthesizer IDE v2.0
            </p>
          </div>
        </div>

        {/* Global Stats Bar */}
        <div className="flex items-center gap-6 font-mono text-[11px] text-slate-400">
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Synthesizer: ACTIVE</span>
          </div>
          <div className="hidden md:block">
            <span>Latency: ~2.4ms</span>
          </div>
          <div>
            <span>Host: GH Pages</span>
          </div>
        </div>
      </header>

      {/* Main Studio Body Layout */}
      <main className={`flex-1 p-4 flex flex-col gap-4 overflow-hidden min-h-0 xl:grid ${staffExpanded ? 'xl:grid-cols-5' : 'xl:grid-cols-4'}`}>

        {/* Left Column - Melodies Explorer & ADSR Panel */}
        <div className="xl:col-span-1 flex flex-col gap-4 min-h-0 overflow-y-auto">
          <MelodyExplorer
            currentSong={currentSong}
            onSongSelect={handleSongSelect}
            onNewSong={handleNewSong}
          />

          <SynthSettings
            synthType={synthType}
            setSynthType={setSynthType}
            attack={attack}
            setAttack={setAttack}
            decay={decay}
            setDecay={setDecay}
            sustain={sustain}
            setSustain={setSustain}
            release={release}
            setRelease={setRelease}
            reverbLevel={reverbLevel}
            setReverbLevel={setReverbLevel}
            volume={volume}
            setVolume={setVolume}
            onReset={handleResetSynth}
          />
        </div>

        {/* Center Panel (xl:col-span-2) - Code Editor & MIDI Console */}
        <div className="xl:col-span-2 flex flex-col gap-4 min-h-0">
          <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
            {/* Note Editor Workspace */}
            <div className="flex-1 min-h-[300px] flex flex-col">
              <NoteEditor
                code={code}
                onCodeChange={setCode}
                isPlaying={isPlaying}
                isRecording={isRecording}
                onTogglePlay={handleTogglePlay}
                onToggleRecord={handleToggleRecord}
                onClear={handleNewSong}
                bpm={metronomeBPM}
                onBpmChange={setMetronomeBPM}
                isMetronomeOn={isMetronomeOn}
                onToggleMetronome={() => setIsMetronomeOn(!isMetronomeOn)}
                currentSongName={currentSong}
                aiCollapsed={aiCollapsed}
                onToggleAi={() => setAiCollapsed(!aiCollapsed)}
              />
            </div>

            {/* AI Assistant Sidebar (Beside the Workspace) */}
            <div 
              style={{ transition: 'all 300ms ease' }}
              className={`bg-slate-900 border border-slate-850 rounded-xl flex flex-col shadow-lg overflow-hidden flex-shrink-0 ${
                aiCollapsed ? 'w-0 border-none opacity-0 pointer-events-none' : 'w-full lg:w-80 opacity-100'
              }`}
            >
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
                <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-purple-400 font-sans">🤖</span> AI Assistant
                </h3>
                <button 
                  onClick={() => setAiCollapsed(true)} 
                  className="text-slate-500 hover:text-white transition-colors text-base font-bold leading-none px-1"
                  title="Collapse AI Assistant"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
                <AIAssistant
                  code={code}
                  onCodeChange={setCode}
                  addConsoleLog={addConsoleLog}
                />
              </div>
            </div>
          </div>

          {/* Collapsible MIDI Event Console */}
          <MidiConsole
            logs={logs}
            onClear={() => setLogs([])}
            midiConnected={midiConnected}
            midiDeviceName={midiDeviceName}
            collapsed={consoleCollapsed}
            onToggleCollapse={() => setConsoleCollapsed(!consoleCollapsed)}
          />
        </div>

        {/* Right Panel - Sheet Staff Visualizer (expands to col-span-2 when staffExpanded) */}
        <div className={`${staffExpanded ? 'xl:col-span-2' : 'xl:col-span-1'} flex flex-col gap-4 min-h-0 overflow-y-auto`}>
          <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex flex-col shadow-lg flex-1 min-h-[350px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                Staff Preview
              </h3>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setStaffExpanded(prev => !prev)}
                  title={staffExpanded ? 'Collapse panel' : 'Expand panel'}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-xs font-mono border border-slate-700"
                >
                  {staffExpanded ? '⇥' : '⇤'}
                </button>
                <button
                  onClick={() => setStaffFullscreen(prev => !prev)}
                  title="Fullscreen"
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-xs font-mono border border-slate-700"
                >
                  ⛶
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 relative">
              <MusicalScore
                currentSong={currentSong}
                isPlaying={isPlaying}
                isMuted={isMuted}
                isPracticeMode={isPracticeMode}
                currentNoteIndex={currentNoteIndex}
                trackNoteIndices={trackNoteIndices}
                onTogglePlay={handleTogglePlay}
                onToggleMute={handleToggleMute}
                onShowHint={() => setShowHint(true)}
                songData={compiledSongData}
                keyboardMapping={keyboardMapping}
                showHint={showHint}
                onCloseHint={() => setShowHint(false)}
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 shadow-lg">
            <KeyboardSettings
              mapping={keyboardMapping}
              onMappingChange={setKeyboardMapping}
            />
          </div>
        </div>

        {/* Fullscreen Staff Overlay */}
        {staffFullscreen && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900">
              <h2 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">⚡ Staff Preview — Fullscreen</h2>
              <button
                onClick={() => setStaffFullscreen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
              >
                ✕ Exit Fullscreen
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <MusicalScore
                currentSong={currentSong}
                isPlaying={isPlaying}
                isMuted={isMuted}
                isPracticeMode={isPracticeMode}
                currentNoteIndex={currentNoteIndex}
                trackNoteIndices={trackNoteIndices}
                onTogglePlay={handleTogglePlay}
                onToggleMute={handleToggleMute}
                onShowHint={() => setShowHint(true)}
                songData={compiledSongData}
                keyboardMapping={keyboardMapping}
                showHint={showHint}
                onCloseHint={() => setShowHint(false)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Interactive Piano (Always at bottom) */}
      <footer className="bg-slate-900 border-t border-slate-800/80 p-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-slate-300 font-mono">Master Volume:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 h-1 bg-slate-800 hover:bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-colors"
              />
              <span className="text-[11px] text-slate-400 font-mono">{Math.round(volume * 100)}%</span>
            </div>

            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
              <div>Hold <kbd className="bg-slate-950 border border-slate-800 text-slate-400 px-1 py-0.5 rounded text-[9px]">Shift</kbd> for Sharps (#)</div>
              <div>Hold <kbd className="bg-slate-950 border border-slate-800 text-slate-400 px-1 py-0.5 rounded text-[9px]">Alt</kbd> for Flats (b)</div>
              <div className="hidden sm:block text-purple-400">Interact with on-screen keys or plug in MIDI hardware</div>
            </div>
          </div>

          <Piano
            activeNotes={activeNotes}
            onNotePlay={(note) => playNote(note, undefined, 0.7, 'Virtual Key')}
            onNoteStop={(note) => stopNote(note, 'Virtual Key')}
          />
        </div>
      </footer>
    </div>
  );
}

export default App;