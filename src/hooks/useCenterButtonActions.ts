
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
    console.log('CENTER BUTTON CLICKED');
    console.log('Current state:', {
      currentScreen,
      isInMyFiveView,
      isInSettingsView,
      selectedMenuItem,
      menuItems,
      selectedMyFiveSong
    });

    // Handle music screen - toggle playback
    if (currentScreen === 'music') {
      setIsPlaying(!isPlaying);
      return;
    }

    // Handle menu screen
    if (currentScreen === 'menu') {
      
      // If we're in My Five view, play the selected song
      if (isInMyFiveView) {
        console.log('In My Five view - playing song at index:', selectedMyFiveSong);
        if (isSharedView && sharedUserSongs[selectedMyFiveSong]) {
          window.open(sharedUserSongs[selectedMyFiveSong].spotifyUrl, '_blank');
        } else {
          // Dispatch event for personal songs
          const event = new CustomEvent('myFiveSongSelect', { 
            detail: { songIndex: selectedMyFiveSong } 
          });
          window.dispatchEvent(event);
        }
        return;
      }

      // If we're in settings view
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

      // Handle main menu selection
      const selectedItem = menuItems[selectedMenuItem];
      console.log('Main menu - selected item:', selectedItem);
      
      if (selectedItem === 'My Five') {
        console.log('ACTIVATING MY FIVE VIEW');
        setIsInMyFiveView(true);
        setSelectedMyFiveSong(0);
        return;
      }

      switch (selectedItem) {
        case 'Sign In':
          window.open('/signin', '_blank');
          break;
          
        case 'Friends':
          setCurrentScreen('friends');
          break;
          
        case 'Settings':
          setIsInSettingsView(true);
          setSelectedSettingsItem(0);
          break;
          
        default:
          console.log('No action for:', selectedItem);
          break;
      }
    }
  };

  return { handleCenterClick };
};
