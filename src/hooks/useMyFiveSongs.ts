
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { extractSpotifyTrackId, fetchSpotifyTrackInfo, formatDate } from '../utils/spotifyUtils';

interface SpotifyTrackInfo {
  name: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
  addedDate: string;
}

export const useMyFiveSongs = () => {
  const [songs, setSongs] = useState<SpotifyTrackInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedUserId, setLoadedUserId] = useState<string>('');

  const loadMyFiveSongs = useCallback(async () => {
    console.log('useMyFiveSongs: Starting loadMyFiveSongs');
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('useMyFiveSongs: Current user:', user?.id || 'No user');
      if (!user) {
        console.log('useMyFiveSongs: No user found, stopping load');
        setIsLoading(false);
        return;
      }

      // Prevent reloading if we already loaded for this user
      if (loadedUserId === user.id) {
        console.log('useMyFiveSongs: Already loaded for this user, stopping');
        setIsLoading(false);
        return;
      }

      console.log('useMyFiveSongs: Fetching songs from database for user:', user.id);
      const { data, error } = await supabase
        .from('user_five_songs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('useMyFiveSongs: Error loading songs:', error);
        setIsLoading(false);
        return;
      }

      console.log('useMyFiveSongs: Database response:', data);

      if (data) {
        const songUrls = [
          data.song_1,
          data.song_2,
          data.song_3,
          data.song_4,
          data.song_5
        ].filter(Boolean);

        console.log('useMyFiveSongs: Found song URLs:', songUrls);

        if (songUrls.length === 0) {
          console.log('useMyFiveSongs: No songs found, setting empty array');
          setSongs([]);
          setLoadedUserId(user.id);
          setIsLoading(false);
          return;
        }

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
        console.log('useMyFiveSongs: Processed valid songs:', validSongs);
        setSongs(validSongs);
        setLoadedUserId(user.id); // Remember that we loaded for this user
      } else {
        console.log('useMyFiveSongs: No data returned from database');
        setSongs([]);
        setLoadedUserId(user.id);
      }
    } catch (error) {
      console.error('useMyFiveSongs: Error loading user songs:', error);
    } finally {
      console.log('useMyFiveSongs: Finished loading, setting isLoading to false');
      setIsLoading(false);
    }
  }, [loadedUserId]);

  return {
    songs,
    setSongs,
    isLoading,
    setIsLoading,
    loadMyFiveSongs,
    setLoadedUserId
  };
};
