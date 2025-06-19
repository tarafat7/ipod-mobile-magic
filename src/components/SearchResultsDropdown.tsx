
import React from 'react';
import { Music } from 'lucide-react';
import { SpotifyTrack } from '../types/spotify';
import { formatDuration } from '../utils/spotifySearch';

interface SearchResultsDropdownProps {
  searchResults: SpotifyTrack[];
  isSearching: boolean;
  searchQuery: string;
  onTrackSelect: (track: SpotifyTrack) => void;
}

const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({
  searchResults,
  isSearching,
  searchQuery,
  onTrackSelect
}) => {
  return (
    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
      {isSearching ? (
        <div className="p-3 text-center text-gray-500">
          <div className="animate-pulse">Searching...</div>
        </div>
      ) : searchResults.length > 0 ? (
        searchResults.map((track) => (
          <button
            key={track.id}
            type="button"
            onClick={() => onTrackSelect(track)}
            className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
          >
            <div className="w-10 h-10 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
              {track.albumArt ? (
                <img 
                  src={track.albumArt} 
                  alt={`${track.name} album art`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music size={14} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {track.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {track.artist} • {track.album}
              </p>
            </div>
            <div className="text-xs text-gray-400">
              {formatDuration(track.duration)}
            </div>
          </button>
        ))
      ) : searchQuery && (
        <div className="p-3 text-center text-gray-500">
          No results found
        </div>
      )}
    </div>
  );
};

export default SearchResultsDropdown;
