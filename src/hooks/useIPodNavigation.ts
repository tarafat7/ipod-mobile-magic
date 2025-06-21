
import { useEffect } from 'react';
import { getMenuItems } from '../data/iPodData';
import { supabase } from '../integrations/supabase/client';

interface NavigationProps {
  menuItems: string[];
  setMenuItems: (items: string[]) => void;
  myFiveSongsCount: number;
  setMyFiveSongsCount: (count: number) => void;
  isSharedView: boolean;
  currentUser: any;
  isInMyFiveView: boolean;
  setIsInMyFiveView: (value: boolean) => void;
  selectedMyFiveSong: number;
  setSelectedMyFiveSong: (value: number) => void;
  isInFriendsListView: boolean;
  setIsInFriendsListView: (value: boolean) => void;
  selectedFriendsListItem: number;
  setSelectedFriendsListItem: (value: number) => void;
  isInFriendsView: boolean;
  setIsInFriendsView: (value: boolean) => void;
  selectedFriendsItem: number;
  setSelectedFriendsItem: (value: number) => void;
  isInSettingsView: boolean;
  setIsInSettingsView: (value: boolean) => void;
  selectedSettingsItem: number;
  setSelectedSettingsItem: (value: number) => void;
  selectedMenuItem: number;
  setSelectedMenuItem: (value: number) => void;
  selectedSong: number;
  setSelectedSong: (value: number) => void;
  currentScreen: string;
  friendsList: any[];
  viewingFriendSongs: any[];
  sharedUserSongs: any[];
  setIsSharedView: (value: boolean) => void;
  setViewingFriendProfile: (profile: any) => void;
  setViewingFriendSongs: (songs: any[]) => void;
  loadFriendsList: (user: any) => void;
  isInAboutView: boolean;
  setIsInAboutView: (value: boolean) => void;
  isInPrivacyPolicyView: boolean;
  setIsInPrivacyPolicyView: (value: boolean) => void;
  isInMyFiveAuthView: boolean;
  setIsInMyFiveAuthView: (value: boolean) => void;
  selectedMyFiveAuthOption: number;
  setSelectedMyFiveAuthOption: (value: number) => void;
  isInDailyDropView: boolean;
  setIsInDailyDropView: (value: boolean) => void;
  selectedDailyDropItem: number;
  setSelectedDailyDropItem: (value: number) => void;
  isInTodaysPlaylistView: boolean;
  setIsInTodaysPlaylistView: (value: boolean) => void;
  selectedTodaysPlaylistItem: number;
  setSelectedTodaysPlaylistItem: (value: number) => void;
}

