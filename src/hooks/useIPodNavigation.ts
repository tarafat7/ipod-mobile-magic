
import { songs } from '../data/iPodData';

interface UseIPodNavigationProps {
  currentScreen: string;
  isInMyFiveView: boolean;
  isInSettingsView: boolean;
  selectedMenuItem: number;
  selectedSong: number;
  selectedSettingsItem: number;
  selectedMyFiveSong: number;
  menuItems: string[];
  myFiveSongsCount: number;
  isSharedView: boolean;
  sharedUserSongs: string[];
  setSelectedMenuItem: (index: number) => void;
  setSelectedSong: (index: number) => void;
  setSelectedSettingsItem: (index: number) => void;
  setSelectedMyFiveSong: (index: number) => void;
  setLastAngle: (angle: number | null) => void;
}

export const useIPodNavigation = ({
  currentScreen,
  isInMyFiveView,
  isInSettingsView,
  selectedMenuItem,
  selectedSong,
  selectedSettingsItem,
  selectedMyFiveSong,
  menuItems,
  myFiveSongsCount,
  isSharedView,
  sharedUserSongs,
  setSelectedMenuItem,
  setSelectedSong,
  setSelectedSettingsItem,
  setSelectedMyFiveSong,
  setLastAngle
}: UseIPodNavigationProps) => {
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
    
    setLastAngle((lastAngle) => {
      if (lastAngle !== null) {
        let angleDiff = normalizedAngle - lastAngle;
        
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;
        
        const threshold = 15;
        if (Math.abs(angleDiff) < threshold) {
          return normalizedAngle;
        }
        
        triggerHapticFeedback();
        
        const isClockwise = angleDiff > 0;
        
        if (currentScreen === 'menu') {
          if (isInMyFiveView) {
            const songsCount = isSharedView ? sharedUserSongs.length : myFiveSongsCount;
            const newSelection = isClockwise 
              ? (selectedMyFiveSong + 1) % Math.max(songsCount, 1)
              : (selectedMyFiveSong - 1 + Math.max(songsCount, 1)) % Math.max(songsCount, 1);
            
            console.log('My Five navigation:', { currentSelection: selectedMyFiveSong, newSelection });
            setSelectedMyFiveSong(newSelection);
          } else if (isInSettingsView && !isSharedView) {
            const settingsItemsCount = 5;
            const newSelection = isClockwise 
              ? (selectedSettingsItem + 1) % settingsItemsCount
              : (selectedSettingsItem - 1 + settingsItemsCount) % settingsItemsCount;
            
            console.log('Settings navigation:', { currentSelection: selectedSettingsItem, newSelection });
            setSelectedSettingsItem(newSelection);
          } else {
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
      
      return normalizedAngle;
    });
  };

  const handleWheelLeave = () => {
    setLastAngle(null);
  };

  return {
    handleWheelMove,
    handleWheelLeave
  };
};
