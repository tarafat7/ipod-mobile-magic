
import { useState } from 'react';

interface UseWheelNavigationProps {
  currentScreen: string;
  isInMyFiveView: boolean;
  isInSettingsView: boolean;
  isSharedView: boolean;
  selectedMenuItem: number;
  selectedSong: number;
  selectedSettingsItem: number;
  selectedMyFiveSong: number;
  menuItems: string[];
  myFiveSongsCount: number;
  sharedUserSongs: any[];
  setSelectedMenuItem: (index: number) => void;
  setSelectedSong: (index: number) => void;
  setSelectedSettingsItem: (index: number) => void;
  setSelectedMyFiveSong: (index: number) => void;
}

export const useWheelNavigation = ({
  currentScreen,
  isInMyFiveView,
  isInSettingsView,
  isSharedView,
  selectedMenuItem,
  selectedSong,
  selectedSettingsItem,
  selectedMyFiveSong,
  menuItems,
  myFiveSongsCount,
  sharedUserSongs,
  setSelectedMenuItem,
  setSelectedSong,
  setSelectedSettingsItem,
  setSelectedMyFiveSong
}: UseWheelNavigationProps) => {
  const [lastAngle, setLastAngle] = useState<number | null>(null);

  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
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
      
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
      
      const threshold = 15;
      if (Math.abs(angleDiff) < threshold) {
        return;
      }
      
      triggerHapticFeedback();
      
      const isClockwise = angleDiff > 0;
      
      if (currentScreen === 'menu') {
        if (isInMyFiveView) {
          const songsCount = isSharedView ? sharedUserSongs.length : myFiveSongsCount;
          const newSelection = isClockwise 
            ? (selectedMyFiveSong + 1) % Math.max(songsCount, 1)
            : (selectedMyFiveSong - 1 + Math.max(songsCount, 1)) % Math.max(songsCount, 1);
          
          setSelectedMyFiveSong(newSelection);
        } else if (isInSettingsView) {
          const settingsItemsCount = 5;
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
          ? (selectedSong + 1) % 5 // songs.length
          : (selectedSong - 1 + 5) % 5;
        
        setSelectedSong(newSelection);
      }
    }
    
    setLastAngle(normalizedAngle);
  };

  const handleWheelLeave = () => {
    setLastAngle(null);
  };

  return {
    handleWheelMove,
    handleWheelLeave
  };
};
