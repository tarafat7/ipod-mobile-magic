import React, { useState, useEffect } from 'react';
import Screen from './Screen';
import ClickWheel from './ClickWheel';
import { songs } from '../data/iPodData';
import { useIPodState } from '../hooks/useIPodState';
import { useIPodAuth } from '../hooks/useIPodAuth';
import { useIPodFriends } from '../hooks/useIPodFriends';
import { useIPodNavigation } from '../hooks/useIPodNavigation';
import { useIPodEvents } from '../hooks/useIPodEvents';
import { useIPodClickHandlers } from '../hooks/useIPodClickHandlers';
import { useIPodWheelHandlers } from '../hooks/useIPodWheelHandlers';

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
  const { currentUser, handleLogout, handleDeleteAccount, handleShareProfile } = useIPodAuth();
  const friends = useIPodFriends();
  
  const navigation = useIPodNavigation({
    ...state,
    currentUser,
    ...friends,
    sharedUserSongs,
  });

  // Handle route-based shared view detection
  useEffect(() => {
    const currentPath = window.location.pathname;
    const isMyFiveRoute = currentPath.includes('/my-five/');
    const isFriendsRoute = currentPath.includes('/friends/');
    const isDailyDropRoute = currentPath.includes('/daily-drop/');
    
    console.log('Route check:', { currentPath, isMyFiveRoute, isFriendsRoute, isDailyDropRoute, hasProfile: !!sharedUserProfile, songsCount: sharedUserSongs.length });
    
    if (isMyFiveRoute && sharedUserProfile) {
      console.log('Setting up shared view');
      state.setIsSharedView(true);
      state.setCurrentScreen('menu');
      state.setIsInMyFiveView(true);
      state.setSelectedMenuItem(0);
      state.setMyFiveSongsCount(sharedUserSongs.length);
    } else if (isFriendsRoute) {
      console.log('Setting up friends view');
      state.setIsSharedView(false);
      state.setIsInFriendsView(true);
      state.setSelectedFriendsItem(0);
    } else if (isDailyDropRoute) {
      console.log('Setting up daily drop view');
      state.setIsSharedView(false);
      state.setIsInDailyDropView(true);
      state.setSelectedDailyDropItem(0);
    } else {
      state.setIsSharedView(false);
    }
  }, [sharedUserProfile, sharedUserSongs, window.location.pathname]);

  // Update songs count when shared songs change
  useEffect(() => {
    if (state.isSharedView && sharedUserSongs.length > 0) {
      console.log('Updating shared songs count:', sharedUserSongs.length);
      state.setMyFiveSongsCount(sharedUserSongs.length);
    }
  }, [sharedUserSongs, state.isSharedView]);

  const handleEditAccount = () => {
    window.location.href = '/signin?mode=edit';
  };

  const handleEditMyFive = () => {
    window.location.href = '/edit-my-five';
  };

  const { handleSongPlay } = useIPodEvents({
    currentUser,
    myFiveSongsCount: state.myFiveSongsCount,
    setMyFiveSongsCount: state.setMyFiveSongsCount,
    selectedMyFiveSong: state.selectedMyFiveSong,
    isSharedView: state.isSharedView,
    sharedUserSongs,
    viewingFriendSongs: friends.viewingFriendSongs,
    handleEditMyFive
  });

  const { handleCenterClick, handleBackClick, handleForwardClick } = useIPodClickHandlers({
    currentUser,
    state,
    friends,
    navigation,
    handleEditAccount,
    handleEditMyFive,
    handleLogout,
    handleDeleteAccount,
    handleShareProfile,
    handleSongPlay,
    sharedUserSongs
  });

  const { handleWheelMove, handleWheelLeave } = useIPodWheelHandlers({ navigation });

  const handleSettingsItemChange = (index: number) => {
    state.setSelectedSettingsItem(index);
  };

  const handleMyFiveSongChange = (index: number) => {
    state.setSelectedMyFiveSong(index);
  };

  const handleFriendsItemChange = (index: number) => {
    state.setSelectedFriendsItem(index);
  };

  const handleFriendsListItemChange = (index: number) => {
    state.setSelectedFriendsListItem(index);
  };

  const handleDailyDropItemChange = (index: number) => {
    state.setSelectedDailyDropItem(index);
  };

  const handleMyFiveAuthSignIn = () => {
    window.open('/signin?mode=signin', '_blank');
  };

  const handleMyFiveAuthSignUp = () => {
    window.open('/signin', '_blank');
  };

  const handleDailyDropEnter = () => {
    console.log('Daily Drop enter triggered');
    state.setIsInDailyDropView(true);
    state.setSelectedDailyDropItem(0);
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
            isSharedView={state.isSharedView || friends.viewingFriendSongs.length > 0}
            sharedUserProfile={friends.viewingFriendProfile || sharedUserProfile}
            sharedUserSongs={friends.viewingFriendSongs.length > 0 ? friends.viewingFriendSongs : sharedUserSongs}
            isInFriendsView={state.isInFriendsView}
            selectedFriendsItem={state.selectedFriendsItem}
            onFriendsItemChange={handleFriendsItemChange}
            isInFriendsListView={state.isInFriendsListView}
            selectedFriendsListItem={state.selectedFriendsListItem}
            onFriendsListItemChange={handleFriendsListItemChange}
            friendsList={friends.friendsList}
            isInAboutView={state.isInAboutView}
            isInPrivacyPolicyView={state.isInPrivacyPolicyView}
            isInMyFiveAuthView={state.isInMyFiveAuthView}
            selectedMyFiveAuthOption={state.selectedMyFiveAuthOption}
            onMyFiveAuthSignIn={handleMyFiveAuthSignIn}
            onMyFiveAuthSignUp={handleMyFiveAuthSignUp}
            isInDailyDropView={state.isInDailyDropView}
            selectedDailyDropItem={state.selectedDailyDropItem}
            onDailyDropItemChange={handleDailyDropItemChange}
            onDailyDropEnter={handleDailyDropEnter}
          />

          <div className="flex-1 flex items-center justify-center md:items-center" style={{ alignItems: 'center', paddingBottom: '2rem' }}>
            <ClickWheel 
              onWheelMove={handleWheelMove}
              onWheelLeave={handleWheelLeave}
              onCenterClick={handleCenterClick}
              onMenuClick={navigation.handleMenuClick}
              onBackClick={handleBackClick}
              onForwardClick={handleForwardClick}
            />
          </div>
        </div>

        <div className="absolute top-6 left-6 right-6 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-3xl pointer-events-none hidden md:block"></div>
      </div>
    </div>
  );
};

export default IPod;
