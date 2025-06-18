
import { useCallback, useRef } from 'react';

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

  const lastAngleRef = useRef<number | null>(null);
  const isNavigatingRef = useRef(false);

  const handleWheelMove = useCallback((e: React.MouseEvent) => {
    // Prevent multiple rapid navigation calls
    if (isNavigatingRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    const angle = Math.atan2(deltaY, deltaX);
    const normalizedAngle = ((angle + Math.PI * 2) % (Math.PI * 2));
    
    // Only proceed if we have a previous angle to compare to
    if (lastAngleRef.current === null) {
      lastAngleRef.current = normalizedAngle;
      return;
    }
    
    // Calculate angular difference
    let angleDiff = normalizedAngle - lastAngleRef.current;
    if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    
    // Only navigate if the angle difference is significant enough
    const threshold = 0.3; // Adjust this value to make navigation more/less sensitive
    if (Math.abs(angleDiff) < threshold) return;
    
    isNavigatingRef.current = true;
    
    const isClockwise = angleDiff > 0;
    
    console.log('Wheel navigation - clockwise:', isClockwise, 'currentScreen:', currentScreen, 'isInMyFiveView:', isInMyFiveView);

    if (currentScreen === 'menu') {
      if (isInMyFiveView) {
        // In My Five view - navigate through songs
        const songsCount = isSharedView ? sharedUserSongs.length : myFiveSongsCount;
        console.log('My Five navigation - songsCount:', songsCount, 'currentIndex:', selectedMyFiveSong);
        
        if (isClockwise && songsCount > 0) {
          const newIndex = (selectedMyFiveSong + 1) % songsCount;
          console.log('Moving to next song:', newIndex);
          setSelectedMyFiveSong(newIndex);
        } else if (!isClockwise && songsCount > 0) {
          const newIndex = (selectedMyFiveSong - 1 + songsCount) % songsCount;
          console.log('Moving to previous song:', newIndex);
          setSelectedMyFiveSong(newIndex);
        }
      } else if (isInSettingsView) {
        // In Settings view - navigate through settings
        const settingsCount = 5; // Share Profile, Edit Account, Edit My Five, Logout, Delete Account
        if (isClockwise) {
          setSelectedSettingsItem((selectedSettingsItem + 1) % settingsCount);
        } else {
          setSelectedSettingsItem((selectedSettingsItem - 1 + settingsCount) % settingsCount);
        }
      } else {
        // In main menu - navigate through menu items
        console.log('Main menu navigation - menuItems.length:', menuItems.length, 'currentIndex:', selectedMenuItem);
        if (isClockwise && menuItems.length > 0) {
          const newIndex = (selectedMenuItem + 1) % menuItems.length;
          console.log('Moving to next menu item:', newIndex);
          setSelectedMenuItem(newIndex);
        } else if (!isClockwise && menuItems.length > 0) {
          const newIndex = (selectedMenuItem - 1 + menuItems.length) % menuItems.length;
          console.log('Moving to previous menu item:', newIndex);
          setSelectedMenuItem(newIndex);
        }
      }
    } else if (currentScreen === 'music') {
      // Music screen navigation
      const totalSongs = 10; // Default song count
      if (isClockwise) {
        setSelectedSong((selectedSong + 1) % totalSongs);
      } else {
        setSelectedSong((selectedSong - 1 + totalSongs) % totalSongs);
      }
    }
    
    lastAngleRef.current = normalizedAngle;
    
    // Reset navigation flag after a short delay
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 100);
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
    lastAngleRef.current = null;
    isNavigatingRef.current = false;
  }, []);

  return { handleWheelMove, handleWheelLeave };
};
