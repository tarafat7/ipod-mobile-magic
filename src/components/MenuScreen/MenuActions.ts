
import { supabase } from '../../integrations/supabase/client';

export class MenuActions {
  static async handleShareProfile() {
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
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  }

  static handleProductFeedback() {
    window.open('https://app.formbricks.com/s/cmc2iwfd7d33uu2017tjqmhji', '_blank');
  }

  static async handleDeleteAccount() {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log('Deleting account for user:', user.id);
          
          // Delete from user_five_songs table
          const { error: songsError } = await supabase
            .from('user_five_songs')
            .delete()
            .eq('user_id', user.id);
          
          if (songsError) {
            console.error('Error deleting user songs:', songsError);
          }
          
          // Delete from friends table (both as user and as friend)
          const { error: friendsError1 } = await supabase
            .from('friends')
            .delete()
            .eq('user_id', user.id);
            
          if (friendsError1) {
            console.error('Error deleting user friends:', friendsError1);
          }
          
          const { error: friendsError2 } = await supabase
            .from('friends')
            .delete()
            .eq('friend_user_id', user.id);
            
          if (friendsError2) {
            console.error('Error deleting friend relationships:', friendsError2);
          }
          
          // Delete from profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', user.id);
            
          if (profileError) {
            console.error('Error deleting user profile:', profileError);
          }
          
          // Finally sign out the user
          await supabase.auth.signOut();
          
          console.log('Account deletion completed');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  }
}
