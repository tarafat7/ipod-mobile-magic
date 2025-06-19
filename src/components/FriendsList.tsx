
import React from 'react';
import { Users } from 'lucide-react';
import { Friend } from '../types/friends';

interface FriendsListProps {
  friends: Friend[];
  selectedFriend: Friend | null;
  onFriendSelect: (friend: Friend) => void;
}

const FriendsList: React.FC<FriendsListProps> = ({ 
  friends, 
  selectedFriend, 
  onFriendSelect 
}) => {
  return (
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
              onClick={() => onFriendSelect(friend)}
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
  );
};

export default FriendsList;
