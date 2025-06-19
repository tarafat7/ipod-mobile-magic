
interface NavigationState {
  currentScreen: string;
  isInMyFiveView: boolean;
  isInFriendsListView: boolean;
  isInFriendsView: boolean;
  isInSettingsView: boolean;
  isSharedView: boolean;
  viewingFriendSongs: any[];
  sharedUserSongs: any[];
  myFiveSongsCount: number;
  friendsList: any[];
  selectedMyFiveSong: number;
  selectedFriendsListItem: number;
  selectedFriendsItem: number;
  selectedSettingsItem: number;
  selectedMenuItem: number;
  selectedSong: number;
  menuItems: string[];
}

export const useIPodNavigation = (
  state: NavigationState,
  setters: {
    setSelectedMyFiveSong: (value: number) => void;
    setSelectedFriendsListItem: (value: number) => void;
    setSelectedFriendsItem: (value: number) => void;
    setSelectedSettingsItem: (value: number) => void;
    setSelectedMenuItem: (value: number) => void;
    setSelectedSong: (value: number) => void;
  }
) => {
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleWheelMove = (e: React.MouseEvent, lastAngle: number | null, setLastAngle: (angle: number | null) => void) => {
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
      
      if (state.currentScreen === 'menu') {
        if (state.isInMyFiveView) {
          let songsCount;
          if (state.viewingFriendSongs.length > 0) {
            songsCount = state.viewingFriendSongs.length;
          } else if (state.isSharedView) {
            songsCount = state.sharedUserSongs.length;
          } else {
            songsCount = state.myFiveSongsCount;
          }
          
          const newSelection = isClockwise 
            ? (state.selectedMyFiveSong + 1) % Math.max(songsCount, 1)
            : (state.selectedMyFiveSong - 1 + Math.max(songsCount, 1)) % Math.max(songsCount, 1);
          
          console.log('My Five navigation:', { currentSelection: state.selectedMyFiveSong, newSelection });
          setters.setSelectedMyFiveSong(newSelection);
        } else if (state.isInFriendsListView) {
          const newSelection = isClockwise 
            ? (state.selectedFriendsListItem + 1) % Math.max(state.friendsList.length, 1)
            : (state.selectedFriendsListItem - 1 + Math.max(state.friendsList.length, 1)) % Math.max(state.friendsList.length, 1);
          
          console.log('Friends list navigation:', { currentSelection: state.selectedFriendsListItem, newSelection });
          setters.setSelectedFriendsListItem(newSelection);
        } else if (state.isInFriendsView) {
          const friendsItemsCount = 2;
          const newSelection = isClockwise 
            ? (state.selectedFriendsItem + 1) % friendsItemsCount
            : (state.selectedFriendsItem - 1 + friendsItemsCount) % friendsItemsCount;
          
          console.log('Friends navigation:', { currentSelection: state.selectedFriendsItem, newSelection });
          setters.setSelectedFriendsItem(newSelection);
        } else if (state.isInSettingsView) {
          const settingsItemsCount = 6;
          const newSelection = isClockwise 
            ? (state.selectedSettingsItem + 1) % settingsItemsCount
            : (state.selectedSettingsItem - 1 + settingsItemsCount) % settingsItemsCount;
          
          console.log('Settings navigation:', { currentSelection: state.selectedSettingsItem, newSelection });
          setters.setSelectedSettingsItem(newSelection);
        } else {
          const newSelection = isClockwise 
            ? (state.selectedMenuItem + 1) % state.menuItems.length
            : (state.selectedMenuItem - 1 + state.menuItems.length) % state.menuItems.length;
          
          console.log('Menu navigation:', { currentSelection: state.selectedMenuItem, newSelection, selectedItem: state.menuItems[newSelection] });
          setters.setSelectedMenuItem(newSelection);
        }
      } else if (state.currentScreen === 'music') {
        const newSelection = isClockwise 
          ? (state.selectedSong + 1) % 10 // Assuming 10 songs, adjust as needed
          : (state.selectedSong - 1 + 10) % 10;
        
        setters.setSelectedSong(newSelection);
      }
    }
    
    setLastAngle(normalizedAngle);
  };

  return {
    handleWheelMove,
    triggerHapticFeedback
  };
};
