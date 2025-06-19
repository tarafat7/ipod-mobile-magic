import React, { useState, useRef, useEffect } from 'react';
import Screen from './Screen';
import ClickWheel from './ClickWheel';
import { getMenuItems, songs } from '../data/iPodData';
import { supabase } from '../integrations/supabase/client';
import { extractSpotifyTrackId, fetchSpotifyTrackInfo, formatDate } from '../utils/spotifyUtils';

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

  // Add state for viewing friend's songs
  const [viewingFriendProfile, setViewingFriendProfile] = useState<UserProfile | null>(null);
  const [viewingFriendSongs, setViewingFriendSongs] = useState<SpotifyTrackInfo[]>([]);

  // Check authentication state and route context
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

  // Load friends list when needed
  const loadFriendsList = async () => {
    if (!currentUser) return;
    
    try {
      // First get the friend IDs
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select('friend_user_id')
        .eq('user_id', currentUser.id);

      if (friendsError) {
        console.error('Error loading friends:', friendsError);
        return;
      }

      if (friendsData && friendsData.length > 0) {
        const friendIds = friendsData.map(f => f.friend_user_id);
        
        // Then get the profile information for those friends
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .in('id', friendIds);

        if (profilesError) {
          console.error('Error loading friend profiles:', profilesError);
          return;
        }

        if (profilesData) {
          const friendsList = profilesData.map(profile => ({
            id: profile.id,
            full_name: profile.full_name || 'Unknown User',
            username: profile.username || ''
          }));
          setFriendsList(friendsList);
        }
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  // Add function to load friend's songs
  const loadFriendSongs = async (friendId: string, friendName: string) => {
    try {
      console.log('Loading songs for friend:', friendId, friendName);
      
      // Set the profile first
      setViewingFriendProfile({ full_name: friendName });
      
      // Load friend's songs
      const { data, error } = await supabase
        .from('user_five_songs')
        .select('*')
        .eq('user_id', friendId)
        .maybeSingle();

      if (error) {
        console.error('Error loading friend songs:', error);
        setViewingFriendSongs([]);
        return;
      }

      if (data) {
        const songUrls = [
          data.song_1,
          data.song_2,
          data.song_3,
          data.song_4,
          data.song_5
        ].filter(Boolean);

        if (songUrls.length > 0) {
          const addedDate = formatDate(data.created_at);
          const songInfoPromises = songUrls.map(async (url) => {
            const trackId = extractSpotifyTrackId(url);
            if (trackId) {
              return await fetchSpotifyTrackInfo(trackId, addedDate);
            }
            return null;
          });

          const songInfos = await Promise.all(songInfoPromises);
          const validSongs = songInfos.filter((song): song is SpotifyTrackInfo => song !== null);
          console.log('Loaded friend songs:', validSongs);
          setViewingFriendSongs(validSongs);
        } else {
          setViewingFriendSongs([]);
        }
      } else {
        setViewingFriendSongs([]);
      }
    } catch (error) {
      console.error('Error loading friend songs:', error);
      setViewingFriendSongs([]);
    }
  };

  // Handle route-based shared view detection
  useEffect(() => {
    const currentPath = window.location.pathname;
    const isMyFiveRoute = currentPath.includes('/my-five/');
    const isFriendsRoute = currentPath.includes('/friends/');
    
    console.log('Route check:', { currentPath, isMyFiveRoute, isFriendsRoute, hasProfile: !!sharedUserProfile, songsCount: sharedUserSongs.length });
    
    if (isMyFiveRoute && sharedUserProfile) {
      console.log('Setting up shared view');
      setIsSharedView(true);
      setCurrentScreen('menu');
      setIsInMyFiveView(true);
      setSelectedMenuItem(0);
      setMyFiveSongsCount(sharedUserSongs.length);
    } else if (isFriendsRoute) {
      console.log('Setting up friends view');
      setIsSharedView(false);
      setIsInFriendsView(true);
      setSelectedFriendsItem(0);
    } else {
      // Reset shared view state when not on shared route
      setIsSharedView(false);
    }
  }, [sharedUserProfile, sharedUserSongs, window.location.pathname]);

  // Update songs count when shared songs change
  useEffect(() => {
    if (isSharedView && sharedUserSongs.length > 0) {
      console.log('Updating shared songs count:', sharedUserSongs.length);
      setMyFiveSongsCount(sharedUserSongs.length);
    }
  }, [sharedUserSongs, isSharedView]);

  useEffect(() => {
    const loadMenuItems = async () => {
      const items = await getMenuItems();
      setMenuItems(items);
    };

    const loadMyFiveSongs = async () => {
      // Only load user's own songs if not in shared view and user is authenticated
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
  }, [isSharedView, currentUser]);

  const triggerHapticFeedback = () => {
    // Check if vibration API is available (mobile devices)
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // Short 10ms vibration
    }
  };

  const handleWheelMove = (e: React.MouseEvent) => {
    const wheelElement = e.currentTarget as HTMLElement;
    const rect = wheelElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    
    const normalizedAngle = ((angle * 180) / Math.PI + 360) % 360;
    
    if (lastAngle !== null) {
      let angleDiff = normalizedAngle - lastAngle;
      
      // Handle angle wrap-around
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
      
      // Add sensitivity threshold - only move if angle difference is significant enough
      const threshold = 15; // degrees
      if (Math.abs(angleDiff) < threshold) {
        return;
      }
      
      // Trigger haptic feedback for every significant wheel movement
      triggerHapticFeedback();
      
      // Determine direction: positive = clockwise, negative = counter-clockwise
      const isClockwise = angleDiff > 0;
      
      if (currentScreen === 'menu') {
        if (isInMyFiveView) {
          // Navigate My Five songs - use viewing friend songs if we're viewing a friend, otherwise use shared or personal songs
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
          
          console.log('My Five navigation:', { currentSelection: selectedMyFiveSong, newSelection });
          setSelectedMyFiveSong(newSelection);
        } else if (isInFriendsListView) {
          // Navigate friends list
          const newSelection = isClockwise 
            ? (selectedFriendsListItem + 1) % Math.max(friendsList.length, 1)
            : (selectedFriendsListItem - 1 + Math.max(friendsList.length, 1)) % Math.max(friendsList.length, 1);
          
          console.log('Friends list navigation:', { currentSelection: selectedFriendsListItem, newSelection });
          setSelectedFriendsListItem(newSelection);
        } else if (isInFriendsView) {
          // Navigate friends items - only 2 items now
          const friendsItemsCount = 2; // Add a friend, My Friends
          const newSelection = isClockwise 
            ? (selectedFriendsItem + 1) % friendsItemsCount
            : (selectedFriendsItem - 1 + friendsItemsCount) % friendsItemsCount;
          
          console.log('Friends navigation:', { currentSelection: selectedFriendsItem, newSelection });
          setSelectedFriendsItem(newSelection);
        } else if (isInSettingsView) {
          // Navigate settings items
          const settingsItemsCount = 5; // Share Profile, Edit Account, Edit My Five, Logout, Delete Account
          const newSelection = isClockwise 
            ? (selectedSettingsItem + 1) % settingsItemsCount
            : (selectedSettingsItem - 1 + settingsItemsCount) % settingsItemsCount;
          
          console.log('Settings navigation:', { currentSelection: selectedSettingsItem, newSelection });
          setSelectedSettingsItem(newSelection);
        } else {
          // Navigate main menu items
          const newSelection = isClockwise 
            ? (selectedMenuItem + 1) % menuItems.length
            : (selectedMenuItem - 1 + menuItems.length) % menuItems.length;
          
          console.log('Menu navigation:', { currentSelection: selectedMenuItem, newSelection, selectedItem: menuItems[newSelection] });
          setSelectedMenuItem(newSelection);
        }
      } else if (currentScreen === 'music') {
        const newSelection = isClockwise 
          ? (selectedSong + 1) % songs.length
          : (selectedSong - 1 + songs.length) % songs.length;
        
        setSelectedSong(newSelection);
      }
    }
    
    setLastAngle(normalizedAngle);
  };

  const handleWheelLeave = () => {
    setLastAngle(null);
  };

  const handleShareProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const shareUrl = `${window.location.origin}/my-five/${user.id}`;
      const shareData = {
        title: 'Check out my Five!',
        text: 'Here are the 5 songs on repeat for me right now',
        url: shareUrl
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Reset to main menu and clear settings view
      setIsInSettingsView(false);
      setSelectedSettingsItem(0);
      setCurrentScreen('menu');
      setSelectedMenuItem(0);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Delete user profile first
          await supabase.from('profiles').delete().eq('id', user.id);
          // Then sign out
          await supabase.auth.signOut();
          // Reset to main menu
          setIsInSettingsView(false);
          setSelectedSettingsItem(0);
          setCurrentScreen('menu');
          setSelectedMenuItem(0);
        }
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const handleEditAccount = () => {
    window.location.href = '/signin?mode=edit';
  };

  const handleEditMyFive = () => {
    window.location.href = '/edit-my-five';
  };

  const handleCenterClick = () => {
    console.log('Center button clicked!');
    console.log('Current screen:', currentScreen);
    console.log('Selected menu item:', selectedMenuItem);
    console.log('Selected menu item name:', menuItems[selectedMenuItem]);
    console.log('Is in settings view:', isInSettingsView);
    console.log('Is in My Five view:', isInMyFiveView);
    console.log('Is in Friends view:', isInFriendsView);
    console.log('Is in Friends List view:', isInFriendsListView);
    console.log('Is shared view:', isSharedView);
    console.log('Selected settings item:', selectedSettingsItem);
    console.log('Selected friends item:', selectedFriendsItem);
    console.log('Selected friends list item:', selectedFriendsListItem);
    
    if (currentScreen === 'menu') {
      if (isInMyFiveView) {
        // Handle My Five song selection - open Spotify link
        console.log('My Five song selected:', selectedMyFiveSong);
        
        let songToPlay = null;
        if (viewingFriendSongs.length > 0) {
          // Playing friend's song
          songToPlay = viewingFriendSongs[selectedMyFiveSong];
        } else if (isSharedView && sharedUserSongs[selectedMyFiveSong]) {
          // Playing shared song
          songToPlay = sharedUserSongs[selectedMyFiveSong];
        }
        
        if (songToPlay) {
          window.open(songToPlay.spotifyUrl, '_blank');
        } else {
          // Trigger the existing song select event for personal songs
          const event = new CustomEvent('myFiveSongSelect', { detail: { songIndex: selectedMyFiveSong } });
          window.dispatchEvent(event);
        }
      } else if (isInFriendsListView) {
        // Handle friend selection - load their songs and enter My Five view
        const selectedFriend = friendsList[selectedFriendsListItem];
        if (selectedFriend) {
          console.log('Loading friend\'s songs:', selectedFriend);
          loadFriendSongs(selectedFriend.id, selectedFriend.full_name);
          // Transition to My Five view to show friend's songs
          setIsInMyFiveView(true);
          setSelectedMyFiveSong(0);
          // Clear shared view state since we're viewing a friend's songs locally
          setIsSharedView(false);
        }
      } else if (isInFriendsView) {
        // Handle friends item selection
        const friendsItems = ['Add a friend', 'My Friends'];
        const selectedFriendsAction = friendsItems[selectedFriendsItem];
        console.log('Friends action selected:', selectedFriendsAction);
        
        switch (selectedFriendsAction) {
          case 'Add a friend':
            window.location.href = '/search-friends';
            break;
          case 'My Friends':
            // Enter friends list view instead of navigating away
            setIsInFriendsListView(true);
            setSelectedFriendsListItem(0);
            loadFriendsList();
            break;
          default:
            console.log('Friends action not implemented:', selectedFriendsAction);
            break;
        }
      } else if (isInSettingsView) {
        // Handle settings item selection
        const settingsItems = ['Share Profile', 'Edit Account', 'Edit My Five', 'Logout', 'Delete Account'];
        const selectedSettingsAction = settingsItems[selectedSettingsItem];
        console.log('Settings action selected:', selectedSettingsAction);
        
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
          case 'Logout':
            handleLogout();
            break;
          case 'Delete Account':
            handleDeleteAccount();
            break;
          default:
            console.log('Settings action not implemented:', selectedSettingsAction);
            break;
        }
      } else {
        // Handle main menu item selection
        const selectedItem = menuItems[selectedMenuItem];
        if (selectedItem === 'Sign In') {
          console.log('Attempting to open sign-in page...');
          const newWindow = window.open('/signin', '_blank');
          console.log('Window opened:', newWindow);
        } else if (selectedItem === 'My Five') {
          console.log('Entering My Five view');
          // Clear any shared view state and viewing friend state, enter personal My Five
          setIsSharedView(false);
          setViewingFriendProfile(null);
          setViewingFriendSongs([]);
          setIsInMyFiveView(true);
          setSelectedMyFiveSong(0);
        } else if (selectedItem === 'Friends') {
          console.log('Entering Friends view');
          setIsInFriendsView(true);
          setSelectedFriendsItem(0);
        } else if (selectedItem === 'Settings') {
          console.log('Entering settings view');
          setIsInSettingsView(true);
          setSelectedSettingsItem(0);
        } else {
          setIsPlaying(!isPlaying);
        }
      }
    } else if (currentScreen === 'music') {
      setIsPlaying(!isPlaying);
    }
  };

  const handleMenuClick = () => {
    console.log('Menu button clicked');
    console.log('Current state - Screen:', currentScreen, 'InSettings:', isInSettingsView, 'InMyFive:', isInMyFiveView, 'InFriends:', isInFriendsView, 'InFriendsList:', isInFriendsListView, 'IsShared:', isSharedView, 'ViewingFriend:', !!viewingFriendProfile);
    
    if (isInFriendsListView) {
      console.log('Exiting Friends List view');
      setIsInFriendsListView(false);
      setSelectedFriendsListItem(0);
    } else if (isInFriendsView) {
      console.log('Exiting Friends view');
      setIsInFriendsView(false);
      setSelectedFriendsItem(0);
    } else if (isInMyFiveView) {
      console.log('Exiting My Five view');
      setIsInMyFiveView(false);
      setSelectedMyFiveSong(0);
      
      // Check if we were viewing a friend's My Five
      if (viewingFriendProfile && viewingFriendSongs.length > 0) {
        console.log('Was viewing friend\'s My Five, going back to friends list');
        // Clear viewing friend state
        setViewingFriendProfile(null);
        setViewingFriendSongs([]);
        // Go back to friends list view
        setIsInFriendsListView(true);
        setIsInFriendsView(true);
        // Reload friends list to show the preview again
        loadFriendsList();
      } else if (isSharedView) {
        // Don't clear shared view state here - let route detection handle it
        console.log('Was viewing shared My Five, staying in shared context');
      } else {
        console.log('Was viewing own My Five, going back to main menu');
      }
    } else if (isInSettingsView) {
      console.log('Exiting settings view');
      setIsInSettingsView(false);
      setSelectedSettingsItem(0);
    } else if (currentScreen !== 'menu') {
      console.log('Returning to main menu from', currentScreen);
      setCurrentScreen('menu');
      setSelectedMenuItem(0);
    }
  };

  const handleSettingsItemChange = (index: number) => {
    setSelectedSettingsItem(index);
  };

  const handleMyFiveSongChange = (index: number) => {
    setSelectedMyFiveSong(index);
  };

  const handleFriendsItemChange = (index: number) => {
    setSelectedFriendsItem(index);
  };

  const handleFriendsListItemChange = (index: number) => {
    setSelectedFriendsListItem(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center md:p-4 overflow-hidden">
      <div className="relative w-full h-screen md:w-auto md:h-auto">
        {/* iPod Body - Full screen on mobile, centered on desktop */}
        <div className="bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 w-full h-full md:rounded-3xl md:p-6 shadow-2xl border border-gray-400 md:w-96 md:h-[680px] flex flex-col touch-none select-none">
          
          {/* Screen - Responsive sizing */}
          <Screen 
            currentScreen={currentScreen}
            selectedMenuItem={selectedMenuItem}
            selectedSong={selectedSong}
            isPlaying={isPlaying}
            currentTime={currentTime}
            selectedSettingsItem={selectedSettingsItem}
            isInSettingsView={isInSettingsView}
            onSettingsItemChange={handleSettingsItemChange}
            isInMyFiveView={isInMyFiveView}
            selectedMyFiveSong={selectedMyFiveSong}
            onMyFiveSongChange={handleMyFiveSongChange}
            isSharedView={isSharedView || viewingFriendSongs.length > 0}
            sharedUserProfile={viewingFriendProfile || sharedUserProfile}
            sharedUserSongs={viewingFriendSongs.length > 0 ? viewingFriendSongs : sharedUserSongs}
            isInFriendsView={isInFriendsView}
            selectedFriendsItem={selectedFriendsItem}
            onFriendsItemChange={handleFriendsItemChange}
            isInFriendsListView={isInFriendsListView}
            selectedFriendsListItem={selectedFriendsListItem}
            onFriendsListItemChange={handleFriendsListItemChange}
            friendsList={friendsList}
          />

          {/* Click Wheel - Centered in remaining space, moved up slightly on mobile */}
          <div className="flex-1 flex items-center justify-center md:items-center" style={{ alignItems: 'center', paddingBottom: '2rem' }}>
            <ClickWheel 
              onWheelMove={handleWheelMove}
              onWheelLeave={handleWheelLeave}
              onCenterClick={handleCenterClick}
              onMenuClick={handleMenuClick}
            />
          </div>
        </div>

        {/* Subtle highlight effect for sheen - only on desktop */}
        <div className="absolute top-6 left-6 right-6 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-3xl pointer-events-none hidden md:block"></div>
      </div>
    </div>
  );
};

export default IPod;
