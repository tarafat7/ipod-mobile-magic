import React, { useEffect } from 'react';
import Screen from './Screen';
import ClickWheel from './ClickWheel';
import { getMenuItems } from '../data/iPodData';
import { supabase } from '../integrations/supabase/client';
import { useIPodState } from '../hooks/useIPodState';
import { useWheelNavigation } from '../hooks/useWheelNavigation';
import { useCenterButtonActions } from '../hooks/useCenterButtonActions';
import { useMenuButtonActions } from '../hooks/useMenuButtonActions';

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

interface IPodProps {
  sharedUserProfile?: UserProfile | null;
  sharedUserSongs?: SpotifyTrackInfo[];
}

const IPod: React.FC<IPodProps> = ({ 
  sharedUserProfile = null, 
  sharedUserSongs = [] 
}) => {
  const state = useIPodState();

  // Check authentication state and route context
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      state.setCurrentUser(user);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      state.setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle route-based shared view detection
  useEffect(() => {
    const currentPath = window.location.pathname;
    const isMyFiveRoute = currentPath.includes('/my-five/');
    
    if (isMyFiveRoute && sharedUserProfile) {
      // We're on a shared route with shared data
      state.setIsSharedView(true);
      state.setCurrentScreen('menu');
      state.setIsInMyFiveView(true);
      state.setSelectedMenuItem(0);
      state.setMyFiveSongsCount(sharedUserSongs.length);
    } else {
      // We're not on a shared route, reset shared view state
      state.setIsSharedView(false);
      state.setIsInMyFiveView(false);
      state.setSelectedMyFiveSong(0);
      // Reset to main menu when leaving shared view
      if (state.isSharedView) {
        state.setCurrentScreen('menu');
        state.setSelectedMenuItem(0);
      }
    }
  }, [sharedUserProfile, sharedUserSongs, window.location.pathname, state.isSharedView]);

  // Update songs count when shared songs change
  useEffect(() => {
    if (state.isSharedView && sharedUserSongs.length > 0) {
      state.setMyFiveSongsCount(sharedUserSongs.length);
    }
  }, [sharedUserSongs, state.isSharedView]);

  useEffect(() => {
    const loadMenuItems = async () => {
      const items = await getMenuItems();
      state.setMenuItems(items);
    };

    const loadMyFiveSongs = async () => {
      if (state.isSharedView || !state.currentUser) return;
      
      try {
        const { data, error } = await supabase
          .from('user_five_songs')
          .select('*')
          .eq('user_id', state.currentUser.id)
          .maybeSingle();

        if (data) {
          const songUrls = [
            data.song_1,
            data.song_2,
            data.song_3,
            data.song_4,
            data.song_5
          ].filter(Boolean);
          state.setMyFiveSongsCount(songUrls.length);
        }
      } catch (error) {
        console.error('Error loading my five songs count:', error);
      }
    };

    loadMenuItems();
    loadMyFiveSongs();
  }, [state.isSharedView, state.currentUser]);

  const wheelNavigation = useWheelNavigation({
    currentScreen: state.currentScreen,
    isInMyFiveView: state.isInMyFiveView,
    isInSettingsView: state.isInSettingsView,
    isSharedView: state.isSharedView,
    selectedMenuItem: state.selectedMenuItem,
    selectedSong: state.selectedSong,
    selectedSettingsItem: state.selectedSettingsItem,
    selectedMyFiveSong: state.selectedMyFiveSong,
    menuItems: state.menuItems,
    myFiveSongsCount: state.myFiveSongsCount,
    sharedUserSongs,
    setSelectedMenuItem: state.setSelectedMenuItem,
    setSelectedSong: state.setSelectedSong,
    setSelectedSettingsItem: state.setSelectedSettingsItem,
    setSelectedMyFiveSong: state.setSelectedMyFiveSong
  });

  const centerButtonActions = useCenterButtonActions({
    currentScreen: state.currentScreen,
    isInMyFiveView: state.isInMyFiveView,
    isInSettingsView: state.isInSettingsView,
    isSharedView: state.isSharedView,
    selectedMenuItem: state.selectedMenuItem,
    selectedSettingsItem: state.selectedSettingsItem,
    selectedMyFiveSong: state.selectedMyFiveSong,
    menuItems: state.menuItems,
    sharedUserSongs,
    isPlaying: state.isPlaying,
    setIsPlaying: state.setIsPlaying,
    setIsInMyFiveView: state.setIsInMyFiveView,
    setCurrentScreen: state.setCurrentScreen,
    setIsInSettingsView: state.setIsInSettingsView,
    setSelectedSettingsItem: state.setSelectedSettingsItem,
    setSelectedMyFiveSong: state.setSelectedMyFiveSong
  });

  const menuButtonActions = useMenuButtonActions({
    isInMyFiveView: state.isInMyFiveView,
    isInSettingsView: state.isInSettingsView,
    currentScreen: state.currentScreen,
    setIsInMyFiveView: state.setIsInMyFiveView,
    setSelectedMyFiveSong: state.setSelectedMyFiveSong,
    setIsInSettingsView: state.setIsInSettingsView,
    setSelectedSettingsItem: state.setSelectedSettingsItem,
    setCurrentScreen: state.setCurrentScreen,
    setSelectedMenuItem: state.setSelectedMenuItem
  });

  const handleSettingsItemChange = (index: number) => {
    state.setSelectedSettingsItem(index);
  };

  const handleMyFiveSongChange = (index: number) => {
    state.setSelectedMyFiveSong(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center md:p-4 overflow-hidden">
      <div className="relative w-full h-screen md:w-auto md:h-auto">
        <div className="bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 w-full h-full md:rounded-3xl md:p-6 shadow-2xl border border-gray-400 md:w-96 md:h-[680px] flex flex-col touch-none select-none">
          
          <Screen 
            currentScreen={state.currentScreen}
            selectedMenuItem={state.selectedMenuItem}
            selectedSong={state.selectedSong}
            isPlaying={state.isPlaying}
            currentTime={state.currentTime}
            selectedSettingsItem={state.selectedSettingsItem}
            isInSettingsView={state.isInSettingsView}
            onSettingsItemChange={handleSettingsItemChange}
            isInMyFiveView={state.isInMyFiveView}
            selectedMyFiveSong={state.selectedMyFiveSong}
            onMyFiveSongChange={handleMyFiveSongChange}
            isSharedView={state.isSharedView}
            sharedUserProfile={sharedUserProfile}
            sharedUserSongs={sharedUserSongs}
          />

          <div className="flex-1 flex items-center justify-center md:items-center" style={{ alignItems: 'center', paddingBottom: '2rem' }}>
            <ClickWheel 
              onWheelMove={wheelNavigation.handleWheelMove}
              onWheelLeave={wheelNavigation.handleWheelLeave}
              onCenterClick={centerButtonActions.handleCenterClick}
              onMenuClick={menuButtonActions.handleMenuClick}
            />
          </div>
        </div>

        <div className="absolute top-6 left-6 right-6 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-3xl pointer-events-none hidden md:block"></div>
      </div>
    </div>
  );
};

export default IPod;
