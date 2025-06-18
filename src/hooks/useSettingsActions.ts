
import { supabase } from '../integrations/supabase/client';

export const useSettingsActions = () => {
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

  const handleEditAccount = () => {
    window.location.href = '/signin?mode=edit';
  };

  const handleEditMyFive = () => {
    window.location.href = '/edit-my-five';
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
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
        }
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const handleSettingsAction = async (action: string) => {
    switch (action) {
      case 'Share Profile':
        await handleShareProfile();
        break;
      case 'Edit Account':
        handleEditAccount();
        break;
      case 'Edit My Five':
        handleEditMyFive();
        break;
      case 'Logout':
        await handleLogout();
        break;
      case 'Delete Account':
        await handleDeleteAccount();
        break;
      default:
        break;
    }
  };

  return {
    handleSettingsAction
  };
};
