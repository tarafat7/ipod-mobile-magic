
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { getMenuItems } from '../data/iPodData';

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

export const useIPodState = (sharedUserProfile?: UserProfile | null, sharedUserSongs?: SpotifyTrackInfo[]) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [selectedMenuItem, setSelectedMenuItem] = useState(0);
  const [selectedSong, setSelectedSong] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [lastAngle, setLastAngle] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [isInSettingsView, setIsInSettingsView] = useState(false);
  const [selectedSettingsItem, setSelectedSettingsItem] = useState(0);
  const [isInMyFiveView, setIsInMyFiveView] = useState(false);
  const [selectedMyFiveSong, setSelectedMyFiveSong] = useState(0);
  const [myFiveSongsCount, setMyFiveSongsCount] = useState(0);
  const [isSharedView, setIsSharedView] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isInFriendsView, setIsInFriendsView] = useState(false);
  const [selectedFriendsItem, setSelectedFriendsItem] = useState(0);
  const [isInFriendsListView, setIsInFriendsListView] = useState(false);
  const [selectedFriendsListItem, setSelectedFriendsListItem] = useState(0);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [viewingFriendProfile, setViewingFriendProfile] = useState<UserProfile | null>(null);
  const [viewingFriendSongs, setViewingFriendSongs] = useState<SpotifyTrackInfo[]>([]);

  // Check authentication state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle shared view detection
  useEffect(() => {
    const currentPath = window.location.pathname;
    const isMyFiveRoute = currentPath.includes('/my-five/');
    
    if (isMyFiveRoute && sharedUserProfile) {
      setIsSharedView(true);
      setCurrentScreen('menu');
      setIsInMyFiveView(true);
      setSelectedMenuItem(0);
      setMyFiveSongsCount(sharedUserSongs?.length || 0);
    } else {
      setIsSharedView(false);
    }
  }, [sharedUserProfile, sharedUserSongs]);

  useEffect(() => {
    const loadMenuItems = async () => {
      const items = await getMenuItems();
      setMenuItems(items);
    };

    const loadUserSongs = async () => {
      // Only load user songs if NOT viewing shared content
      if (isSharedView || !currentUser) {
        return;
      }
      
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
        console.error('Error loading user songs:', error);
      }
    };

    loadMenuItems();
    
    if (!isSharedView && currentUser) {
      loadUserSongs();
    }
  }, [isSharedView, currentUser]);

  return {
    isPlaying,
    setIsPlaying,
    currentScreen,
    setCurrentScreen,
    selectedMenuItem,
    setSelectedMenuItem,
    selectedSong,
    setSelectedSong,
    currentTime,
    setCurrentTime,
    lastAngle,
    setLastAngle,
    menuItems,
    setMenuItems,
    isInSettingsView,
    setIsInSettingsView,
    selectedSettingsItem,
    setSelectedSettingsItem,
    isInMyFiveView,
    setIsInMyFiveView,
    selectedMyFiveSong,
    setSelectedMyFiveSong,
    myFiveSongsCount,
    setMyFiveSongsCount,
    isSharedView,
    setIsSharedView,
    currentUser,
    setCurrentUser,
    isInFriendsView,
    setIsInFriendsView,
    selectedFriendsItem,
    setSelectedFriendsItem,
    isInFriendsListView,
    setIsInFriendsListView,
    selectedFriendsListItem,
    setSelectedFriendsListItem,
    friendsList,
    setFriendsList,
    viewingFriendProfile,
    setViewingFriendProfile,
    viewingFriendSongs,
    setViewingFriendSongs
  };
};
