import React from 'react';
import { supabase } from '../../integrations/supabase/client';

interface CenterClickHandlerProps {
  currentScreen: string;
  isInMyFiveAuthView: boolean;
  selectedMyFiveAuthOption: number;
  isInMyFiveView: boolean;
  selectedMyFiveSong: number;
  myFiveSongsCount: number;
  isSharedView: boolean;
  isInDailyDropView: boolean;
  selectedDailyDropItem: number;
  isInFriendsListView: boolean;
  selectedFriendsListItem: number;
  isInFriendsView: boolean;
  selectedFriendsItem: number;
  isInSettingsView: boolean;
  selectedSettingsItem: number;
  menuItems: string[];
  selectedMenuItem: number;
  currentUser: any;
  friendsList: any[];
  viewingFriendSongs: any[];
  sharedUserSongs: any[];
  isPlaying: boolean;
  onMyFiveAuthOptionChange: (option: number) => void;
  onDailyDropViewEnter: () => void;
  onMyFiveViewEnter: () => void;
  onMyFiveAuthViewEnter: () => void;
  onFriendsViewEnter: () => void;
  onSettingsViewEnter: () => void;
  onAboutViewEnter: () => void;
  onPlayingToggle: () => void;
  onEditMyFive: () => void;
  onEditAccount: () => void;
  onLogout: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  onShareProfile: () => void;
  onLoadFriendSongs: (friendId: string, friendName: string) => void;
  onFriendsListViewEnter: () => void;
  onLoadFriendsList: (user: any) => void;
  onPrivacyPolicyViewEnter: () => void;
  onSettingsViewExit: () => void;
  onDailyDropViewExit: () => void;
}

export const useCenterClickHandler = (props: CenterClickHandlerProps) => {
  const handleCenterClick = async () => {
    console.log('Center button clicked!');
    
    if (props.currentScreen === 'menu') {
      if (props.isInMyFiveAuthView) {
        console.log('My Five Auth option selected:', props.selectedMyFiveAuthOption);
        if (props.selectedMyFiveAuthOption === 0) {
          window.open('/signin?mode=signin', '_blank');
        } else {
          window.open('/signin', '_blank');
        }
      } else if (props.isInMyFiveView) {
        console.log('My Five song selected:', props.selectedMyFiveSong);
        
        const hasEditButton = !props.isSharedView && props.viewingFriendSongs.length === 0 && props.currentUser;
        
        if (hasEditButton && props.selectedMyFiveSong === 0 && props.myFiveSongsCount === 0) {
          props.onEditMyFive();
          return;
        } else if (hasEditButton && props.selectedMyFiveSong === 0) {
          props.onEditMyFive();
          return;
        }
        
        const songIndex = hasEditButton ? props.selectedMyFiveSong - 1 : props.selectedMyFiveSong;
        
        let songToPlay = null;
        if (props.viewingFriendSongs.length > 0) {
          songToPlay = props.viewingFriendSongs[songIndex];
        } else if (props.isSharedView && props.sharedUserSongs[songIndex]) {
          songToPlay = props.sharedUserSongs[songIndex];
        }
        
        if (songToPlay) {
          window.open(songToPlay.spotifyUrl, '_blank');
        } else if (songIndex >= 0) {
          const event = new CustomEvent('myFiveSongSelect', { detail: { songIndex } });
          window.dispatchEvent(event);
        }
      } else if (props.isInDailyDropView) {
        const dailyDropItems = ["Today's Prompt", 'Add a Song', 'View Today\'s Playlist'];
        const selectedDailyDropAction = dailyDropItems[props.selectedDailyDropItem];
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
      } else if (props.isInFriendsListView) {
        const selectedFriend = props.friendsList[props.selectedFriendsListItem];
        if (selectedFriend) {
          console.log('Loading friend\'s songs:', selectedFriend);
          props.onLoadFriendSongs(selectedFriend.id, selectedFriend.full_name);
        }
      } else if (props.isInFriendsView) {
        const friendsItems = ['Add a friend', 'My Friends'];
        const selectedFriendsAction = friendsItems[props.selectedFriendsItem];
        console.log('Friends action selected:', selectedFriendsAction);
        
        switch (selectedFriendsAction) {
          case 'Add a friend':
            window.location.href = '/search-friends';
            break;
          case 'My Friends':
            props.onFriendsListViewEnter();
            props.onLoadFriendsList(props.currentUser);
            break;
          default:
            console.log('Friends action not implemented:', selectedFriendsAction);
            break;
        }
      } else if (props.isInSettingsView) {
        const settingsItems = ['Edit Account', 'Privacy Policy', 'Product Feedback', 'Logout', 'Delete Account'];
        const selectedSettingsAction = settingsItems[props.selectedSettingsItem];
        console.log('Settings action selected:', selectedSettingsAction);
        
        switch (selectedSettingsAction) {
          case 'Edit Account':
            props.onEditAccount();
            break;
          case 'Privacy Policy':
            console.log('Entering Privacy Policy view');
            props.onPrivacyPolicyViewEnter();
            break;
          case 'Product Feedback':
            window.open('https://app.formbricks.com/s/cmc2iwfd7d33uu2017tjqmhji', '_blank');
            break;
          case 'Logout':
            await props.onLogout();
            props.onSettingsViewExit();
            break;
          case 'Delete Account':
            await props.onDeleteAccount();
            props.onSettingsViewExit();
            break;
          default:
            console.log('Settings action not implemented:', selectedSettingsAction);
            break;
        }
      } else {
        const selectedItem = props.menuItems[props.selectedMenuItem];
        if (selectedItem === 'The Daily Drop') {
          console.log('Entering Daily Drop view');
          props.onDailyDropViewEnter();
        } else if (selectedItem === 'Sign In') {
          console.log('Attempting to open sign-in page...');
          const newWindow = window.open('/signin?mode=signin', '_blank');
          console.log('Window opened:', newWindow);
        } else if (selectedItem === 'My Five') {
          console.log('Entering My Five view');
          
          if (!props.currentUser) {
            console.log('User not signed in, showing auth options');
            props.onMyFiveAuthViewEnter();
          } else {
            props.onMyFiveViewEnter();
          }
        } else if (selectedItem === 'Friends') {
          console.log('Entering Friends view');
          props.onFriendsViewEnter();
        } else if (selectedItem === 'Share Profile') {
          props.onShareProfile();
        } else if (selectedItem === 'Settings') {
          console.log('Entering settings view');
          props.onSettingsViewEnter();
        } else if (selectedItem === 'About') {
          console.log('Entering About view');
          props.onAboutViewEnter();
        } else {
          props.onPlayingToggle();
        }
      }
    } else if (props.currentScreen === 'music') {
      props.onPlayingToggle();
    }
  };

  return { handleCenterClick };
};
