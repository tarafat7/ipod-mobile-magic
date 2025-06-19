
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

  const handleWheelNavigation = (isClockwise: boolean) => {
    triggerHapticFeedback();
    
    if (currentScreen === 'menu') {
      if (isInAboutView) {
        // No navigation needed in About view, it's just text
        return;
      } else if (isInMyFiveView) {
        let songsCount;
        if (viewingFriendSongs.length > 0) {
          songsCount = viewingFriendSongs.length;
        } else if (isSharedView) {
          songsCount = sharedUserSongs.length;
        } else {
          songsCount = myFiveSongsCount;
        }
        
        const newSelection = isClockwise 
          ? (selectedMyFiveSong + 1) % Math.max(songsCount, 1)
          : (selectedMyFiveSong - 1 + Math.max(songsCount, 1)) % Math.max(songsCount, 1);
        
        setSelectedMyFiveSong(newSelection);
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
        const settingsItemsCount = 5; // Updated from 4 to 5 (added About)
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
    
    if (isInAboutView) {
      console.log('Exiting About view');
      setIsInAboutView(false);
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
