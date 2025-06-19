
import React from 'react';
import Screen from './Screen';
import ClickWheel from './ClickWheel';
import { useIPodState } from '../hooks/useIPodState';
import { useIPodNavigation } from '../hooks/useIPodNavigation';
import { useIPodActions } from '../hooks/useIPodActions';
import { useFriendOperations } from '../hooks/useFriendOperations';

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
  const state = useIPodState(sharedUserProfile, sharedUserSongs);
  
  const { loadFriendsList, loadFriendSongs } = useFriendOperations(
    state.currentUser,
    state.setFriendsList,
    state.setViewingFriendProfile,
    state.setViewingFriendSongs
  );

  const { handleWheelMove } = useIPodNavigation(
    {
      currentScreen: state.currentScreen,
      isInMyFiveView: state.isInMyFiveView,
      isInFriendsListView: state.isInFriendsListView,
      isInFriendsView: state.isInFriendsView,
      isInSettingsView: state.isInSettingsView,
      isSharedView: state.isSharedView,
      viewingFriendSongs: state.viewingFriendSongs,
      sharedUserSongs: sharedUserSongs,
      myFiveSongsCount: state.myFiveSongsCount,
      friendsList: state.friendsList,
      selectedMyFiveSong: state.selectedMyFiveSong,
      selectedFriendsListItem: state.selectedFriendsListItem,
      selectedFriendsItem: state.selectedFriendsItem,
      selectedSettingsItem: state.selectedSettingsItem,
      selectedMenuItem: state.selectedMenuItem,
      selectedSong: state.selectedSong,
      menuItems: state.menuItems
    },
    {
      setSelectedMyFiveSong: state.setSelectedMyFiveSong,
      setSelectedFriendsListItem: state.setSelectedFriendsListItem,
      setSelectedFriendsItem: state.setSelectedFriendsItem,
      setSelectedSettingsItem: state.setSelectedSettingsItem,
      setSelectedMenuItem: state.setSelectedMenuItem,
      setSelectedSong: state.setSelectedSong
    }
  );

  const { 
    handleShareProfile, 
    handleLogout, 
    handleDeleteAccount, 
    handleEditAccount, 
    handleEditMyFive,
    handleSongPlay
  } = useIPodActions();

  const handleWheelMoveWrapper = (e: React.MouseEvent) => {
    handleWheelMove(e, state.lastAngle, state.setLastAngle);
  };

  const handleWheelLeave = () => {
    state.setLastAngle(null);
  };

  const handleCenterClick = () => {
    console.log('Center button clicked!');
    console.log('Current screen:', state.currentScreen);
    console.log('Selected menu item:', state.selectedMenuItem);
    console.log('Selected menu item name:', state.menuItems[state.selectedMenuItem]);
    console.log('Is in settings view:', state.isInSettingsView);
    console.log('Is in My Five view:', state.isInMyFiveView);
    console.log('Is in Friends view:', state.isInFriendsView);
    console.log('Is in Friends List view:', state.isInFriendsListView);
    console.log('Is shared view:', state.isSharedView);
    
    if (state.currentScreen === 'menu') {
      if (state.isInMyFiveView) {
        console.log('My Five song selected:', state.selectedMyFiveSong);
        handleSongPlay(
          state.selectedMyFiveSong,
          state.viewingFriendSongs,
          sharedUserSongs,
          state.isSharedView
        );
      } else if (state.isInFriendsListView) {
        const selectedFriend = state.friendsList[state.selectedFriendsListItem];
        if (selectedFriend) {
          console.log('Loading friend\'s songs:', selectedFriend);
          loadFriendSongs(selectedFriend.id, selectedFriend.full_name);
          state.setIsInMyFiveView(true);
          state.setSelectedMyFiveSong(0);
          state.setIsSharedView(false);
        }
      } else if (state.isInFriendsView) {
        const friendsItems = ['Add a friend', 'My Friends'];
        const selectedFriendsAction = friendsItems[state.selectedFriendsItem];
        
        switch (selectedFriendsAction) {
          case 'Add a friend':
            window.location.href = '/search-friends';
            break;
          case 'My Friends':
            state.setIsInFriendsListView(true);
            state.setSelectedFriendsListItem(0);
            loadFriendsList();
            break;
        }
      } else if (state.isInSettingsView) {
        const settingsItems = ['Share Profile', 'Edit Account', 'Edit My Five', 'Product Feedback', 'Logout', 'Delete Account'];
        const selectedSettingsAction = settingsItems[state.selectedSettingsItem];
        
        const resetFunctions = [
          () => state.setIsInSettingsView(false),
          () => state.setSelectedSettingsItem(0),
          () => state.setCurrentScreen('menu'),
          () => state.setSelectedMenuItem(0)
        ];
        
        switch (selectedSettingsAction) {
          case 'Share Profile':
            handleShareProfile();
            break;
          case 'Edit Account':
            handleEditAccount();
            break;
          case 'Edit My Five':
            handleEditMyFive();
            break;
          case 'Product Feedback':
            window.open('https://app.formbricks.com/s/cmc2iwfd7d33uu2017tjqmhji', '_blank');
            break;
          case 'Logout':
            handleLogout(resetFunctions);
            break;
          case 'Delete Account':
            handleDeleteAccount(resetFunctions);
            break;
        }
      } else {
        const selectedItem = state.menuItems[state.selectedMenuItem];
        if (selectedItem === 'Sign In') {
          console.log('Attempting to open sign-in page...');
          const newWindow = window.open('/signin', '_blank');
          console.log('Window opened:', newWindow);
        } else if (selectedItem === 'My Five') {
          console.log('Entering My Five view');
          state.setIsSharedView(false);
          state.setViewingFriendProfile(null);
          state.setViewingFriendSongs([]);
          state.setIsInMyFiveView(true);
          state.setSelectedMyFiveSong(0);
        } else if (selectedItem === 'Friends') {
          console.log('Entering Friends view');
          state.setIsInFriendsView(true);
          state.setSelectedFriendsItem(0);
        } else if (selectedItem === 'Settings') {
          console.log('Entering settings view');
          state.setIsInSettingsView(true);
          state.setSelectedSettingsItem(0);
        } else {
          state.setIsPlaying(!state.isPlaying);
        }
      }
    } else if (state.currentScreen === 'music') {
      state.setIsPlaying(!state.isPlaying);
    }
  };

  const handleMenuClick = () => {
    console.log('Menu button clicked');
    console.log('Current state - Screen:', state.currentScreen, 'InSettings:', state.isInSettingsView, 'InMyFive:', state.isInMyFiveView, 'InFriends:', state.isInFriendsView, 'InFriendsList:', state.isInFriendsListView, 'IsShared:', state.isSharedView, 'ViewingFriend:', !!state.viewingFriendProfile);
    
    if (state.isInFriendsListView) {
      console.log('Exiting Friends List view');
      state.setIsInFriendsListView(false);
      state.setSelectedFriendsListItem(0);
    } else if (state.isInFriendsView) {
      console.log('Exiting Friends view');
      state.setIsInFriendsView(false);
      state.setSelectedFriendsItem(0);
    } else if (state.isInMyFiveView) {
      console.log('Exiting My Five view');
      state.setIsInMyFiveView(false);
      state.setSelectedMyFiveSong(0);
      
      if (state.viewingFriendProfile && state.viewingFriendSongs.length > 0) {
        console.log('Was viewing friend\'s My Five, going back to friends list');
        state.setViewingFriendProfile(null);
        state.setViewingFriendSongs([]);
        state.setIsInFriendsListView(true);
        state.setIsInFriendsView(true);
        loadFriendsList();
      } else if (state.isSharedView) {
        console.log('Was viewing shared My Five, staying in shared context');
      } else {
        console.log('Was viewing own My Five, going back to main menu');
      }
    } else if (state.isInSettingsView) {
      console.log('Exiting settings view');
      state.setIsInSettingsView(false);
      state.setSelectedSettingsItem(0);
    } else if (state.currentScreen !== 'menu') {
      console.log('Returning to main menu from', state.currentScreen);
      state.setCurrentScreen('menu');
      state.setSelectedMenuItem(0);
    }
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
            onSettingsItemChange={state.setSelectedSettingsItem}
            isInMyFiveView={state.isInMyFiveView}
            selectedMyFiveSong={state.selectedMyFiveSong}
            onMyFiveSongChange={state.setSelectedMyFiveSong}
            isSharedView={state.isSharedView || state.viewingFriendSongs.length > 0}
            sharedUserProfile={state.viewingFriendProfile || sharedUserProfile}
            sharedUserSongs={state.viewingFriendSongs.length > 0 ? state.viewingFriendSongs : sharedUserSongs}
            isInFriendsView={state.isInFriendsView}
            selectedFriendsItem={state.selectedFriendsItem}
            onFriendsItemChange={state.setSelectedFriendsItem}
            isInFriendsListView={state.isInFriendsListView}
            selectedFriendsListItem={state.selectedFriendsListItem}
            onFriendsListItemChange={state.setSelectedFriendsListItem}
            friendsList={state.friendsList}
          />

          <div className="flex-1 flex items-center justify-center md:items-center" style={{ alignItems: 'center', paddingBottom: '2rem' }}>
            <ClickWheel 
              onWheelMove={handleWheelMoveWrapper}
              onWheelLeave={handleWheelLeave}
              onCenterClick={handleCenterClick}
              onMenuClick={handleMenuClick}
            />
          </div>
        </div>

        <div className="absolute top-6 left-6 right-6 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-3xl pointer-events-none hidden md:block"></div>
      </div>
    </div>
  );
};

export default IPod;
