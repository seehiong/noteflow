//src/components/SynthSettings.tsx

import React from 'react';
import { HelpCircle } from 'lucide-react';

interface SynthSettingsProps {
  synthType: string;
  setSynthType: (type: string) => void;
  attack: number;
  setAttack: (val: number) => void;
  decay: number;
  setDecay: (val: number) => void;
  sustain: number;
  setSustain: (val: number) => void;
  release: number;
  setRelease: (val: number) => void;
  reverbLevel: number;
  setReverbLevel: (val: number) => void;
  volume: number;
  setVolume: (val: number) => void;
  onReset: () => void;
}

export const SynthSettings: React.FC<SynthSettingsProps> = ({
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
  onReset,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex flex-col shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
          Synthesizer Config
        </h3>
        <button
          onClick={onReset}
          className="text-[10px] px-2 py-0.5 rounded bg-slate-850 hover:bg-slate-850/80 hover:text-white border border-slate-700/60 text-slate-300 transition-colors font-mono"
        >
          Reset
        </button>
      </div>

      {/* 2-Dropdown Instrument vs Synth Selector */}
      <div className="grid grid-cols-2 gap-3">
        {/* Acoustic Instrument Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 group relative">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Acoustic Instrument</label>
            <HelpCircle className="w-3 h-3 text-slate-500 hover:text-slate-300 cursor-help transition-colors" />
            <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block w-48 bg-slate-950 text-[10px] leading-normal text-slate-300 p-2 rounded-lg border border-slate-800 shadow-2xl z-30 font-sans normal-case">
              Select a physically-modeled acoustic instrument profile (harmonic composition).
            </div>
          </div>
          <select
            value={['piano', 'organ', 'flute', 'cello', 'violin'].includes(synthType) ? synthType : ''}
            onChange={(e) => {
              if (e.target.value) setSynthType(e.target.value);
            }}
            className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2 py-1.5 text-[11px] text-slate-200 outline-none transition-colors focus:border-purple-500/50"
          >
            <option value="" disabled className="text-slate-600">-- Select Instrument --</option>
            <option value="piano">Classic Piano</option>
            <option value="organ">Pipe Organ</option>
            <option value="flute">Woodwind Flute</option>
            <option value="cello">Bowed Cello</option>
            <option value="violin">Bowed Violin</option>
          </select>
        </div>

        {/* Synthesizer & Percussion Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 group relative">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Synthesizer / Drums</label>
            <HelpCircle className="w-3 h-3 text-slate-500 hover:text-slate-300 cursor-help transition-colors" />
            <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block w-48 bg-slate-950 text-[10px] leading-normal text-slate-300 p-2 rounded-lg border border-slate-800 shadow-2xl z-30 font-sans normal-case">
              Select a raw synthesizer oscillator shape or the synthesized drum kit engine.
            </div>
          </div>
          <select
            value={['sine', 'triangle', 'square', 'sawtooth', 'drum'].includes(synthType) ? synthType : ''}
            onChange={(e) => {
              if (e.target.value) setSynthType(e.target.value);
            }}
            className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2 py-1.5 text-[11px] text-slate-200 outline-none transition-colors focus:border-purple-500/50"
          >
            <option value="" disabled className="text-slate-600">-- Select Synth/Drums --</option>
            <option value="sine">Sine Wave (Pure)</option>
            <option value="triangle">Triangle Wave (Mellow)</option>
            <option value="square">Square Wave (Chiptune)</option>
            <option value="sawtooth">Sawtooth Wave (Lead)</option>
            <option value="drum">Drum Kit (BD/SD/HH)</option>
          </select>
        </div>
      </div>

      {/* ADSR Controls */}
      <div className="space-y-3.5 pt-1">
        {/* Attack Time */}
        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <div className="flex items-center gap-1.5 group relative">
              <span className="text-slate-400">Attack Time</span>
              <HelpCircle className="w-3 h-3 text-slate-500 hover:text-slate-300 cursor-help transition-colors" />
              <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block w-56 bg-slate-950 text-[10px] leading-normal text-slate-300 p-2 rounded-lg border border-slate-800 shadow-2xl z-30 font-sans normal-case">
                The duration it takes for the note to rise from silence to peak volume when pressed.
              </div>
            </div>
            <span className="text-purple-400">{attack}s</span>
          </div>
          <input
            type="range"
            min="0.001"
            max="1.0"
            step="0.01"
            value={attack}
            onChange={(e) => setAttack(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 hover:bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-colors"
          />
        </div>

        {/* Decay Time */}
        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <div className="flex items-center gap-1.5 group relative">
              <span className="text-slate-400">Decay Time</span>
              <HelpCircle className="w-3 h-3 text-slate-500 hover:text-slate-300 cursor-help transition-colors" />
              <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block w-56 bg-slate-950 text-[10px] leading-normal text-slate-300 p-2 rounded-lg border border-slate-800 shadow-2xl z-30 font-sans normal-case">
                The duration it takes for the note to drop from peak volume down to the sustain volume level.
              </div>
            </div>
            <span className="text-purple-400">{decay}s</span>
          </div>
          <input
            type="range"
            min="0.001"
            max="1.0"
            step="0.01"
            value={decay}
            onChange={(e) => setDecay(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 hover:bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-colors"
          />
        </div>

        {/* Sustain Level */}
        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <div className="flex items-center gap-1.5 group relative">
              <span className="text-slate-400">Sustain Level</span>
              <HelpCircle className="w-3 h-3 text-slate-500 hover:text-slate-300 cursor-help transition-colors" />
              <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block w-56 bg-slate-950 text-[10px] leading-normal text-slate-300 p-2 rounded-lg border border-slate-800 shadow-2xl z-30 font-sans normal-case">
                The constant volume level the note stays at while you continue holding down the key.
              </div>
            </div>
            <span className="text-purple-400">{Math.round(sustain * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={sustain}
            onChange={(e) => setSustain(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 hover:bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-colors"
          />
        </div>

        {/* Release Time */}
        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <div className="flex items-center gap-1.5 group relative">
              <span className="text-slate-400">Release Time</span>
              <HelpCircle className="w-3 h-3 text-slate-500 hover:text-slate-300 cursor-help transition-colors" />
              <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block w-56 bg-slate-950 text-[10px] leading-normal text-slate-300 p-2 rounded-lg border border-slate-800 shadow-2xl z-30 font-sans normal-case">
                The duration it takes for the note to fade out to silence after you release the key.
              </div>
            </div>
            <span className="text-purple-400">{release}s</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="2.0"
            step="0.05"
            value={release}
            onChange={(e) => setRelease(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 hover:bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-colors"
          />
        </div>

        {/* Reverb Mix */}
        <div className="border-t border-slate-800/80 pt-3">
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <div className="flex items-center gap-1.5 group relative">
              <span className="text-slate-400">Reverb Mix</span>
              <HelpCircle className="w-3 h-3 text-slate-500 hover:text-slate-300 cursor-help transition-colors" />
              <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block w-56 bg-slate-950 text-[10px] leading-normal text-slate-300 p-2 rounded-lg border border-slate-800 shadow-2xl z-30 font-sans normal-case">
                Simulates room acoustics, adding depth, echo, and spatial resonance to the sound.
              </div>
            </div>
            <span className="text-purple-400">{Math.round(reverbLevel * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1.0"
            step="0.05"
            value={reverbLevel}
            onChange={(e) => setReverbLevel(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 hover:bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-colors"
          />
        </div>

        {/* Volume Output (Mirrored) */}
        <div className="border-t border-slate-800/80 pt-3">
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <div className="flex items-center gap-1.5 group relative">
              <span className="text-slate-400">Master Volume Output</span>
              <HelpCircle className="w-3 h-3 text-slate-500 hover:text-slate-300 cursor-help transition-colors" />
              <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block w-56 bg-slate-950 text-[10px] leading-normal text-slate-300 p-2 rounded-lg border border-slate-800 shadow-2xl z-30 font-sans normal-case">
                The overall sound output loudness limit of the synthesizer.
              </div>
            </div>
            <span className="text-purple-400">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1.0"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 hover:bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-purple-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
