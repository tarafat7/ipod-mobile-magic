
import { supabase } from '../integrations/supabase/client';
import { extractSpotifyTrackId, fetchSpotifyTrackInfo, formatDate } from '../utils/spotifyUtils';

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

export const useFriendOperations = (
  currentUser: any,
  setFriendsList: (friends: any[]) => void,
  setViewingFriendProfile: (profile: UserProfile | null) => void,
  setViewingFriendSongs: (songs: SpotifyTrackInfo[]) => void
) => {
  const loadFriendsList = async () => {
    if (!currentUser) return;
    
    try {
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('friend_user_id')
        .eq('user_id', currentUser.id);

      if (friendsError) {
        console.error('Error loading friends:', friendsError);
        return;
      }

      if (friendsData && friendsData.length > 0) {
        const friendIds = friendsData.map(f => f.friend_user_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .in('id', friendIds);

        if (profilesError) {
          console.error('Error loading friend profiles:', profilesError);
          return;
        }

        if (profilesData) {
          const friendsList = profilesData.map(profile => ({
            id: profile.id,
            full_name: profile.full_name || 'Unknown User',
            username: profile.username || ''
          }));
          setFriendsList(friendsList);
        }
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadFriendSongs = async (friendId: string, friendName: string) => {
    try {
      console.log('Loading songs for friend:', friendId, friendName);
      
      setViewingFriendProfile({ full_name: friendName });
      
      const { data, error } = await supabase
        .from('user_five_songs')
        .select('*')
        .eq('user_id', friendId)
        .maybeSingle();

      if (error) {
        console.error('Error loading friend songs:', error);
        setViewingFriendSongs([]);
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
          console.log('Loaded friend songs:', validSongs);
          setViewingFriendSongs(validSongs);
        } else {
          setViewingFriendSongs([]);
        }
      } else {
        setViewingFriendSongs([]);
      }
    } catch (error) {
      console.error('Error loading friend songs:', error);
      setViewingFriendSongs([]);
    }
  };

  return {
    loadFriendsList,
    loadFriendSongs
  };
};
