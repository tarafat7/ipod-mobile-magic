
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Friend, SpotifyTrackInfo } from '../types/friends';
import { searchSpotifyTracks } from '../utils/spotifySearch';
import { extractSpotifyTrackId, formatDate } from '../utils/spotifyUtils';

export const useFriendSongs = () => {
  const [selectedFriendSongs, setSelectedFriendSongs] = useState<SpotifyTrackInfo[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);

  const fetchSpotifyTrackInfo = async (trackId: string, addedDate: string): Promise<SpotifyTrackInfo | null> => {
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
  };

  const loadFriendSongs = async (friend: Friend) => {
    setIsLoadingSongs(true);
    
    try {
      // Load friend's songs
      const { data, error } = await supabase
        .from('user_five_songs')
        .select('*')
        .eq('user_id', friend.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading friend songs:', error);
        setSelectedFriendSongs([]);
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
          setSelectedFriendSongs(validSongs);
        } else {
          setSelectedFriendSongs([]);
        }
      } else {
        setSelectedFriendSongs([]);
      }
    } catch (error) {
      console.error('Error loading friend songs:', error);
      setSelectedFriendSongs([]);
    } finally {
      setIsLoadingSongs(false);
    }
  };

  return { selectedFriendSongs, isLoadingSongs, loadFriendSongs };
};
