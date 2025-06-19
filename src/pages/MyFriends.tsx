
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useFriends } from '../hooks/useFriends';
import { useFriendSongs } from '../hooks/useFriendSongs';
import { Friend } from '../types/friends';
import FriendsList from '../components/FriendsList';
import FriendSongsPreview from '../components/FriendSongsPreview';

const MyFriends: React.FC = () => {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const { friends, isLoading } = useFriends();
  const { selectedFriendSongs, isLoadingSongs, loadFriendSongs } = useFriendSongs();

  const handleFriendSelect = async (friend: Friend) => {
    setSelectedFriend(friend);
    await loadFriendSongs(friend);
  };

  // Auto-select first friend when friends are loaded
  React.useEffect(() => {
    if (friends.length > 0 && !selectedFriend) {
      handleFriendSelect(friends[0]);
    }
  }, [friends, selectedFriend]);

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
            <FriendsList 
              friends={friends}
              selectedFriend={selectedFriend}
              onFriendSelect={handleFriendSelect}
            />
            <FriendSongsPreview 
              selectedFriend={selectedFriend}
              selectedFriendSongs={selectedFriendSongs}
              isLoadingSongs={isLoadingSongs}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyFriends;
