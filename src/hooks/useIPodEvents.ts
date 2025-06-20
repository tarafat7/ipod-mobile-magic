
import { useEffect } from 'react';

interface IPodEventsProps {
  currentUser: any;
  myFiveSongsCount: number;
  setMyFiveSongsCount: (count: number) => void;
  selectedMyFiveSong: number;
  isSharedView: boolean;
  sharedUserSongs: any[];
  viewingFriendSongs: any[];
  handleEditMyFive: () => void;
}

export const useIPodEvents = ({
  currentUser,
  myFiveSongsCount,
  setMyFiveSongsCount,
  selectedMyFiveSong,
  isSharedView,
  sharedUserSongs,
  viewingFriendSongs,
  handleEditMyFive
}: IPodEventsProps) => {
  useEffect(() => {
    const handleMyFiveSongSelect = (event: CustomEvent) => {
      const { songIndex } = event.detail;
      console.log('My Five song selected via event:', songIndex);
    };

    window.addEventListener('myFiveSongSelect', handleMyFiveSongSelect as EventListener);
    
    return () => {
      window.removeEventListener('myFiveSongSelect', handleMyFiveSongSelect as EventListener);
    };
  }, []);

  const handleSongPlay = () => {
    const hasEditButton = !isSharedView && viewingFriendSongs.length === 0 && currentUser;
    
    if (hasEditButton && selectedMyFiveSong === 0 && myFiveSongsCount === 0) {
      handleEditMyFive();
      return;
    } else if (hasEditButton && selectedMyFiveSong === 0) {
      handleEditMyFive();
      return;
    }
    
    const songIndex = hasEditButton ? selectedMyFiveSong - 1 : selectedMyFiveSong;
    
    let songToPlay = null;
    if (viewingFriendSongs.length > 0) {
      songToPlay = viewingFriendSongs[songIndex];
    } else if (isSharedView && sharedUserSongs[songIndex]) {
      songToPlay = sharedUserSongs[songIndex];
    }
    
    if (songToPlay) {
      window.open(songToPlay.spotifyUrl, '_blank');
    } else if (songIndex >= 0) {
      const event = new CustomEvent('myFiveSongSelect', { detail: { songIndex } });
      window.dispatchEvent(event);
    }
  };

  return { handleSongPlay };
};
