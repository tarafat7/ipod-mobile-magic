
import React, { useState, useEffect } from 'react';
import { Music } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { extractSpotifyTrackId, fetchSpotifyTrackInfo, formatDate } from '../utils/spotifyUtils';
import { SpotifyTrackInfo } from '../types/friends';

interface FriendsListPreviewProps {
  selectedFriend: any;
}

const FriendsListPreview: React.FC<FriendsListPreviewProps> = ({
  selectedFriend
}) => {
  const [friendSongs, setFriendSongs] = useState<SpotifyTrackInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedFriend) {
      loadFriendSongs();
    } else {
      setFriendSongs([]);
    }
  }, [selectedFriend]);

  const loadFriendSongs = async () => {
    if (!selectedFriend) return;
    
    setIsLoading(true);
    
    try {
      // Load friend's songs
      const { data, error } = await supabase
        .from('user_five_songs')
        .select('*')
        .eq('user_id', selectedFriend.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading friend songs:', error);
        setFriendSongs([]);
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
          setFriendSongs(validSongs);
        } else {
          setFriendSongs([]);
        }
      } else {
        setFriendSongs([]);
      }
    } catch (error) {
      console.error('Error loading friend songs:', error);
      setFriendSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedFriend) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <Music size={32} className="text-gray-600 mb-3" />
        <h3 className="font-bold text-lg mb-1">My Friends</h3>
        <p className="text-sm text-gray-600 text-center leading-tight">
          Browse your friends<br />
          and their music
        </p>
      </div>
    );
  }

  return (
    <div className="h-full p-4 overflow-y-auto">
      <div className="mb-4">
        <h3 className="font-bold text-lg mb-1">{selectedFriend.full_name}'s Five</h3>
        <p className="text-sm text-gray-600">@{selectedFriend.username}</p>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading songs...</p>
        </div>
      ) : friendSongs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Music size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm">{selectedFriend.full_name} hasn't added their five songs yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {friendSongs.map((song, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 bg-white rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => window.open(song.spotifyUrl, '_blank')}
            >
              <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
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
                <p className="font-medium text-sm text-gray-900 truncate">
                  {song.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {song.artist}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {song.addedDate}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsListPreview;
