
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Music } from 'lucide-react';

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

const MyFive: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [songs, setSongs] = useState<SpotifyTrackInfo[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSongIndex, setSelectedSongIndex] = useState(0);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
      loadUserSongs();
    }
  }, [userId]);

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

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadUserSongs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_five_songs')
        .select('*')
        .eq('user_id', userId)
        .single();

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

  const displayName = profile?.full_name || 'Someone';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 rounded-3xl p-6 shadow-2xl border border-gray-400 w-96 h-[680px] flex flex-col">
          <div className="bg-gray-900 rounded-xl p-2 mb-6 shadow-inner flex-1">
            <div className="bg-gray-100 rounded-lg h-full border border-gray-300 overflow-hidden flex flex-col items-center justify-center">
              <Music size={32} className="text-blue-600 mb-3 animate-pulse" />
              <p className="text-sm text-gray-600">Loading {displayName}'s Five...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 rounded-3xl p-6 shadow-2xl border border-gray-400 w-96 h-[680px] flex flex-col">
        <div className="bg-gray-900 rounded-xl p-2 mb-6 shadow-inner flex-1">
          <div className="bg-gray-100 rounded-lg h-full border border-gray-300 overflow-hidden">
            {songs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <Music size={32} className="text-blue-600 mb-3" />
                <h3 className="font-bold text-lg mb-1">{displayName}'s Five</h3>
                <p className="text-sm text-gray-600 leading-tight">
                  No songs shared yet
                </p>
              </div>
            ) : (
              <div className="h-full bg-white">
                {/* Header */}
                <div className="p-2">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-bold">{displayName}'s Five</span>
                    <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
                  </div>
                </div>

                {/* Song List */}
                <div className="bg-white px-2">
                  {songs.map((song, index) => (
                    <div 
                      key={index} 
                      className="flex items-center p-2 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleSongClick(song.spotifyUrl)}
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
                        <h3 className="font-semibold text-base truncate text-black">
                          {song.name}
                        </h3>
                        <p className="text-sm truncate text-gray-600">
                          {song.artist || song.addedDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyFive;
