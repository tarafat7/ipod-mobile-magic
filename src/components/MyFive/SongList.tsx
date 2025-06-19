
import React from 'react';
import { Music, ExternalLink } from 'lucide-react';

interface SpotifyTrackInfo {
  name: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
  addedDate: string;
}

interface SongListProps {
  songs: SpotifyTrackInfo[];
  selectedSongIndex: number;
  onSongClick?: (spotifyUrl: string) => void;
}

const SongList: React.FC<SongListProps> = ({ songs, selectedSongIndex, onSongClick }) => {
  // Don't render anything if there are no songs
  if (!songs || songs.length === 0) {
    return null;
  }

  const handleSongClick = (spotifyUrl: string) => {
    if (onSongClick) {
      onSongClick(spotifyUrl);
    } else {
      window.open(spotifyUrl, '_blank');
    }
  };

  return (
    <div className="bg-white px-2 relative z-10">
      {songs.map((song, index) => (
        <div 
          key={`song-${index}-${song.spotifyUrl}`}
          className={`flex items-center p-1.5 border-b border-gray-200 transition-colors ${
            selectedSongIndex === index 
              ? 'bg-blue-500 text-white' 
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0 overflow-hidden mr-2">
            {song.albumArt ? (
              <img 
                src={song.albumArt} 
                alt={`${song.name} album art`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // Fallback to music icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center ${song.albumArt ? 'hidden' : ''}`}>
              <Music size={14} className="text-gray-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm truncate ${
              selectedSongIndex === index ? 'text-white' : 'text-black'
            }`}>
              {song.name}
            </h3>
            <p className={`text-xs truncate ${
              selectedSongIndex === index ? 'text-blue-100' : 'text-gray-600'
            }`}>
              {song.artist || song.addedDate}
            </p>
          </div>
          {selectedSongIndex === index && (
            <div className="text-white text-sm ml-2 flex-shrink-0">▶</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SongList;
