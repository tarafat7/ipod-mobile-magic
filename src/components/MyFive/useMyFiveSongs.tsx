
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';

interface SpotifyTrackInfo {
  name: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
  addedDate: string;
}

interface UserProfile {
  full_name: string;
}

interface UseMyFiveSongsProps {
  isSharedView?: boolean;
  sharedUserProfile?: UserProfile | null;
  sharedUserSongs?: SpotifyTrackInfo[];
  viewingFriendProfile?: UserProfile | null;
}

export const useMyFiveSongs = ({
  isSharedView = false,
  sharedUserProfile = null,
  sharedUserSongs = [],
  viewingFriendProfile = null
}: UseMyFiveSongsProps) => {
  const [songs, setSongs] = useState<SpotifyTrackInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const extractSpotifyTrackId = useCallback((url: string): string | null => {
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }, []);

  const fetchSpotifyTrackInfo = useCallback(async (trackId: string, addedDate: string): Promise<SpotifyTrackInfo | null> => {
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
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, []);

  const loadUserSongs = useCallback(async () => {
    // Don't load user's own songs when viewing others
    if (viewingFriendProfile || (isSharedView && sharedUserProfile)) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_five_songs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !data) return;

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
    } catch (error) {
      console.error('Error loading user songs:', error);
    }
  }, [viewingFriendProfile, isSharedView, sharedUserProfile, extractSpotifyTrackId, fetchSpotifyTrackInfo, formatDate]);

  useEffect(() => {
    setIsLoading(true);
    
    if (viewingFriendProfile || (isSharedView && sharedUserProfile)) {
      // Use provided shared songs
      setSongs([...sharedUserSongs]);
      setIsLoading(false);
    } else {
      // Load user's own songs
      loadUserSongs().finally(() => setIsLoading(false));
    }
  }, [viewingFriendProfile, isSharedView, sharedUserProfile, sharedUserSongs, loadUserSongs]);

  return { songs, isLoading };
};
