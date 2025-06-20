import React, { useState, useEffect } from 'react';
import Screen from './Screen';
import ClickWheel from './ClickWheel';
import { songs } from '../data/iPodData';
import { useIPodState } from '../hooks/useIPodState';
import { useIPodAuth } from '../hooks/useIPodAuth';
import { useIPodFriends } from '../hooks/useIPodFriends';
import { useIPodNavigation } from '../hooks/useIPodNavigation';
import { useDailyDropState } from '../hooks/useDailyDropState';

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
  const dailyDropState = useDailyDropState();
  
  const navigation = useIPodNavigation({
    ...state,
    currentUser,
    ...friends,
    sharedUserSongs,
    isInDailyDropView: dailyDropState.isInDailyDropView,
    setIsInDailyDropView: dailyDropState.setIsInDailyDropView,
    selectedDailyDropItem: dailyDropState.selectedDailyDropItem,
    setSelectedDailyDropItem: dailyDropState.setSelectedDailyDropItem,
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

  const handleWheelMove = (e: React.MouseEvent) => {
    const wheelElement = e.currentTarget as HTMLElement;
    const rect = wheelElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    
    const normalizedAngle = ((angle * 180) / Math.PI + 360) % 360;
    
    if (state.lastAngle !== null) {
      let angleDiff = normalizedAngle - state.lastAngle;
      
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
      
      const threshold = 25;
      if (Math.abs(angleDiff) < threshold) {
        return;
      }
      
      const isClockwise = angleDiff > 0;
      navigation.handleWheelNavigation(isClockwise);
    }
    
    state.setLastAngle(normalizedAngle);
  };

  const handleWheelLeave = () => {
    state.setLastAngle(null);
  };

  const handleBackClick = () => {
    console.log('Back button clicked - same as menu');
    navigation.handleMenuClick();
  };

  const handleForwardClick = () => {
    console.log('Forward button clicked - same as center');
    handleCenterClick();
  };

  const handleEditAccount = () => {
    window.location.href = '/signin?mode=edit';
  };

  const handleEditMyFive = () => {
    window.location.href = '/edit-my-five';
  };

  const handleCenterClick = async () => {
    console.log('Center button clicked!');
    
    if (state.currentScreen === 'menu') {
      if (state.isInMyFiveAuthView) {
        console.log('My Five Auth option selected:', state.selectedMyFiveAuthOption);
        if (state.selectedMyFiveAuthOption === 0) {
          window.open('/signin?mode=signin', '_blank');
        } else {
          window.open('/signin', '_blank');
        }
      } else if (state.isInMyFiveView) {
        console.log('My Five song selected:', state.selectedMyFiveSong);
        
        // Check if Edit My Five button is selected (index -1 or 0 when it's the first item)
        const hasEditButton = !state.isSharedView && friends.viewingFriendSongs.length === 0 && currentUser;
        
        if (hasEditButton && state.selectedMyFiveSong === 0 && state.myFiveSongsCount === 0) {
          // Edit My Five selected when no songs exist
          handleEditMyFive();
          return;
        } else if (hasEditButton && state.selectedMyFiveSong === 0) {
          // Edit My Five selected when songs exist
          handleEditMyFive();
          return;
        }
        
        // Adjust song index if Edit button exists
        const songIndex = hasEditButton ? state.selectedMyFiveSong - 1 : state.selectedMyFiveSong;
        
        let songToPlay = null;
        if (friends.viewingFriendSongs.length > 0) {
          songToPlay = friends.viewingFriendSongs[songIndex];
        } else if (state.isSharedView && sharedUserSongs[songIndex]) {
          songToPlay = sharedUserSongs[songIndex];
        }
        
        if (songToPlay) {
          window.open(songToPlay.spotifyUrl, '_blank');
        } else if (songIndex >= 0) {
          const event = new CustomEvent('myFiveSongSelect', { detail: { songIndex } });
          window.dispatchEvent(event);
        }
      } else if (dailyDropState.isInDailyDropView) {
        const dailyDropItems = ["Today's Prompt", 'Add a Song', 'View Today\'s Playlist'];
        const selectedDailyDropAction = dailyDropItems[dailyDropState.selectedDailyDropItem];
        console.log('Daily Drop action selected:', selectedDailyDropAction);
        
        switch (selectedDailyDropAction) {
          case "Today's Prompt":
            console.log('Today\'s Prompt selected');
            break;
          case 'Add a Song':
            console.log('Add a Song selected');
            break;
          case 'View Today\'s Playlist':
            console.log('View Today\'s Playlist selected');
            break;
          default:
            console.log('Daily Drop action not implemented:', selectedDailyDropAction);
            break;
        }
      } else if (state.isInFriendsListView) {
        const selectedFriend = friends.friendsList[state.selectedFriendsListItem];
        if (selectedFriend) {
          console.log('Loading friend\'s songs:', selectedFriend);
          friends.loadFriendSongs(selectedFriend.id, selectedFriend.full_name);
          state.setIsInMyFiveView(true);
          state.setSelectedMyFiveSong(0);
          state.setIsSharedView(false);
        }
      } else if (state.isInFriendsView) {
        const friendsItems = ['Add a friend', 'My Friends'];
        const selectedFriendsAction = friendsItems[state.selectedFriendsItem];
        console.log('Friends action selected:', selectedFriendsAction);
        
        switch (selectedFriendsAction) {
          case 'Add a friend':
            window.location.href = '/search-friends';
            break;
          case 'My Friends':
            state.setIsInFriendsListView(true);
            state.setSelectedFriendsListItem(0);
            friends.loadFriendsList(currentUser);
            break;
          default:
            console.log('Friends action not implemented:', selectedFriendsAction);
            break;
        }
      } else if (state.isInSettingsView) {
        const settingsItems = ['Edit Account', 'Privacy Policy', 'Product Feedback', 'Logout', 'Delete Account'];
        const selectedSettingsAction = settingsItems[state.selectedSettingsItem];
        console.log('Settings action selected:', selectedSettingsAction);
        
        switch (selectedSettingsAction) {
          case 'Edit Account':
            handleEditAccount();
            break;
          case 'Privacy Policy':
            console.log('Entering Privacy Policy view');
            state.setIsInPrivacyPolicyView(true);
            break;
          case 'Product Feedback':
            window.open('https://app.formbricks.com/s/cmc2iwfd7d33uu2017tjqmhji', '_blank');
            break;
          case 'Logout':
            await handleLogout();
            state.setIsInSettingsView(false);
            state.setSelectedSettingsItem(0);
            state.setCurrentScreen('menu');
            state.setSelectedMenuItem(0);
            break;
          case 'Delete Account':
            await handleDeleteAccount();
            state.setIsInSettingsView(false);
            state.setSelectedSettingsItem(0);
            state.setCurrentScreen('menu');
            state.setSelectedMenuItem(0);
            break;
          default:
            console.log('Settings action not implemented:', selectedSettingsAction);
            break;
        }
      } else {
        const selectedItem = state.menuItems[state.selectedMenuItem];
        if (selectedItem === 'The Daily Drop') {
          console.log('Entering Daily Drop view');
          dailyDropState.enterDailyDropView();
        } else if (selectedItem === 'Sign In') {
          console.log('Attempting to open sign-in page...');
          const newWindow = window.open('/signin?mode=signin', '_blank');
          console.log('Window opened:', newWindow);
        } else if (selectedItem === 'My Five') {
          console.log('Entering My Five view');
          
          // Check if user is signed in
          if (!currentUser) {
            console.log('User not signed in, showing auth options');
            state.setIsInMyFiveAuthView(true);
            state.setSelectedMyFiveAuthOption(0);
          } else {
            state.setIsSharedView(false);
            friends.setViewingFriendProfile(null);
            friends.setViewingFriendSongs([]);
            state.setIsInMyFiveView(true);
            state.setSelectedMyFiveSong(0);
          }
        } else if (selectedItem === 'Friends') {
          console.log('Entering Friends view');
          state.setIsInFriendsView(true);
          state.setSelectedFriendsItem(0);
        } else if (selectedItem === 'Share Profile') {
          handleShareProfile();
        } else if (selectedItem === 'Settings') {
          console.log('Entering settings view');
          state.setIsInSettingsView(true);
          state.setSelectedSettingsItem(0);
        } else if (selectedItem === 'About') {
          console.log('Entering About view');
          state.setIsInAboutView(true);
        } else {
          state.setIsPlaying(!state.isPlaying);
        }
      }
    } else if (state.currentScreen === 'music') {
      state.setIsPlaying(!state.isPlaying);
    }
  };

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
    dailyDropState.handleDailyDropItemChange(index);
  };

  const handleMyFiveAuthSignIn = () => {
    window.open('/signin?mode=signin', '_blank');
  };

  const handleMyFiveAuthSignUp = () => {
    window.open('/signin', '_blank');
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
            isInDailyDropView={dailyDropState.isInDailyDropView}
            selectedDailyDropItem={dailyDropState.selectedDailyDropItem}
            onDailyDropItemChange={handleDailyDropItemChange}
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
