
import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Music, Plus } from 'lucide-react';

interface SpotifyTrackInfo {
  name: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
  addedDate: string;
}

interface UserProfile {
  full_name: string | null;
}

interface MyFiveFullViewProps {
  selectedSongIndex: number;
  isSharedView?: boolean;
  sharedUserProfile?: UserProfile | null;
  sharedUserSongs?: SpotifyTrackInfo[];
}

const MyFiveFullView: React.FC<MyFiveFullViewProps> = ({
  selectedSongIndex,
  isSharedView = false,
  sharedUserProfile = null,
  sharedUserSongs = []
}) => {
  const [songs, setSongs] = useState<SpotifyTrackInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Only load personal songs if NOT in shared view
  useEffect(() => {
    if (!isSharedView && currentUser) {
      loadMySongs();
    }
  }, [currentUser, isSharedView]);

  // Use shared songs when in shared view
  useEffect(() => {
    if (isSharedView && sharedUserSongs) {
      setSongs(sharedUserSongs);
    }
  }, [isSharedView, sharedUserSongs]);

  const loadMySongs = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_five_songs')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading songs:', error);
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

        if (songUrls.length > 0) {
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
        } else {
          setSongs([]);
        }
      } else {
        setSongs([]);
      }
    } catch (error) {
      console.error('Error loading my five songs:', error);
      setSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const getUserDisplayName = () => {
    if (isSharedView && sharedUserProfile) {
      return sharedUserProfile.full_name || 'Unknown User';
    }
    return currentUser?.user_metadata?.full_name || 'Your';
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show "Add songs" option when no songs exist and not in shared view
  if (songs.length === 0 && !isSharedView) {
    return (
      <div className="h-full bg-white">
        <div className="p-4 h-full flex flex-col">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold">My Five</h2>
            <p className="text-sm text-gray-600">No songs added yet</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <div 
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedSongIndex === 0 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <Plus size={32} className={selectedSongIndex === 0 ? 'text-white' : 'text-gray-400'} />
                <span className="text-sm font-medium">Add songs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="h-full bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <Music size={32} className="text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">{getUserDisplayName()} hasn't added any songs yet</p>
        </div>
      </div>
    );
  }

  const currentSong = songs[selectedSongIndex];

  if (!currentSong) {
    return (
      <div className="h-full bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <Music size={32} className="text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Song not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      <div className="p-4 h-full flex flex-col">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">{getUserDisplayName()} Five</h2>
          <p className="text-xs text-gray-500">Added {currentSong.addedDate}</p>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden shadow-lg">
            {currentSong.albumArt ? (
              <img 
                src={currentSong.albumArt} 
                alt={`${currentSong.name} album art`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <Music size={24} className="text-gray-500" />
              </div>
            )}
          </div>
          
          <div className="text-center max-w-full">
            <h3 className="font-bold text-sm mb-1 truncate">{currentSong.name}</h3>
            <p className="text-xs text-gray-600 truncate">{currentSong.artist}</p>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            {selectedSongIndex + 1} of {songs.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyFiveFullView;
