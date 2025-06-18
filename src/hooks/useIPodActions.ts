
import { supabase } from '../integrations/supabase/client';

interface UseIPodActionsProps {
  currentScreen: string;
  isInMyFiveView: boolean;
  isInSettingsView: boolean;
  selectedMenuItem: number;
  selectedSettingsItem: number;
  selectedMyFiveSong: number;
  menuItems: string[];
  isPlaying: boolean;
  isSharedView: boolean;
  setIsPlaying: (playing: boolean) => void;
  setCurrentScreen: (screen: string) => void;
  setIsInMyFiveView: (inView: boolean) => void;
  setSelectedMyFiveSong: (index: number) => void;
  setIsInSettingsView: (inView: boolean) => void;
  setSelectedSettingsItem: (index: number) => void;
  setSelectedMenuItem: (index: number) => void;
}

export const useIPodActions = ({
  currentScreen,
  isInMyFiveView,
  isInSettingsView,
  selectedMenuItem,
  selectedSettingsItem,
  selectedMyFiveSong,
  menuItems,
  isPlaying,
  isSharedView,
  setIsPlaying,
  setCurrentScreen,
  setIsInMyFiveView,
  setSelectedMyFiveSong,
  setIsInSettingsView,
  setSelectedSettingsItem,
  setSelectedMenuItem
}: UseIPodActionsProps) => {
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
      setSelectedMenuItem(0);
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
          setSelectedMenuItem(0);
        }
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const handleEditAccount = () => {
    window.location.href = '/signin?mode=edit';
  };

  const handleEditMyFive = () => {
    window.location.href = '/edit-my-five';
  };

  const handleCenterClick = () => {
    console.log('Center button clicked!');
    console.log('Current screen:', currentScreen);
    console.log('Selected menu item:', selectedMenuItem);
    console.log('Selected menu item name:', menuItems[selectedMenuItem]);
    console.log('Is in settings view:', isInSettingsView);
    console.log('Is in My Five view:', isInMyFiveView);
    console.log('Selected settings item:', selectedSettingsItem);
    
    if (currentScreen === 'menu') {
      if (isInMyFiveView) {
        console.log('My Five song selected:', selectedMyFiveSong);
        const event = new CustomEvent('myFiveSongSelect', { detail: { songIndex: selectedMyFiveSong } });
        window.dispatchEvent(event);
      } else if (isInSettingsView && !isSharedView) {
        const settingsItems = ['Share Profile', 'Edit Account', 'Edit My Five', 'Logout', 'Delete Account'];
        const selectedSettingsAction = settingsItems[selectedSettingsItem];
        console.log('Settings action selected:', selectedSettingsAction);
        
        switch (selectedSettingsAction) {
          case 'Share Profile':
            handleShareProfile();
            break;
          case 'Edit Account':
            handleEditAccount();
            break;
          case 'Edit My Five':
            handleEditMyFive();
            break;
          case 'Logout':
            handleLogout();
            break;
          case 'Delete Account':
            handleDeleteAccount();
            break;
          default:
            console.log('Settings action not implemented:', selectedSettingsAction);
            break;
        }
      } else {
        const selectedItem = menuItems[selectedMenuItem];
        if (selectedItem === 'Sign In') {
          console.log('Attempting to open sign-in page...');
          const newWindow = window.open('/signin', '_blank');
          console.log('Window opened:', newWindow);
        } else if (selectedItem === 'My Five') {
          console.log('Entering My Five view');
          setIsInMyFiveView(true);
          setSelectedMyFiveSong(0);
        } else if (selectedItem === 'Friends' && !isSharedView) {
          console.log('Navigating to friends screen');
          setCurrentScreen('friends');
        } else if (selectedItem === 'Settings' && !isSharedView) {
          console.log('Entering settings view');
          setIsInSettingsView(true);
          setSelectedSettingsItem(0);
        } else {
          setIsPlaying(!isPlaying);
        }
      }
    } else if (currentScreen === 'music') {
      setIsPlaying(!isPlaying);
    }
  };

  const handleMenuClick = () => {
    console.log('Menu button clicked');
    console.log('Current state - Screen:', currentScreen, 'InSettings:', isInSettingsView, 'InMyFive:', isInMyFiveView);
    
    if (isInMyFiveView) {
      console.log('Exiting My Five view');
      setIsInMyFiveView(false);
      setSelectedMyFiveSong(0);
    } else if (isInSettingsView) {
      console.log('Exiting settings view');
      setIsInSettingsView(false);
      setSelectedSettingsItem(0);
    } else if (currentScreen !== 'menu') {
      console.log('Returning to main menu from', currentScreen);
      setCurrentScreen('menu');
      setSelectedMenuItem(0);
    }
  };

  return {
    handleCenterClick,
    handleMenuClick
  };
};
