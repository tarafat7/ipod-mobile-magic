
import React from 'react';
import Screen from './Screen';
import ClickWheel from './ClickWheel';
import IPodContainer from './iPodContainer';
import { useIPodState } from '../hooks/useIPodState';
import { useWheelNavigation } from '../hooks/useWheelNavigation';
import { useCenterButtonActions } from '../hooks/useCenterButtonActions';
import { useMenuButtonActions } from '../hooks/useMenuButtonActions';
import { useSharedViewState } from '../hooks/useSharedViewState';
import { useAuthAndData } from '../hooks/useAuthAndData';

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

  // Handle shared view state management
  useSharedViewState({
    sharedUserProfile,
    sharedUserSongs,
    isSharedView: state.isSharedView,
    setIsSharedView: state.setIsSharedView,
    setCurrentScreen: state.setCurrentScreen,
    setIsInMyFiveView: state.setIsInMyFiveView,
    setSelectedMenuItem: state.setSelectedMenuItem,
    setMyFiveSongsCount: state.setMyFiveSongsCount,
    setSelectedMyFiveSong: state.setSelectedMyFiveSong
  });

  // Handle authentication and data loading
  useAuthAndData({
    isSharedView: state.isSharedView,
    currentUser: state.currentUser,
    setCurrentUser: state.setCurrentUser,
    setMenuItems: state.setMenuItems,
    setMyFiveSongsCount: state.setMyFiveSongsCount
  });

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
    <IPodContainer>
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
    </IPodContainer>
  );
};

export default IPod;
