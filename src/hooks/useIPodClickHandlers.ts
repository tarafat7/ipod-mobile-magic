
import { useCallback } from 'react';

interface ClickHandlersProps {
  currentUser: any;
  state: any;
  friends: any;
  navigation: any;
  handleEditAccount: () => void;
  handleEditMyFive: () => void;
  handleLogout: () => Promise<void>;
  handleDeleteAccount: () => Promise<void>;
  handleShareProfile: () => Promise<void>;
  handleSongPlay: () => void;
  sharedUserSongs: any[];
}

export const useIPodClickHandlers = ({
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
}: ClickHandlersProps) => {
  const handleCenterClick = useCallback(async () => {
    console.log('Center button clicked!');
    
    if (state.currentScreen === 'menu') {
      if (state.isInTodaysPlaylistView) {
        console.log('Today\'s Playlist song selected:', state.selectedTodaysPlaylistItem);
        // Handle opening the selected song in Spotify
        // This will be implemented similar to handleSongPlay
      } else if (state.isInMyFiveAuthView) {
        console.log('My Five Auth option selected:', state.selectedMyFiveAuthOption);
        if (state.selectedMyFiveAuthOption === 0) {
          window.open('/signin?mode=signin', '_blank');
        } else {  
          window.open('/signin', '_blank');
        }
      } else if (state.isInMyFiveView) {
        console.log('My Five song selected:', state.selectedMyFiveSong);
        handleSongPlay();
      } else if (state.isInDailyDropView) {
        const dailyDropItems = ["Today's Prompt", 'Add a Song', "Today's Playlist"];
        const selectedDailyDropAction = dailyDropItems[state.selectedDailyDropItem];
        console.log('Daily Drop action selected:', selectedDailyDropAction);
        
        switch (selectedDailyDropAction) {
          case "Today's Prompt":
            console.log('Today\'s Prompt selected');
            break;
          case 'Add a Song':
            console.log('Add a Song selected - navigating to add page');
            window.location.href = '/add-daily-drop';
            break;
          case "Today's Playlist":
            console.log('Today\'s Playlist selected - entering playlist view');
            state.setIsInTodaysPlaylistView(true);
            state.setSelectedTodaysPlaylistItem(0);
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
          state.setIsInDailyDropView(true);
          state.setSelectedDailyDropItem(0);
        } else if (selectedItem === 'Sign In') {
          console.log('Attempting to open sign-in page...');
          const newWindow = window.open('/signin?mode=signin', '_blank');
          console.log('Window opened:', newWindow);
        } else if (selectedItem === 'My Five') {
          console.log('Entering My Five view');
          
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
  }, [
    currentUser,
    state,
    friends,
    handleEditAccount,
    handleEditMyFive,
    handleLogout,
    handleDeleteAccount,
    handleShareProfile,
    handleSongPlay,
    sharedUserSongs
  ]);

  const handleBackClick = useCallback(() => {
    console.log('Back button clicked - same as menu');
    navigation.handleMenuClick();
  }, [navigation]);

  const handleForwardClick = useCallback(() => {
    console.log('Forward button clicked - same as center');
    handleCenterClick();
  }, [handleCenterClick]);

  return {
    handleCenterClick,
    handleBackClick,
    handleForwardClick
  };
};