export const useIPodNavigation = (props: NavigationProps) => {
  const {
    menuItems,
    setMenuItems,
    myFiveSongsCount,
    setMyFiveSongsCount,
    isSharedView,
    currentUser,
    isInMyFiveView,
    setIsInMyFiveView,
    selectedMyFiveSong,
    setSelectedMyFiveSong,
    isInFriendsListView,
    setIsInFriendsListView,
    selectedFriendsListItem,
    setSelectedFriendsListItem,
    isInFriendsView,
    setIsInFriendsView,
    selectedFriendsItem,
    setSelectedFriendsItem,
    isInSettingsView,
    setIsInSettingsView,
    selectedSettingsItem,
    setSelectedSettingsItem,
    selectedMenuItem,
    setSelectedMenuItem,
    selectedSong,
    setSelectedSong,
    currentScreen,
    friendsList,
    viewingFriendSongs,
    sharedUserSongs,
    setIsSharedView,
    setViewingFriendProfile,
    setViewingFriendSongs,
    loadFriendsList,
    isInAboutView,
    setIsInAboutView,
    isInPrivacyPolicyView,
    setIsInPrivacyPolicyView,
    isInMyFiveAuthView,
    setIsInMyFiveAuthView,
    selectedMyFiveAuthOption,
    setSelectedMyFiveAuthOption,
    isInDailyDropView,
    setIsInDailyDropView,
    selectedDailyDropItem,
    setSelectedDailyDropItem,
    isInTodaysPlaylistView,
    setIsInTodaysPlaylistView,
    selectedTodaysPlaylistItem,
    setSelectedTodaysPlaylistItem,
  } = props;

  useEffect(() => {
    const loadMenuItems = async () => {
      const items = await getMenuItems();
      setMenuItems(items);
    };

    const loadMyFiveSongs = async () => {
      if (isSharedView || !currentUser) return;
      
      try {
        const { data, error } = await supabase
          .from('user_five_songs')
          .select('*')
          .eq('user_id', currentUser.id)
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
      } catch (error) {
        console.error('Error loading my five songs count:', error);
      }
    };

    loadMenuItems();
    loadMyFiveSongs();
  }, [isSharedView, currentUser, setMenuItems, setMyFiveSongsCount]);

  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const scrollSelectedItemIntoView = () => {
    // Auto-scroll the selected item into view for My Five and Today's Playlist
    if (isInMyFiveView || props.isInTodaysPlaylistView) {
      setTimeout(() => {
        const selectedElement = document.querySelector('[data-selected="true"]');
        if (selectedElement) {
          selectedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      }, 50);
    }
  };

  const handleWheelNavigation = (isClockwise: boolean) => {
    triggerHapticFeedback();
    
    // Handle Privacy Policy scrolling
    if (props.isInPrivacyPolicyView) {
      const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const scrollAmount = 50;
        const currentScrollTop = scrollContainer.scrollTop;
        const newScrollTop = isClockwise 
          ? currentScrollTop + scrollAmount 
          : Math.max(0, currentScrollTop - scrollAmount);
        
        scrollContainer.scrollTop = newScrollTop;
      }
      return;
    }
    
    if (currentScreen === 'menu') {
      if (props.isInTodaysPlaylistView) {
        // Get the actual submissions count from the DOM or use a reasonable default
        const playlistContainer = document.querySelector('[data-playlist-items]');
        const playlistItemsCount = playlistContainer 
          ? playlistContainer.children.length 
          : 1; // Default to 1 to prevent division by zero
        
        const newSelection = isClockwise 
          ? (props.selectedTodaysPlaylistItem + 1) % Math.max(playlistItemsCount, 1)
          : (props.selectedTodaysPlaylistItem - 1 + Math.max(playlistItemsCount, 1)) % Math.max(playlistItemsCount, 1);
        
        props.setSelectedTodaysPlaylistItem(newSelection);
        
        // Auto-scroll the selected item into view
        scrollSelectedItemIntoView();
      } else if (isInMyFiveAuthView) {
        const authOptionsCount = 2; // Sign In, Sign Up
        const newSelection = isClockwise 
          ? (selectedMyFiveAuthOption + 1) % authOptionsCount
          : (selectedMyFiveAuthOption - 1 + authOptionsCount) % authOptionsCount;
        
        setSelectedMyFiveAuthOption(newSelection);
      } else if (isInDailyDropView) {
        const dailyDropItemsCount = 3; // Today's Prompt, Add My Track, Today's Playlist
        const newSelection = isClockwise 
          ? (selectedDailyDropItem + 1) % dailyDropItemsCount
          : (selectedDailyDropItem - 1 + dailyDropItemsCount) % dailyDropItemsCount;
        
        setSelectedDailyDropItem(newSelection);
      } else if (isInMyFiveView) {
        let songsCount;
        if (viewingFriendSongs.length > 0) {
          songsCount = viewingFriendSongs.length;
        } else if (isSharedView) {
          songsCount = sharedUserSongs.length;
        } else {
          songsCount = myFiveSongsCount;
        }
        
        // Include Edit My Five button in navigation for signed-in users viewing their own songs
        const hasEditButton = !isSharedView && viewingFriendSongs.length === 0 && currentUser;
        const totalItems = hasEditButton ? songsCount + 1 : songsCount;
        const maxItems = Math.max(totalItems, 1);
        
        const newSelection = isClockwise 
          ? (selectedMyFiveSong + 1) % maxItems
          : (selectedMyFiveSong - 1 + maxItems) % maxItems;
        
        setSelectedMyFiveSong(newSelection);
        
        // Auto-scroll the selected item into view
        scrollSelectedItemIntoView();
      } else if (isInFriendsListView) {
        const newSelection = isClockwise 
          ? (selectedFriendsListItem + 1) % Math.max(friendsList.length, 1)
          : (selectedFriendsListItem - 1 + Math.max(friendsList.length, 1)) % Math.max(friendsList.length, 1);
        
        setSelectedFriendsListItem(newSelection);
      } else if (isInFriendsView) {
        const friendsItemsCount = 2;
        const newSelection = isClockwise 
          ? (selectedFriendsItem + 1) % friendsItemsCount
          : (selectedFriendsItem - 1 + friendsItemsCount) % friendsItemsCount;
        
        setSelectedFriendsItem(newSelection);
      } else if (isInSettingsView) {
        const settingsItemsCount = 5; // Updated from 4 to 5 (added Privacy Policy)
        const newSelection = isClockwise 
          ? (selectedSettingsItem + 1) % settingsItemsCount
          : (selectedSettingsItem - 1 + settingsItemsCount) % settingsItemsCount;
        
        setSelectedSettingsItem(newSelection);
      } else {
        const newSelection = isClockwise 
          ? (selectedMenuItem + 1) % menuItems.length
          : (selectedMenuItem - 1 + menuItems.length) % menuItems.length;
        
        setSelectedMenuItem(newSelection);
      }
    } else if (currentScreen === 'music') {
      const newSelection = isClockwise 
        ? (selectedSong + 1) % 5
        : (selectedSong - 1 + 5) % 5;
      
      setSelectedSong(newSelection);
    }
  };

  const handleMenuClick = () => {
    console.log('Menu button clicked');
    
    if (props.isInTodaysPlaylistView) {
      console.log('Exiting Today\'s Playlist view');
      props.setIsInTodaysPlaylistView(false);
      props.setSelectedTodaysPlaylistItem(0);
      return;
    }
    
    if (isInMyFiveAuthView) {
      console.log('Exiting My Five Auth view');
      setIsInMyFiveAuthView(false);
      setSelectedMyFiveAuthOption(0);
      return;
    }
    
    if (isInDailyDropView) {
      console.log('Exiting Daily Drop view');
      setIsInDailyDropView(false);
      setSelectedDailyDropItem(0);
      return;
    }
    
    if (isInMyFiveView) {
      console.log('Exiting My Five view');
      setIsInMyFiveView(false);
      setSelectedMyFiveSong(0);
      
      if (viewingFriendSongs.length > 0) {
        console.log('Clearing friend viewing state and returning to friends list');
        setViewingFriendProfile(null);
        setViewingFriendSongs([]);
        setIsInFriendsListView(true);
        setIsInFriendsView(true);
        loadFriendsList(currentUser);
      }
      return;
    }
    
    if (props.isInAboutView) {
      console.log('Exiting About view');
      props.setIsInAboutView(false);
      return;
    }

    if (props.isInPrivacyPolicyView) {
      console.log('Exiting Privacy Policy view');
      props.setIsInPrivacyPolicyView(false);
      return;
    }
    
    if (isInFriendsListView) {
      console.log('Exiting Friends List view');
      setIsInFriendsListView(false);
      setSelectedFriendsListItem(0);
    } else if (isInFriendsView) {
      console.log('Exiting Friends view');
      setIsInFriendsView(false);
      setSelectedFriendsItem(0);
    } else if (isInSettingsView) {
      console.log('Exiting settings view');
      setIsInSettingsView(false);
      setSelectedSettingsItem(0);
    }
  };

  return {
    handleWheelNavigation,
    handleMenuClick,
    triggerHapticFeedback,
  };
};
