
import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { ArrowLeft, Users, Music } from 'lucide-react';

interface Friend {
  id: string;
  full_name: string;
  username: string;
}

interface SpotifyTrackInfo {
  name: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
  addedDate: string;
}

const MyFriends: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedFriendSongs, setSelectedFriendSongs] = useState<SpotifyTrackInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (!user) {
        window.location.href = '/signin';
      } else {
        loadFriends();
      }
    };
    
    checkAuth();
  }, []);

  const loadFriends = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('friends')
        .select(`
          friend_user_id,
          profiles!friends_friend_user_id_fkey (
            id,
            full_name,
            username
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading friends:', error);
        return;
      }

      if (data) {
        const friendsList = data.map(item => ({
          id: item.friend_user_id,
          full_name: item.profiles?.full_name || 'Unknown User',
          username: item.profiles?.username || ''
        }));
        setFriends(friendsList);
        
        // Auto-select first friend if available
        if (friendsList.length > 0) {
          handleFriendSelect(friendsList[0]);
        }
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFriendSelect = async (friend: Friend) => {
    setSelectedFriend(friend);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your friends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <h1 className="text-xl font-bold">My Friends</h1>
            <div className="w-12"></div>
          </div>

          <div className="flex gap-6 h-96">
            {/* Friends List - Left Side */}
            <div className="w-1/2 border-r border-gray-200 pr-6">
              <h2 className="text-lg font-semibold mb-4">Friends</h2>
              {friends.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>You haven't added any friends yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedFriend?.id === friend.id
                          ? 'bg-blue-100 border border-blue-300'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => handleFriendSelect(friend)}
                    >
                      <h3 className="font-medium text-gray-900">
                        {friend.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">@{friend.username}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Friend's Songs Preview - Right Side */}
            <div className="w-1/2 pl-6">
              {selectedFriend ? (
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    {selectedFriend.full_name}'s Five
                  </h2>
                  {isLoadingSongs ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading songs...</p>
                    </div>
                  ) : selectedFriendSongs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Music size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>{selectedFriend.full_name} hasn't added their five songs yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {selectedFriendSongs.map((song, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
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
                                <Music size={20} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {song.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {song.artist}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Music size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Select a friend to see their songs</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyFriends;
