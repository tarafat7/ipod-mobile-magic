
import React from 'react';
import { Song } from '../types/iPod';

interface MusicScreenProps {
  selectedSong: Song;
  isPlaying: boolean;
  currentTime: string;
}

const MusicScreen: React.FC<MusicScreenProps> = ({ selectedSong, isPlaying, currentTime }) => {
  return (
    <div className="text-black bg-white h-full p-4 flex flex-col justify-center">
      <div className="text-center">
        <h3 className="font-bold text-lg mb-4">Now Playing</h3>
        <div className="mb-4">
          <div className="text-base font-semibold">{selectedSong.title}</div>
          <div className="text-sm text-gray-600">{selectedSong.artist}</div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="text-sm text-gray-500">
            {currentTime} / {selectedSong.duration}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-gray-400 h-1 rounded-full w-1/3"></div>
          </div>
        </div>

        <div className={`inline-block px-3 py-1 rounded text-sm ${
          isPlaying ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
        }`}>
          {isPlaying ? '▶ Playing' : '⏸ Paused'}
        </div>
      </div>
    </div>
  );
};

export default MusicScreen;
