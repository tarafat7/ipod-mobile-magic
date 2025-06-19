
import React, { useEffect } from 'react';
import { useMyFiveSongs } from './MyFive/useMyFiveSongs';
import MyFiveHeader from './MyFive/MyFiveHeader';
import SongList from './MyFive/SongList';
import LoadingState from './MyFive/LoadingState';
import EmptyState from './MyFive/EmptyState';

interface SpotifyTrackInfo {
  name: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
  addedDate: string;
}

interface MyFiveFullViewProps {
  selectedSongIndex: number;
  isSharedView?: boolean;
  sharedUserProfile?: {full_name: string} | null;
  sharedUserSongs?: SpotifyTrackInfo[];
  viewingFriendProfile?: {full_name: string} | null;
}

const MyFiveFullView: React.FC<MyFiveFullViewProps> = ({ 
  selectedSongIndex,
  isSharedView = false,
  sharedUserProfile = null,
  sharedUserSongs = [],
  viewingFriendProfile = null
}) => {
  const { songs, isLoading } = useMyFiveSongs({
    isSharedView,
    sharedUserProfile,
    sharedUserSongs,
    viewingFriendProfile
  });

  // Listen for song selection events from the center button
  useEffect(() => {
    const handleSongSelect = (event: CustomEvent) => {
      const { songIndex } = event.detail;
      if (songs[songIndex]) {
        window.open(songs[songIndex].spotifyUrl, '_blank');
      }
    };

    window.addEventListener('myFiveSongSelect', handleSongSelect as EventListener);
    
    return () => {
      window.removeEventListener('myFiveSongSelect', handleSongSelect as EventListener);
    };
  }, [songs]);

  const displayName = (viewingFriendProfile || sharedUserProfile) ? 
    (viewingFriendProfile?.full_name || sharedUserProfile?.full_name) : 'My';

  const isViewingOthers = !!(viewingFriendProfile || (isSharedView && sharedUserProfile));

  if (isLoading) {
    return <LoadingState displayName={displayName || 'your'} />;
  }

  if (songs.length === 0) {
    return <EmptyState displayName={displayName} isViewingOthers={isViewingOthers} />;
  }

  const headerDisplayName = isViewingOthers ? `${displayName}'s` : displayName;

  return (
    <div className="h-full bg-white">
      <MyFiveHeader displayName={headerDisplayName} />
      <SongList 
        songs={songs} 
        selectedSongIndex={selectedSongIndex}
      />
    </div>
  );
};

export default MyFiveFullView;
