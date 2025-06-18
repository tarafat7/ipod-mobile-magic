
import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Music, ExternalLink } from 'lucide-react';

interface SpotifyTrackInfo {
  name: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
}

interface MyFiveFullViewProps {
  selectedSongIndex: number;
}

const MyFiveFullView: React.FC<MyFiveFullViewProps> = ({ selectedSongIndex }) => {
  const [songs, setSongs] = useState<SpotifyTrackInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMyFiveSongs();
  }, []);

  const extractSpotifyTrackId = (url: string): string | null => {
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const fetchSpotifyTrackInfo = async (trackId: string): Promise<SpotifyTrackInfo | null> => {
    try {
      const response = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/track/${trackId}`);
      const data = await response.json();
      
      if (data && data.title) {
        const titleParts = data.title.split(' by ');
        const songName = titleParts[0] || 'Unknown Song';
        const artistName = titleParts[1] || 'Unknown Artist';
        
        return {
          name: songName,
          artist: artistName,
          albumArt: data.thumbnail_url || '',
          spotifyUrl: `https://open.spotify.com/track/${trackId}`
        };
      }
    } catch (error) {
      console.error('Error fetching Spotify track info:', error);
    }
    return null;
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

        const songInfoPromises = songUrls.map(async (url) => {
          const trackId = extractSpotifyTrackId(url);
          if (trackId) {
            return await fetchSpotifyTrackInfo(trackId);
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
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <Music size={32} className="text-blue-600 mb-3 animate-pulse" />
        <p className="text-sm text-gray-600">Loading your five...</p>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <Music size={32} className="text-blue-600 mb-3" />
        <h3 className="font-bold text-lg mb-1">My Five</h3>
        <p className="text-sm text-gray-600 leading-tight">
          Add the 5 songs that are<br />
          on repeat for you right now
        </p>
      </div>
    );
  }

  return (
    <div className="h-full p-2 overflow-y-auto">
      <div className="text-center mb-3">
        <h3 className="font-bold text-lg mb-1">My Five</h3>
        <p className="text-xs text-gray-600">Click a song to open in Spotify</p>
      </div>
      <div className="space-y-1">
        {songs.map((song, index) => (
          <div 
            key={index} 
            className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
              selectedSongIndex === index 
                ? 'bg-blue-500 text-white' 
                : 'bg-white hover:bg-gray-100'
            }`}
            onClick={() => handleSongClick(song.spotifyUrl)}
          >
            <div className="w-10 h-10 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
              {song.albumArt ? (
                <img 
                  src={song.albumArt} 
                  alt={`${song.name} album art`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music size={16} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                selectedSongIndex === index ? 'text-white' : 'text-gray-900'
              }`}>
                {song.name}
              </p>
              <p className={`text-xs truncate ${
                selectedSongIndex === index ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {song.artist}
              </p>
            </div>
            <ExternalLink 
              size={14} 
              className={selectedSongIndex === index ? 'text-white' : 'text-gray-400'} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyFiveFullView;
