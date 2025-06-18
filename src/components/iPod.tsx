import React, { useState, useRef, useEffect } from 'react';
import Screen from './Screen';
import ClickWheel from './ClickWheel';
import { getMenuItems, songs } from '../data/iPodData';
import { supabase } from '../integrations/supabase/client';

const IPod = () => {
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

  useEffect(() => {
    const loadMenuItems = async () => {
      const items = await getMenuItems();
      setMenuItems(items);
    };

    const loadMyFiveSongs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('user_five_songs')
            .select('*')
            .eq('user_id', user.id)
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
        }
      } catch (error) {
        console.error('Error loading my five songs count:', error);
      }
    };

    loadMenuItems();
    loadMyFiveSongs();

    // Listen for auth changes to update menu
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadMenuItems();
      loadMyFiveSongs();
    });

    return () => subscription.unsubscribe();
  }, []);

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
          // Navigate My Five songs
          const newSelection = isClockwise 
            ? (selectedMyFiveSong + 1) % Math.max(myFiveSongsCount, 1)
            : (selectedMyFiveSong - 1 + Math.max(myFiveSongsCount, 1)) % Math.max(myFiveSongsCount, 1);
          
          console.log('My Five navigation:', { currentSelection: selectedMyFiveSong, newSelection });
          setSelectedMyFiveSong(newSelection);
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
    console.log('Selected settings item:', selectedSettingsItem);
    
    if (currentScreen === 'menu') {
      if (isInMyFiveView) {
        // Handle My Five song selection - open Spotify link
        console.log('My Five song selected:', selectedMyFiveSong);
        // We need to get the song URL and open it
        // This will be handled by triggering the song click from MyFiveFullView
        const event = new CustomEvent('myFiveSongSelect', { detail: { songIndex: selectedMyFiveSong } });
        window.dispatchEvent(event);
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
          setIsInMyFiveView(true);
          setSelectedMyFiveSong(0);
        } else if (selectedItem === 'Friends') {
          console.log('Navigating to friends screen');
          setCurrentScreen('friends');
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
    console.log('Current state - Screen:', currentScreen, 'InSettings:', isInSettingsView, 'InMyFive:', isInMyFiveView);
    
    if (isInMyFiveView) {
      console.log('Exiting My Five view');
      setIsInMyFiveView(false);
      setSelectedMyFiveSong(0);
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
