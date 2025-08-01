import React from 'react';
import { Play, Square } from 'lucide-react';
import { sampleSongs } from '../data/sampleSongs';

interface SampleSongsProps {
  onPlaySong: (songName: string) => void;
  currentSong: string;
  setCurrentSong: (songName: string) => void;
}

export const SampleSongs: React.FC<SampleSongsProps> = ({ 
  onPlaySong, 
  currentSong, 
  setCurrentSong
}) => {
  const handleSelectSong = (songName: string) => {
    onPlaySong(songName);
  };

  return (
    <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4 text-center">Sample Songs</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(sampleSongs).map(songName => (
          <button
            key={songName}
            onClick={() => handleSelectSong(songName)}
            className={`
              p-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-3
              ${currentSong === songName
                ? 'bg-emerald-600 text-white shadow-lg scale-105'
                : 'bg-slate-700 text-slate-200 hover:bg-slate-600 hover:scale-102'
              }
            `}
          >
            <Play className="w-5 h-5" />
            <span className="capitalize">{songName.replace(/([A-Z])/g, ' $1').trim()}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-4 text-center text-emerald-200 text-sm">
        Select a song to see its musical score, then use Play/Practice mode
      </div>
    </div>
  );
};