
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

  const handleSignInClick = () => {
    const choice = window.confirm('New to FivePod? Click OK to sign up, or Cancel to sign in with an existing account.');
    if (choice) {
      // User chose to sign up (new user)
      window.open('/signin', '_blank');
    } else {
      // User chose to sign in (existing user)
      window.open('/signin?mode=login', '_blank');
    }
  };

  const handleCenterClick = () => {
    if (currentScreen === 'menu') {
      if (isInMyFiveView) {
        if (isSharedView && sharedUserSongs[selectedMyFiveSong]) {
          window.open(sharedUserSongs[selectedMyFiveSong].spotifyUrl, '_blank');
        } else {
          const event = new CustomEvent('myFiveSongSelect', { detail: { songIndex: selectedMyFiveSong } });
          window.dispatchEvent(event);
        }
      } else if (isInSettingsView) {
        const settingsItems = ['Share Profile', 'Edit Account', 'Edit My Five', 'Logout', 'Delete Account'];
        const selectedSettingsAction = settingsItems[selectedSettingsItem];
        
        switch (selectedSettingsAction) {
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
      } else {
        const selectedItem = menuItems[selectedMenuItem];
        if (selectedItem === 'Sign In') {
          handleSignInClick();
        } else if (selectedItem === 'My Five') {
          setIsInMyFiveView(true);
          setSelectedMyFiveSong(0);
        } else if (selectedItem === 'Friends') {
          setCurrentScreen('friends');
        } else if (selectedItem === 'Settings') {
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

  return { handleCenterClick };
};
