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
  const wheelRef = useRef<HTMLDivElement>(null);

  const handleWheelMove = (e: React.MouseEvent) => {
    if (!wheelRef.current) return;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    
    const normalizedAngle = ((angle * 180) / Math.PI + 360) % 360;
    
    if (currentScreen === 'menu') {
      const newIndex = Math.floor((normalizedAngle / 360) * menuItems.length);
      setSelectedMenuItem(newIndex);
    } else if (currentScreen === 'music') {
      const newIndex = Math.floor((normalizedAngle / 360) * songs.length);
      setSelectedSong(newIndex);
    }
  };

  const handleCenterClick = () => {
    if (currentScreen === 'menu') {
      if (selectedMenuItem === 1) { // Music
        setCurrentScreen('music');
      } else {
        setIsPlaying(!isPlaying);
      }
    } else if (currentScreen === 'music') {
      setIsPlaying(!isPlaying);
    }
  };

  const handleMenuClick = () => {
    if (currentScreen !== 'menu') {
      setCurrentScreen('menu');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center md:p-4">
      <div className="relative w-full h-screen md:w-auto md:h-auto">
        {/* iPod Body - Full screen on mobile, centered on desktop */}
        <div className="bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 w-full h-full md:rounded-3xl md:p-6 shadow-2xl border border-gray-400 md:w-96 md:h-[680px] flex flex-col">
          
          {/* Screen - Responsive sizing */}
          <Screen 
            currentScreen={currentScreen}
            selectedMenuItem={selectedMenuItem}
            selectedSong={selectedSong}
            isPlaying={isPlaying}
            currentTime={currentTime}
          />

          {/* Click Wheel - Responsive sizing and positioning */}
          <ClickWheel 
            onWheelMove={handleWheelMove}
            onCenterClick={handleCenterClick}
            onMenuClick={handleMenuClick}
          />
        </div>

        {/* Subtle highlight effect for sheen - only on desktop */}
        <div className="absolute top-6 left-6 right-6 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-3xl pointer-events-none hidden md:block"></div>
      </div>
    </div>
  );
};

export default IPod;
