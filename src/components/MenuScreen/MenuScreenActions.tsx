
import { supabase } from '../../integrations/supabase/client';

export class MenuScreenActions {
  static async handleLogout() {
    await supabase.auth.signOut();
  }

  static async handleDeleteAccount() {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Delete user profile first
          await supabase.from('profiles').delete().eq('id', user.id);
          // Then sign out
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  }

  static handleEditAccount() {
    window.location.href = '/sign-in?mode=edit';
  }

  static handleEditMyFive() {
    window.location.href = '/edit-my-five';
  }

  static handleSettingsAction(item: string) {
    switch (item) {
      case 'Edit Account':
        MenuScreenActions.handleEditAccount();
        break;
      case 'Edit My Five':
        MenuScreenActions.handleEditMyFive();
        break;
      case 'Logout':
        MenuScreenActions.handleLogout();
        break;
      case 'Delete Account':
        MenuScreenActions.handleDeleteAccount();
        break;
      default:
        // Handle other actions later
        break;
    }
  }

  static handleDailyDropAction(item: string) {
    switch (item) {
      case "Today's Prompt":
        console.log('Today\'s Prompt selected');
        // TODO: Implement Today's Prompt functionality
        break;
      case 'Add a Song':
        console.log('Add a Song selected');
        // TODO: Implement Add a Song functionality
        break;
      case 'View Today\'s Playlist':
        console.log('View Today\'s Playlist selected');
        // TODO: Implement View Today's Playlist functionality
        break;
      default:
        break;
    }
  }
}
