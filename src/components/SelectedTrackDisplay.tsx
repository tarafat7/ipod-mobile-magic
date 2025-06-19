
import React from 'react';
import { Music, Check, X } from 'lucide-react';
import { SpotifyTrack } from '../types/spotify';

interface SelectedTrackDisplayProps {
  track: SpotifyTrack;
  onRemove: () => void;
}

const SelectedTrackDisplay: React.FC<SelectedTrackDisplayProps> = ({ track, onRemove }) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
        {track.albumArt ? (
          <img 
            src={track.albumArt} 
            alt={`${track.name} album art`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music size={16} className="text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {track.name}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {track.artist}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Check size={16} className="text-green-600" />
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          title="Remove song"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default SelectedTrackDisplay;
