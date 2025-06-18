
import { useCallback } from 'react';

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

  const handleWheelMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    const angle = Math.atan2(deltaY, deltaX);
    const normalizedAngle = ((angle + Math.PI * 2) % (Math.PI * 2));
    
    let direction: 'up' | 'down' | 'left' | 'right';
    
    if (normalizedAngle >= 7 * Math.PI / 4 || normalizedAngle < Math.PI / 4) {
      direction = 'right';
    } else if (normalizedAngle >= Math.PI / 4 && normalizedAngle < 3 * Math.PI / 4) {
      direction = 'down';
    } else if (normalizedAngle >= 3 * Math.PI / 4 && normalizedAngle < 5 * Math.PI / 4) {
      direction = 'left';
    } else {
      direction = 'up';
    }

    console.log('Wheel navigation - direction:', direction, 'currentScreen:', currentScreen, 'isInMyFiveView:', isInMyFiveView);

    if (currentScreen === 'menu') {
      if (isInMyFiveView) {
        // In My Five view - navigate through songs
        const songsCount = isSharedView ? sharedUserSongs.length : myFiveSongsCount;
        console.log('My Five navigation - songsCount:', songsCount, 'currentIndex:', selectedMyFiveSong);
        
        if (direction === 'down') {
          const newIndex = (selectedMyFiveSong + 1) % songsCount;
          console.log('Moving to next song:', newIndex);
          setSelectedMyFiveSong(newIndex);
        } else if (direction === 'up') {
          const newIndex = (selectedMyFiveSong - 1 + songsCount) % songsCount;
          console.log('Moving to previous song:', newIndex);
          setSelectedMyFiveSong(newIndex);
        }
      } else if (isInSettingsView) {
        // In Settings view - navigate through settings
        const settingsCount = 5; // Share Profile, Edit Account, Edit My Five, Logout, Delete Account
        if (direction === 'down') {
          setSelectedSettingsItem((selectedSettingsItem + 1) % settingsCount);
        } else if (direction === 'up') {
          setSelectedSettingsItem((selectedSettingsItem - 1 + settingsCount) % settingsCount);
        }
      } else {
        // In main menu - navigate through menu items
        console.log('Main menu navigation - menuItems.length:', menuItems.length, 'currentIndex:', selectedMenuItem);
        if (direction === 'down') {
          const newIndex = (selectedMenuItem + 1) % menuItems.length;
          console.log('Moving to next menu item:', newIndex);
          setSelectedMenuItem(newIndex);
        } else if (direction === 'up') {
          const newIndex = (selectedMenuItem - 1 + menuItems.length) % menuItems.length;
          console.log('Moving to previous menu item:', newIndex);
          setSelectedMenuItem(newIndex);
        }
      }
    } else if (currentScreen === 'music') {
      // Music screen navigation
      const totalSongs = 10; // Default song count
      if (direction === 'down') {
        setSelectedSong((selectedSong + 1) % totalSongs);
      } else if (direction === 'up') {
        setSelectedSong((selectedSong - 1 + totalSongs) % totalSongs);
      }
    }
  }, [
    currentScreen,
    isInMyFiveView,
    isInSettingsView,
    isSharedView,
    selectedMenuItem,
    selectedSong,
    selectedSettingsItem,
    selectedMyFiveSong,
    menuItems.length,
    myFiveSongsCount,
    sharedUserSongs.length,
    setSelectedMenuItem,
    setSelectedSong,
    setSelectedSettingsItem,
    setSelectedMyFiveSong
  ]);

  const handleWheelLeave = useCallback(() => {
    // Handle wheel leave if needed
  }, []);

  return { handleWheelMove, handleWheelLeave };
};
