
import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Search, UserPlus, ArrowLeft, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
}

const SearchFriends: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [addedFriends, setAddedFriends] = useState<Set<string>>(new Set());
  const [addingFriend, setAddingFriend] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (!user) {
        window.location.href = '/signin';
      }
    };
    
    checkAuth();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', currentUser?.id)
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        return;
      }

      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    if (!currentUser) return;
    
    setAddingFriend(friendId);
    try {
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: currentUser.id,
          friend_user_id: friendId
        });

      if (error) {
        console.error('Error adding friend:', error);
        alert('Error adding friend. They may already be in your friends list.');
        return;
      }

      setAddedFriends(prev => new Set([...prev, friendId]));
      console.log('Friend added successfully!');
    } catch (error) {
      console.error('Error adding friend:', error);
    } finally {
      setAddingFriend(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <h1 className="text-xl font-bold">Search Friends</h1>
            <div className="w-12"></div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isLoading || !searchQuery.trim()}
                className="px-6"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            <div className="space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user.full_name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                    </div>
                    {addedFriends.has(user.id) ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check size={16} />
                        <span className="text-sm">Added</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleAddFriend(user.id)}
                        size="sm"
                        className="flex items-center gap-2"
                        disabled={addingFriend === user.id}
                      >
                        <UserPlus size={16} />
                        {addingFriend === user.id ? 'Adding...' : 'Add Friend'}
                      </Button>
                    )}
                  </div>
                ))
              ) : searchQuery && !isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  No users found matching "{searchQuery}"
                </div>
              ) : null}
            </div>

            {!searchQuery && (
              <div className="text-center py-8 text-gray-500">
                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Search for friends by their username</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFriends;
