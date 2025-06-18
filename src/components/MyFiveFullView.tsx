import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Music, ExternalLink } from 'lucide-react';

interface SpotifyTrackInfo {
  name: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
  addedDate: string;
}

interface MyFiveFullViewProps {
  selectedSongIndex: number;
  isSharedView?: boolean;
  sharedUserProfile?: {full_name: string} | null;
  sharedUserSongs?: string[];
}

const MyFiveFullView: React.FC<MyFiveFullViewProps> = ({ 
  selectedSongIndex,
  isSharedView = false,
  sharedUserProfile = null,
  sharedUserSongs = []
}) => {
  const [songs, setSongs] = useState<SpotifyTrackInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSharedView && sharedUserSongs.length > 0) {
      // Use shared songs data instead of loading from database
      loadSharedSongsInfo();
    } else {
      loadMyFiveSongs();
    }
  }, [isSharedView, sharedUserSongs]);

  useEffect(() => {
    // Listen for song selection events from the center button
    const handleSongSelect = (event: CustomEvent) => {
      const { songIndex } = event.detail;
      if (songs[songIndex]) {
        handleSongClick(songs[songIndex].spotifyUrl);
      }
    };

    window.addEventListener('myFiveSongSelect', handleSongSelect as EventListener);
    
    return () => {
      window.removeEventListener('myFiveSongSelect', handleSongSelect as EventListener);
    };
  }, [songs]);

  const extractSpotifyTrackId = (url: string): string | null => {
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const fetchSpotifyTrackInfo = async (trackId: string, addedDate: string): Promise<SpotifyTrackInfo | null> => {
    try {
      const response = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/track/${trackId}`);
      const data = await response.json();
      
      if (data && data.title) {
        const titleParts = data.title.split(' by ');
        const songName = titleParts[0] || 'Unknown Song';
        const artistName = titleParts[1] || '';
        
        return {
          name: songName,
          artist: artistName,
          albumArt: data.thumbnail_url || '',
          spotifyUrl: `https://open.spotify.com/track/${trackId}`,
          addedDate
        };
      }
    } catch (error) {
      console.error('Error fetching Spotify track info:', error);
    }
    return null;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const loadSharedSongsInfo = async () => {
    setIsLoading(true);
    try {
      const addedDate = 'Recently added'; // Default date for shared view

      const songInfoPromises = sharedUserSongs.map(async (url) => {
        const trackId = extractSpotifyTrackId(url);
        if (trackId) {
          return await fetchSpotifyTrackInfo(trackId, addedDate);
        }
        return null;
      });

      const songInfos = await Promise.all(songInfoPromises);
      const validSongs = songInfos.filter((song): song is SpotifyTrackInfo => song !== null);
      setSongs(validSongs);
    } catch (error) {
      console.error('Error loading shared songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyFiveSongs = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_five_songs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading songs:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        const songUrls = [
          data.song_1,
          data.song_2,
          data.song_3,
          data.song_4,
          data.song_5
        ].filter(Boolean);

        const addedDate = formatDate(data.created_at);

        const songInfoPromises = songUrls.map(async (url) => {
          const trackId = extractSpotifyTrackId(url);
          if (trackId) {
            return await fetchSpotifyTrackInfo(trackId, addedDate);
          }
          return null;
        });

        const songInfos = await Promise.all(songInfoPromises);
        const validSongs = songInfos.filter((song): song is SpotifyTrackInfo => song !== null);
        setSongs(validSongs);
      }
    } catch (error) {
      console.error('Error loading user songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongClick = (spotifyUrl: string) => {
    window.open(spotifyUrl, '_blank');
  };

  if (isLoading) {
    const displayName = isSharedView && sharedUserProfile ? sharedUserProfile.full_name : 'your';
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <Music size={32} className="text-blue-600 mb-3 animate-pulse" />
        <p className="text-sm text-gray-600">Loading {displayName} five...</p>
      </div>
    );
  }

  if (songs.length === 0) {
    const displayName = isSharedView && sharedUserProfile ? sharedUserProfile.full_name : 'My';
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <Music size={32} className="text-blue-600 mb-3" />
        <h3 className="font-bold text-lg mb-1">{displayName} Five</h3>
        <p className="text-sm text-gray-600 leading-tight">
          {isSharedView ? 'No songs shared yet' : 'Add the 5 songs that are on repeat for you right now'}
        </p>
      </div>
    );
  }

  const displayName = isSharedView && sharedUserProfile ? `${sharedUserProfile.full_name}'s` : 'My';

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="p-2">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold">{displayName} Five</span>
          <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
        </div>
      </div>

      {/* Song List */}
      <div className="bg-white px-2">
        {songs.map((song, index) => (
          <div 
            key={index} 
            className={`flex items-center p-2 border-b border-gray-200 transition-colors ${
              selectedSongIndex === index 
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
                selectedSongIndex === index ? 'text-white' : 'text-black'
              }`}>
                {song.name}
              </h3>
              <p className={`text-sm truncate ${
                selectedSongIndex === index ? 'text-blue-100' : 'text-gray-600'
              }`}>
                {song.artist || song.addedDate}
              </p>
            </div>
            {selectedSongIndex === index && (
              <div className="text-white text-xl">▶</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyFiveFullView;
