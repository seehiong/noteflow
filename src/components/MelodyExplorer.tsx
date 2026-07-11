//src/components/MelodyExplorer.tsx

import React from 'react';
import { Music } from 'lucide-react';
import { sampleSongs } from '../data/sampleSongs';

interface MelodyExplorerProps {
  currentSong: string;
  onSongSelect: (songName: string) => void;
  onNewSong: () => void;
}

export const MelodyExplorer: React.FC<MelodyExplorerProps> = ({
  currentSong,
  onSongSelect,
  onNewSong,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex flex-col shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
          Melodies Explorer
        </h3>
        <button
          onClick={onNewSong}
          className="text-[10px] px-2 py-0.5 rounded bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 transition-all font-semibold font-mono"
        >
          + New Song
        </button>
      </div>

      <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
        {Object.keys(sampleSongs).map((songName) => (
          <button
            key={songName}
            onClick={() => onSongSelect(songName)}
            className={`
              w-full px-3 py-1.5 rounded-lg text-left text-xs font-mono transition-all flex items-center gap-2
              ${currentSong === songName
                ? 'bg-purple-600/20 border border-purple-500/30 text-purple-200'
                : 'bg-slate-950/40 hover:bg-slate-800/50 border border-transparent text-slate-400 hover:text-slate-200'
              }
            `}
          >
            <Music className="w-3.5 h-3.5 text-purple-400" />
            <span className="capitalize truncate">{songName.replace(/([A-Z])/g, ' $1').trim()}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
