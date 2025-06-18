
import React from 'react';
import IPodBody from './IPodBody';
import { useIPodState } from '../hooks/useIPodState';
import { useIPodNavigation } from '../hooks/useIPodNavigation';
import { useIPodActions } from '../hooks/useIPodActions';

interface IPodProps {
  sharedUserProfile?: { full_name: string | null } | null;
  sharedUserSongs?: string[];
  isSharedView?: boolean;
}

const IPod: React.FC<IPodProps> = ({ 
  sharedUserProfile = null, 
  sharedUserSongs = [], 
  isSharedView = false 
}) => {
  const state = useIPodState({ isSharedView, sharedUserSongs });
  
  const navigation = useIPodNavigation({
    currentScreen: state.currentScreen,
    isInMyFiveView: state.isInMyFiveView,
    isInSettingsView: state.isInSettingsView,
    selectedMenuItem: state.selectedMenuItem,
    selectedSong: state.selectedSong,
    selectedSettingsItem: state.selectedSettingsItem,
    selectedMyFiveSong: state.selectedMyFiveSong,
    menuItems: state.menuItems,
    myFiveSongsCount: state.myFiveSongsCount,
    isSharedView,
    sharedUserSongs,
    setSelectedMenuItem: state.setSelectedMenuItem,
    setSelectedSong: state.setSelectedSong,
    setSelectedSettingsItem: state.setSelectedSettingsItem,
    setSelectedMyFiveSong: state.setSelectedMyFiveSong,
    setLastAngle: state.setLastAngle
  });

  const actions = useIPodActions({
    currentScreen: state.currentScreen,
    isInMyFiveView: state.isInMyFiveView,
    isInSettingsView: state.isInSettingsView,
    selectedMenuItem: state.selectedMenuItem,
    selectedSettingsItem: state.selectedSettingsItem,
    selectedMyFiveSong: state.selectedMyFiveSong,
    menuItems: state.menuItems,
    isPlaying: state.isPlaying,
    isSharedView,
    setIsPlaying: state.setIsPlaying,
    setCurrentScreen: state.setCurrentScreen,
    setIsInMyFiveView: state.setIsInMyFiveView,
    setSelectedMyFiveSong: state.setSelectedMyFiveSong,
    setIsInSettingsView: state.setIsInSettingsView,
    setSelectedSettingsItem: state.setSelectedSettingsItem,
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
        <IPodBody
          currentScreen={state.currentScreen}
          selectedMenuItem={state.selectedMenuItem}
          selectedSong={state.selectedSong}
          isPlaying={state.isPlaying}
          currentTime={state.currentTime}
          selectedSettingsItem={state.selectedSettingsItem}
          isInSettingsView={state.isInSettingsView}
          isInMyFiveView={state.isInMyFiveView}
          selectedMyFiveSong={state.selectedMyFiveSong}
          sharedUserProfile={sharedUserProfile}
          sharedUserSongs={sharedUserSongs}
          isSharedView={isSharedView}
          onWheelMove={navigation.handleWheelMove}
          onWheelLeave={navigation.handleWheelLeave}
          onCenterClick={actions.handleCenterClick}
          onMenuClick={actions.handleMenuClick}
          onSettingsItemChange={handleSettingsItemChange}
          onMyFiveSongChange={handleMyFiveSongChange}
        />

        <div className="absolute top-6 left-6 right-6 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-3xl pointer-events-none hidden md:block"></div>
      </div>
    </div>
  );
};

export default IPod;
