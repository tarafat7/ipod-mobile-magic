
import { useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { getMenuItems } from '../data/iPodData';

interface UseAuthAndDataProps {
  isSharedView: boolean;
  currentUser: any;
  setCurrentUser: (user: any) => void;
  setMenuItems: (items: string[]) => void;
  setMyFiveSongsCount: (count: number) => void;
}

export const useAuthAndData = ({
  isSharedView,
  currentUser,
  setCurrentUser,
  setMenuItems,
  setMyFiveSongsCount
}: UseAuthAndDataProps) => {
  // Check authentication state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load menu items and user data
  useEffect(() => {
    const loadMenuItems = async () => {
      const items = await getMenuItems();
      setMenuItems(items);
    };

    const loadMyFiveSongs = async () => {
      if (isSharedView || !currentUser) return;
      
      try {
        const { data, error } = await supabase
          .from('user_five_songs')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (data) {
          const songUrls = [
            data.song_1,
            data.song_2,
            data.song_3,
            data.song_4,
            data.song_5
          ].filter(Boolean);
          setMyFiveSongsCount(songUrls.length);
        }
      } catch (error) {
        console.error('Error loading my five songs count:', error);
      }
    };

    loadMenuItems();
    loadMyFiveSongs();
  }, [isSharedView, currentUser]);
};
