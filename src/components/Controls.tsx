import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface ControlsProps {
  octave: number;
  setOctave: (octave: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

export const Controls: React.FC<ControlsProps> = ({ octave, setOctave, volume, setVolume }) => {
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Octave Control */}
        <div>
          <label className="block text-sm font-medium text-purple-300 mb-3">
            Base Octave: {octave}
          </label>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6].map(oct => (
              <button
                key={oct}
                onClick={() => setOctave(oct)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${octave === oct
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : 'bg-slate-600 text-slate-200 hover:bg-slate-500'
                  }`}
              >
                {oct}
              </button>
            ))}
          </div>
        </div>

        {/* Volume Control */}
        <div>
          <label className="block text-sm font-medium text-purple-300 mb-3">
            <div className="flex items-center gap-2">
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              Volume: {Math.round(volume * 100)}%
            </div>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>
    </div>
  );
};