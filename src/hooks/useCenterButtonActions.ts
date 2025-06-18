
import { supabase } from '../integrations/supabase/client';

interface UseCenterButtonActionsProps {
  currentScreen: string;
  isInMyFiveView: boolean;
  isInSettingsView: boolean;
  isSharedView: boolean;
  selectedMenuItem: number;
  selectedSettingsItem: number;
  selectedMyFiveSong: number;
  menuItems: string[];
  sharedUserSongs: any[];
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  setIsInMyFiveView: (inView: boolean) => void;
  setCurrentScreen: (screen: string) => void;
  setIsInSettingsView: (inView: boolean) => void;
  setSelectedSettingsItem: (index: number) => void;
  setSelectedMyFiveSong: (index: number) => void;
}

export const useCenterButtonActions = ({
  currentScreen,
  isInMyFiveView,
  isInSettingsView,
  isSharedView,
  selectedMenuItem,
  selectedSettingsItem,
  selectedMyFiveSong,
  menuItems,
  sharedUserSongs,
  isPlaying,
  setIsPlaying,
  setIsInMyFiveView,
  setCurrentScreen,
  setIsInSettingsView,
  setSelectedSettingsItem,
  setSelectedMyFiveSong
}: UseCenterButtonActionsProps) => {

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
      setIsInSettingsView(false);
      setSelectedSettingsItem(0);
      setCurrentScreen('menu');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').delete().eq('id', user.id);
          await supabase.auth.signOut();
          setIsInSettingsView(false);
          setSelectedSettingsItem(0);
          setCurrentScreen('menu');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const handleCenterClick = () => {
    console.log('Center button clicked');
    console.log('Current state:', {
      currentScreen,
      isInMyFiveView,
      isInSettingsView,
      isSharedView,
      selectedMenuItem,
      selectedSettingsItem,
      selectedMyFiveSong
    });

    // Handle music screen
    if (currentScreen === 'music') {
      setIsPlaying(!isPlaying);
      return;
    }

    // Handle menu screen
    if (currentScreen === 'menu') {
      
      // Handle My Five full view - song selection
      if (isInMyFiveView) {
        console.log('In My Five view, selecting song at index:', selectedMyFiveSong);
        
        if (isSharedView && sharedUserSongs[selectedMyFiveSong]) {
          // Open shared song in new tab
          window.open(sharedUserSongs[selectedMyFiveSong].spotifyUrl, '_blank');
        } else {
          // Dispatch event for user's own songs
          const event = new CustomEvent('myFiveSongSelect', { 
            detail: { songIndex: selectedMyFiveSong } 
          });
          window.dispatchEvent(event);
        }
        return;
      }

      // Handle Settings view
      if (isInSettingsView) {
        const settingsItems = ['Share Profile', 'Edit Account', 'Edit My Five', 'Logout', 'Delete Account'];
        const selectedAction = settingsItems[selectedSettingsItem];
        
        console.log('Settings action selected:', selectedAction);
        
        switch (selectedAction) {
          case 'Share Profile':
            handleShareProfile();
            break;
          case 'Edit Account':
            window.location.href = '/signin?mode=edit';
            break;
          case 'Edit My Five':
            window.location.href = '/edit-my-five';
            break;
          case 'Logout':
            handleLogout();
            break;
          case 'Delete Account':
            handleDeleteAccount();
            break;
        }
        return;
      }

      // Handle main menu items
      const selectedItem = menuItems[selectedMenuItem];
      console.log('Main menu item selected:', selectedItem);
      
      switch (selectedItem) {
        case 'Sign In':
          window.open('/signin', '_blank');
          break;
          
        case 'My Five':
          console.log('Navigating to My Five view');
          setIsInMyFiveView(true);
          setSelectedMyFiveSong(0);
          break;
          
        case 'Friends':
          setCurrentScreen('friends');
          break;
          
        case 'Settings':
          setIsInSettingsView(true);
          setSelectedSettingsItem(0);
          break;
          
        default:
          // For other menu items, toggle play state
          setIsPlaying(!isPlaying);
          break;
      }
    }
  };

  return { handleCenterClick };
};
