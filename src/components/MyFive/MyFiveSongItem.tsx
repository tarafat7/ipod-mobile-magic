
import React from 'react';
import { Music } from 'lucide-react';

interface SpotifyTrackInfo {
  name: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
  addedDate: string;
}

interface MyFiveSongItemProps {
  song: SpotifyTrackInfo;
  index: number;
  isSelected: boolean;
}

const MyFiveSongItem: React.FC<MyFiveSongItemProps> = ({ song, index, isSelected }) => {
  return (
    <div 
      key={index} 
      className={`flex items-center p-2 border-b border-gray-200 transition-colors ${
        isSelected 
          ? 'bg-blue-500 text-white' 
          : 'bg-white hover:bg-gray-50'
      }`}
    >
      <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden mr-3">
        {song.albumArt ? (
          <img 
            src={song.albumArt} 
            alt={`${song.name} album art`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music size={20} className="text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold text-base truncate ${
          isSelected ? 'text-white' : 'text-black'
        }`}>
          {song.name}
        </h3>
        <p className={`text-sm truncate ${
          isSelected ? 'text-blue-100' : 'text-gray-600'
        }`}>
          {song.artist || song.addedDate}
        </p>
      </div>
      {isSelected && (
        <div className="text-white text-xl">▶</div>
      )}
    </div>
  );
};

export default MyFiveSongItem;
