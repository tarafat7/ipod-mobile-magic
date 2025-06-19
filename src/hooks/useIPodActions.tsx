
import { supabase } from '../integrations/supabase/client';

interface SpotifyTrackInfo {
  name: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
  addedDate: string;
}

export const useIPodActions = () => {
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

  const handleLogout = async (resetFunctions: Array<() => void>) => {
    try {
      await supabase.auth.signOut();
      resetFunctions.forEach(fn => fn());
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleDeleteAccount = async (resetFunctions: Array<() => void>) => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').delete().eq('id', user.id);
          await supabase.auth.signOut();
          resetFunctions.forEach(fn => fn());
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

  const handleSongPlay = (
    songIndex: number,
    viewingFriendSongs: SpotifyTrackInfo[],
    sharedUserSongs: SpotifyTrackInfo[],
    isSharedView: boolean
  ) => {
    let songToPlay = null;
    if (viewingFriendSongs.length > 0) {
      songToPlay = viewingFriendSongs[songIndex];
    } else if (isSharedView && sharedUserSongs[songIndex]) {
      songToPlay = sharedUserSongs[songIndex];
    }
    
    if (songToPlay) {
      window.open(songToPlay.spotifyUrl, '_blank');
    } else {
      const event = new CustomEvent('myFiveSongSelect', { detail: { songIndex } });
      window.dispatchEvent(event);
    }
  };

  return {
    handleShareProfile,
    handleLogout,
    handleDeleteAccount,
    handleEditAccount,
    handleEditMyFive,
    handleSongPlay
  };
};
