
import { useState, useEffect } from 'react';
import { getMenuItems } from '../data/iPodData';
import { supabase } from '../integrations/supabase/client';

interface UseIPodStateProps {
  isSharedView?: boolean;
  sharedUserSongs?: string[];
}

export const useIPodState = ({ isSharedView = false, sharedUserSongs = [] }: UseIPodStateProps = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [selectedMenuItem, setSelectedMenuItem] = useState(0);
  const [selectedSong, setSelectedSong] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [lastAngle, setLastAngle] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [isInSettingsView, setIsInSettingsView] = useState(false);
  const [selectedSettingsItem, setSelectedSettingsItem] = useState(0);
  const [isInMyFiveView, setIsInMyFiveView] = useState(isSharedView);
  const [selectedMyFiveSong, setSelectedMyFiveSong] = useState(0);
  const [myFiveSongsCount, setMyFiveSongsCount] = useState(0);

  useEffect(() => {
    const loadMenuItems = async () => {
      if (isSharedView) {
        setMenuItems(['My Five', 'Sign In']);
      } else {
        const items = await getMenuItems();
        setMenuItems(items);
      }
    };

    const loadMyFiveSongs = async () => {
      if (isSharedView) {
        setMyFiveSongsCount(sharedUserSongs.length);
      } else {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data, error } = await supabase
              .from('user_five_songs')
              .select('*')
              .eq('user_id', user.id)
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
          }
        } catch (error) {
          console.error('Error loading my five songs count:', error);
        }
      }
    };

    loadMenuItems();
    loadMyFiveSongs();

    if (!isSharedView) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        loadMenuItems();
        loadMyFiveSongs();
      });

      return () => subscription.unsubscribe();
    }
  }, [isSharedView, sharedUserSongs]);

  return {
    isPlaying,
    setIsPlaying,
    currentScreen,
    setCurrentScreen,
    selectedMenuItem,
    setSelectedMenuItem,
    selectedSong,
    setSelectedSong,
    currentTime,
    setCurrentTime,
    lastAngle,
    setLastAngle,
    menuItems,
    setMenuItems,
    isInSettingsView,
    setIsInSettingsView,
    selectedSettingsItem,
    setSelectedSettingsItem,
    isInMyFiveView,
    setIsInMyFiveView,
    selectedMyFiveSong,
    setSelectedMyFiveSong,
    myFiveSongsCount,
    setMyFiveSongsCount
  };
};
