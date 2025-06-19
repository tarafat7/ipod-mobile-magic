
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { SpotifyTrack } from '../types/spotify';
import { searchSpotifyTracks } from '../utils/spotifySearch';
import { extractSpotifyTrackId } from '../utils/spotifyUtils';
import SelectedTrackDisplay from './SelectedTrackDisplay';
import SearchResultsDropdown from './SearchResultsDropdown';

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
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Load selected track info when value changes
  useEffect(() => {
    const loadTrackFromUrl = async () => {
      if (value && !selectedTrack) {
        setIsLoadingTrack(true);
        try {
          const trackId = extractSpotifyTrackId(value);
          if (trackId) {
            // Use the Spotify API to get track info instead of oEmbed
            const tracks = await searchSpotifyTracks(`track:${trackId}`);
            const trackInfo = tracks.find(track => track.id === trackId);
            if (trackInfo) {
              setSelectedTrack(trackInfo);
            }
          }
        } catch (error) {
          console.error('Error loading track info:', error);
        } finally {
          setIsLoadingTrack(false);
        }
      } else if (!value && selectedTrack) {
        setSelectedTrack(null);
      }
    };

    loadTrackFromUrl();
  }, [value]);

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

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const tracks = await searchSpotifyTracks(query);
      setSearchResults(tracks);
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
      handleSearch(query);
    }, 300);
  };

  const handleTrackSelect = (track: SpotifyTrack) => {
    setSelectedTrack(track);
    onChange(track.spotifyUrl);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleRemoveSelection = () => {
    setSelectedTrack(null);
    onChange('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      
      {selectedTrack ? (
        <SelectedTrackDisplay 
          track={selectedTrack} 
          onRemove={handleRemoveSelection} 
        />
      ) : isLoadingTrack ? (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm text-gray-500">Loading track...</span>
        </div>
      ) : (
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

          {showResults && (searchResults.length > 0 || isSearching) && (
            <SearchResultsDropdown
              searchResults={searchResults}
              isSearching={isSearching}
              searchQuery={searchQuery}
              onTrackSelect={handleTrackSelect}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SpotifySearchInput;
