
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Friend } from '../types/friends';

export const useFriends = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

      // First get the friend IDs
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('friend_user_id')
        .eq('user_id', user.id);

      if (friendsError) {
        console.error('Error loading friends:', friendsError);
        return;
      }

      if (friendsData && friendsData.length > 0) {
        const friendIds = friendsData.map(f => f.friend_user_id);
        
        // Then get the profile information for those friends
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
          setFriends(friendsList);
        }
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { friends, isLoading, currentUser };
};
