import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { searchSpotifyTracks } from '../utils/spotifySearch';
import { extractSpotifyTrackId, formatDate } from '../utils/spotifyUtils';
import { Music, ExternalLink, Edit } from 'lucide-react';

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
  sharedUserSongs?: SpotifyTrackInfo[];
}

const MyFiveFullView: React.FC<MyFiveFullViewProps> = ({ 
  selectedSongIndex,
  isSharedView = false,
  sharedUserProfile = null,
  sharedUserSongs = []
}) => {
  const [songs, setSongs] = useState<SpotifyTrackInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedUserId, setLoadedUserId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchSpotifyTrackInfo = useCallback(async (trackId: string, addedDate: string): Promise<SpotifyTrackInfo | null> => {
    try {
      const tracks = await searchSpotifyTracks(`track:${trackId}`);
      const trackInfo = tracks.find(track => track.id === trackId);
      
      if (trackInfo) {
        return {
          name: trackInfo.name,
          artist: trackInfo.artist,
          albumArt: trackInfo.albumArt,
          spotifyUrl: trackInfo.spotifyUrl,
          addedDate
        };
      }
    } catch (error) {
      console.error('Error fetching Spotify track info:', error);
    }
    return null;
  }, []);

  const loadMyFiveSongs = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Prevent reloading if we already loaded for this user
      if (loadedUserId === user.id) {
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
        setLoadedUserId(user.id); // Remember that we loaded for this user
      }
    } catch (error) {
      console.error('Error loading user songs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchSpotifyTrackInfo, loadedUserId]);

  // Handle initial load - only load personal songs if NOT in shared view
  useEffect(() => {
    console.log('MyFiveFullView effect triggered:', { 
      isSharedView, 
      sharedSongsLength: sharedUserSongs.length,
      sharedProfile: sharedUserProfile?.full_name
    });

    if (isSharedView) {
      // For shared views, NEVER load personal songs - only use shared data
      console.log('Shared view detected - using shared songs only');
      setSongs(sharedUserSongs);
      setIsLoading(false);
      setLoadedUserId('shared');
    } else {
      // Only load personal songs when NOT in shared view
      console.log('Personal view - loading own songs');
      loadMyFiveSongs();
    }
  }, [isSharedView, sharedUserProfile, loadMyFiveSongs]);

  // Update shared songs when they change
  useEffect(() => {
    if (isSharedView) {
      console.log('Updating shared songs:', sharedUserSongs);
      setSongs(sharedUserSongs);
      setIsLoading(false);
    }
  }, [sharedUserSongs, isSharedView]);

  // Separate effect to handle shared songs updates without triggering reload
  useEffect(() => {
    if (isSharedView && sharedUserSongs.length > 0) {
      console.log('Updating shared songs without reload:', sharedUserSongs);
      setSongs(sharedUserSongs);
      setIsLoading(false);
    }
  }, [sharedUserSongs]);

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

  const handleEditMyFive = () => {
    window.location.href = '/edit-my-five';
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

  const displayName = isSharedView && sharedUserProfile ? `${sharedUserProfile.full_name}'s` : 'My';
  const showEditButton = !isSharedView && currentUser;

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="p-2">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="font-bold">{displayName} Five</span>
          <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
        </div>
      </div>

      {/* Edit My Five Button - only show for signed-in users viewing their own five */}
      {showEditButton && (
        <div className="px-2 mb-2">
          <button
            onClick={handleEditMyFive}
            className={`w-full flex items-center justify-between p-1.5 border-b border-gray-200 transition-colors ${
              selectedSongIndex === 0 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-50 hover:bg-gray-100 text-black'
            }`}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded flex-shrink-0 overflow-hidden mr-2 flex items-center justify-center">
                <Edit size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm ${
                  selectedSongIndex === 0 ? 'text-white' : 'text-black'
                }`}>
                  Edit My Five
                </h3>
                <p className={`text-xs ${
                  selectedSongIndex === 0 ? 'text-blue-100' : 'text-gray-600'
                }`}>
                  Add or change your songs
                </p>
              </div>
            </div>
            {selectedSongIndex === 0 && (
              <div className="text-white text-sm">▶</div>
            )}
          </button>
        </div>
      )}

      {/* Song List or Empty State */}
      <div className="bg-white px-2">
        {songs.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-center">
            <Music size={24} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 leading-tight">
              {isSharedView ? 'No songs shared yet' : 'Add the 5 songs that are on repeat for you right now'}
            </p>
          </div>
        ) : (
          songs.map((song, index) => {
            // Adjust the comparison index to account for Edit button
            const adjustedIndex = showEditButton ? index + 1 : index;
            return (
              <div 
                key={`${isSharedView ? 'shared' : 'own'}-${index}-${song.name}`}
                className={`flex items-center p-1.5 border-b border-gray-200 transition-colors ${
                  selectedSongIndex === adjustedIndex 
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
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music size={14} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-sm truncate ${
                    selectedSongIndex === adjustedIndex ? 'text-white' : 'text-black'
                  }`}>
                    {song.name}
                  </h3>
                  <p className={`text-xs truncate ${
                    selectedSongIndex === adjustedIndex ? 'text-blue-100' : 'text-gray-600'
                  }`}>
                    {song.artist}
                  </p>
                </div>
                {selectedSongIndex === adjustedIndex && (
                  <div className="text-white text-sm">▶</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyFiveFullView;
