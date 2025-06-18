import React, { useState, useRef } from 'react';
import Screen from './Screen';
import ClickWheel from './ClickWheel';
import { menuItems, songs } from '../data/iPodData';

const IPod = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [selectedMenuItem, setSelectedMenuItem] = useState(0);
  const [selectedSong, setSelectedSong] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [lastAngle, setLastAngle] = useState<number | null>(null);

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
      
      // Determine direction: positive = clockwise, negative = counter-clockwise
      const isClockwise = angleDiff > 0;
      
      if (currentScreen === 'menu') {
        const newSelection = isClockwise 
          ? (selectedMenuItem + 1) % menuItems.length
          : (selectedMenuItem - 1 + menuItems.length) % menuItems.length;
        
        if (newSelection !== selectedMenuItem) {
          triggerHapticFeedback();
          setSelectedMenuItem(newSelection);
        }
      } else if (currentScreen === 'music') {
        const newSelection = isClockwise 
          ? (selectedSong + 1) % songs.length
          : (selectedSong - 1 + songs.length) % songs.length;
        
        if (newSelection !== selectedSong) {
          triggerHapticFeedback();
          setSelectedSong(newSelection);
        }
      }
    }
    
    setLastAngle(normalizedAngle);
  };

  const handleWheelLeave = () => {
    setLastAngle(null);
  };

  const handleCenterClick = () => {
    if (currentScreen === 'menu') {
      if (selectedMenuItem === 1) { // Music
        setCurrentScreen('music');
        setSelectedSong(0); // Reset to first song when entering music
      } else {
        setIsPlaying(!isPlaying);
      }
    } else if (currentScreen === 'music') {
      setIsPlaying(!isPlaying);
    }
  };

  const handleMenuClick = () => {
    setCurrentScreen('menu');
    setSelectedMenuItem(0); // Reset to first menu item
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
