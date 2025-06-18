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
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const loadMenuItems = async () => {
      const items = await getMenuItems();
      setMenuItems(items);
      setIsAuthLoading(false);
    };

    // Check initial session
    const checkInitialSession = async () => {
      await loadMenuItems();
    };

    checkInitialSession();

    // Listen for auth changes to update menu
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      await loadMenuItems();
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
        const newSelection = isClockwise 
          ? (selectedMenuItem + 1) % menuItems.length
          : (selectedMenuItem - 1 + menuItems.length) % menuItems.length;
        
        console.log('Menu navigation:', { currentSelection: selectedMenuItem, newSelection, selectedItem: menuItems[newSelection] });
        setSelectedMenuItem(newSelection);
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

  const handleCenterClick = () => {
    console.log('Center button clicked!');
    console.log('Current screen:', currentScreen);
    console.log('Selected menu item:', selectedMenuItem);
    console.log('Selected menu item name:', menuItems[selectedMenuItem]);
    
    if (currentScreen === 'menu') {
      const selectedItem = menuItems[selectedMenuItem];
      if (selectedItem === 'Sign In') {
        console.log('Attempting to open sign-in page...');
        // Open sign-in page in a new tab/window
        const newWindow = window.open('/signin', '_blank');
        console.log('Window opened:', newWindow);
      } else if (selectedItem === 'My Five') {
        console.log('My Five clicked');
        // Future functionality for My Five feature
      } else if (selectedItem === 'Friends') {
        console.log('Navigating to friends screen');
        setCurrentScreen('friends');
      } else if (selectedItem === 'Settings') {
        console.log('Navigating to settings screen');
        setCurrentScreen('settings');
      } else {
        setIsPlaying(!isPlaying);
      }
    } else if (currentScreen === 'music') {
      setIsPlaying(!isPlaying);
    }
  };

  const handleMenuClick = () => {
    console.log('Menu button clicked - returning to main menu');
    setCurrentScreen('menu');
    setSelectedMenuItem(0); // Reset to first menu item
  };

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

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
