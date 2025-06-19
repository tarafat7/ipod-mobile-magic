
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Music, Search, Check } from 'lucide-react';

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  spotifyUrl: string;
  duration: number;
}

interface SpotifySearchInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

const SpotifySearchInput: React.FC<SpotifySearchInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "Search for a song..."
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Load selected track info when value changes
  useEffect(() => {
    if (value && !selectedTrack) {
      // Extract track ID from Spotify URL
      const trackIdMatch = value.match(/track\/([a-zA-Z0-9]+)/);
      if (trackIdMatch) {
        const trackId = trackIdMatch[1];
        // Find this track in search results if available, or create a placeholder
        const existingTrack = searchResults.find(track => track.id === trackId);
        if (existingTrack) {
          setSelectedTrack(existingTrack);
        }
      }
    } else if (!value && selectedTrack) {
      setSelectedTrack(null);
    }
  }, [value, selectedTrack, searchResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchSpotify = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('spotify-search', {
        body: { query },
      });

      if (error) {
        console.error('Spotify search error:', error);
        setSearchResults([]);
      } else {
        setSearchResults(data.tracks || []);
      }
    } catch (error) {
      console.error('Error calling spotify-search:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowResults(true);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchSpotify(query);
    }, 300);
  };

  const handleTrackSelect = (track: SpotifyTrack) => {
    setSelectedTrack(track);
    onChange(track.spotifyUrl);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleClearSelection = () => {
    setSelectedTrack(null);
    onChange('');
    setSearchQuery('');
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      
      {selectedTrack ? (
        // Show selected track
        <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
            {selectedTrack.albumArt ? (
              <img 
                src={selectedTrack.albumArt} 
                alt={`${selectedTrack.name} album art`}
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
              {selectedTrack.name}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {selectedTrack.artist}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Check size={16} className="text-green-600" />
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        // Show search input
        <div className="relative">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowResults(true)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (searchResults.length > 0 || isSearching) && (
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
                    onClick={() => handleTrackSelect(track)}
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
          )}
        </div>
      )}
    </div>
  );
};

export default SpotifySearchInput;
