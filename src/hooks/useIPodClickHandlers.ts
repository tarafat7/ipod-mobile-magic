import { useIPodNavigation } from './useIPodNavigation';
import { useIPodFriends } from './useIPodFriends';
import { Music } from 'lucide-react';

interface UseIPodClickHandlersProps {
  currentUser: any;
  state: any;
  friends: ReturnType<typeof useIPodFriends>;
  navigation: ReturnType<typeof useIPodNavigation>;
  handleEditAccount: () => void;
  handleEditMyFive: () => void;
  handleLogout: () => void;
  handleDeleteAccount: () => void;
  handleShareProfile: () => void;
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
}: UseIPodClickHandlersProps) => {
  const handleCenterClick = () => {
    console.log('Center button clicked', {
      currentScreen: state.currentScreen,
      selectedMenuItem: state.selectedMenuItem,
      isInMyFiveView: state.isInMyFiveView,
      isInSettingsView: state.isInSettingsView,
      isInFriendsView: state.isInFriendsView,
      isInFriendsListView: state.isInFriendsListView,
      isInDailyDropView: state.isInDailyDropView,
      isInTodaysPlaylistView: state.isInTodaysPlaylistView
    });

    // Handle My Five view
    if (state.isInMyFiveView) {
      if (state.isSharedView || friends.viewingFriendSongs.length > 0) {
        handleSongPlay();
      } else if (currentUser) {
        handleSongPlay();
      } else {
        state.setIsInMyFiveAuthView(true);
      }
      return;
    }

    // Handle Friends view
    if (state.isInFriendsView) {
      if (currentUser) {
        if (state.isInFriendsListView) {
          const selectedFriend = friends.friendsList[state.selectedFriendsListItem];
          if (selectedFriend) {
            friends.setViewingFriendProfile({ full_name: selectedFriend.full_name });
            friends.setViewingFriendId(selectedFriend.id);
            friends.fetchFriendSongs(selectedFriend.id);
            state.setIsInMyFiveView(true);
            state.setIsInFriendsListView(false);
            state.setIsInFriendsView(false);
            state.setCurrentScreen('menu');
            state.setSelectedMenuItem(0);
          }
        } else {
          state.setIsInFriendsListView(true);
        }
      } else {
        window.location.href = '/signin';
      }
      return;
    }

    // Handle Settings view
    if (state.isInSettingsView) {
      const settingsItems = ['Edit Account', 'Edit My Five', 'Logout', 'Delete Account', 'Share Profile'];
      const selectedAction = settingsItems[state.selectedSettingsItem];

      if (selectedAction === 'Edit Account') {
        handleEditAccount();
      } else if (selectedAction === 'Edit My Five') {
        handleEditMyFive();
      } else if (selectedAction === 'Logout') {
        handleLogout();
      } else if (selectedAction === 'Delete Account') {
        handleDeleteAccount();
      } else if (selectedAction === 'Share Profile') {
        handleShareProfile();
      }
      return;
    }

    // Handle Daily Drop view
    if (state.isInDailyDropView) {
      const dailyDropItems = ["Today's Prompt", 'Manage Songs', "Today's Playlist"];
      const selectedAction = dailyDropItems[state.selectedDailyDropItem];
      
      if (selectedAction === 'Manage Songs') {
        if (currentUser) {
          window.location.href = '/manage-daily-drop';
        } else {
          window.location.href = '/signin';
        }
      } else if (selectedAction === "Today's Playlist") {
        state.setIsInTodaysPlaylistView(true);
        state.setSelectedTodaysPlaylistItem(0);
      }
      return;
    }

    // Handle menu item selection
    switch (state.currentScreen) {
      case 'menu':
        const menuItems = ['My Five', 'Friends', 'Settings', 'Daily Drop', 'About', 'Privacy Policy'];
        const selectedItem = menuItems[state.selectedMenuItem];

        if (selectedItem === 'My Five') {
          if (currentUser) {
            state.setIsInMyFiveView(true);
            state.setCurrentScreen('menu');
          } else {
            state.setIsInMyFiveAuthView(true);
          }
        } else if (selectedItem === 'Friends') {
          state.setIsInFriendsView(true);
          state.setCurrentScreen('menu');
        } else if (selectedItem === 'Settings') {
          state.setIsInSettingsView(true);
          state.setCurrentScreen('menu');
        } else if (selectedItem === 'Daily Drop') {
          state.setIsInDailyDropView(true);
          state.setCurrentScreen('menu');
        } else if (selectedItem === 'About') {
          state.setIsInAboutView(true);
          state.setCurrentScreen('menu');
        } else if (selectedItem === 'Privacy Policy') {
          state.setIsInPrivacyPolicyView(true);
          state.setCurrentScreen('menu');
        }
        break;
      default:
        break;
    }
  };

  const handleBackClick = () => {
    console.log('Back button clicked', {
      currentScreen: state.currentScreen,
      isInSettingsView: state.isInSettingsView,
      isInMyFiveView: state.isInMyFiveView,
      isInFriendsView: state.isInFriendsView,
      isInFriendsListView: state.isInFriendsListView,
      isInAboutView: state.isInAboutView,
      isInPrivacyPolicyView: state.isInPrivacyPolicyView,
      isInMyFiveAuthView: state.isInMyFiveAuthView,
      isInDailyDropView: state.isInDailyDropView,
      isInTodaysPlaylistView: state.isInTodaysPlaylistView
    });

    if (state.isInSettingsView) {
      state.setIsInSettingsView(false);
      state.setCurrentScreen('menu');
    } else if (state.isInMyFiveView) {
      state.setIsInMyFiveView(false);
      state.setCurrentScreen('menu');
      friends.setViewingFriendProfile(null);
      friends.setViewingFriendSongs([]);
      friends.setViewingFriendId(null);
    } else if (state.isInFriendsView) {
      state.setIsInFriendsView(false);
      state.setCurrentScreen('menu');
    } else if (state.isInFriendsListView) {
      state.setIsInFriendsListView(false);
      state.setCurrentScreen('menu');
    } else if (state.isInAboutView) {
      state.setIsInAboutView(false);
      state.setCurrentScreen('menu');
    } else if (state.isInPrivacyPolicyView) {
      state.setIsInPrivacyPolicyView(false);
      state.setCurrentScreen('menu');
    } else if (state.isInMyFiveAuthView) {
      state.setIsInMyFiveAuthView(false);
      state.setCurrentScreen('menu');
    } else if (state.isInDailyDropView) {
      state.setIsInDailyDropView(false);
      state.setCurrentScreen('menu');
    } else if (state.isInTodaysPlaylistView) {
      state.setIsInTodaysPlaylistView(false);
      state.setCurrentScreen('menu');
    }
  };

  const handleForwardClick = () => {
    console.log('Forward button clicked');
  };

  return {
    handleCenterClick,
    handleBackClick,
    handleForwardClick
  };
};
