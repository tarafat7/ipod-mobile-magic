
import React, { useEffect } from 'react';
import MyFiveLoadingState from './MyFive/MyFiveLoadingState';
import MyFiveEmptyState from './MyFive/MyFiveEmptyState';
import MyFiveHeader from './MyFive/MyFiveHeader';
import MyFiveSongItem from './MyFive/MyFiveSongItem';
import { useMyFiveSongs } from '../hooks/useMyFiveSongs';

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
}

const MyFiveFullView: React.FC<MyFiveFullViewProps> = ({ 
  selectedSongIndex,
  isSharedView = false,
  sharedUserProfile = null,
  sharedUserSongs = []
}) => {
  const { songs, setSongs, isLoading, setIsLoading, loadMyFiveSongs, setLoadedUserId } = useMyFiveSongs();

  // Only run the effect when the view type changes or initial load
  useEffect(() => {
    console.log('MyFiveFullView: useEffect triggered - isSharedView:', isSharedView, 'sharedUserSongs length:', sharedUserSongs.length);
    if (isSharedView) {
      // For shared views, use the provided shared songs data directly
      console.log('MyFiveFullView: Using shared songs data:', sharedUserSongs);
      setSongs(sharedUserSongs);
      setIsLoading(false);
      setLoadedUserId(''); // Reset loaded user ID for shared views
    } else {
      // For authenticated users viewing their own songs
      console.log('MyFiveFullView: Loading user songs');
      loadMyFiveSongs();
    }
  }, [isSharedView]);

  // Update songs only when sharedUserSongs actually changes (not on every scroll)
  useEffect(() => {
    if (isSharedView && sharedUserSongs.length > 0 && songs.length !== sharedUserSongs.length) {
      console.log('MyFiveFullView: Updating shared songs data:', sharedUserSongs);
      setSongs(sharedUserSongs);
    }
  }, [isSharedView, sharedUserSongs.length]);

  useEffect(() => {
    // Listen for song selection events from the center button
    const handleSongSelect = (event: CustomEvent) => {
      const { songIndex } = event.detail;
      if (songs[songIndex]) {
        handleSongClick(songs[songIndex].spotifyUrl);
      }
    };

    window.addEventListener('myFiveSongSelect', handleSongSelect as EventListener);
    
    return () => {
      window.removeEventListener('myFiveSongSelect', handleSongSelect as EventListener);
    };
  }, [songs]);

  const handleSongClick = (spotifyUrl: string) => {
    window.open(spotifyUrl, '_blank');
  };

  console.log('MyFiveFullView: Rendering - isLoading:', isLoading, 'songs length:', songs.length);

  const displayName = isSharedView && sharedUserProfile ? sharedUserProfile.full_name : 'your';

  if (isLoading) {
    return <MyFiveLoadingState displayName={displayName} />;
  }

  if (songs.length === 0) {
    const emptyDisplayName = isSharedView && sharedUserProfile ? sharedUserProfile.full_name : 'My';
    return <MyFiveEmptyState displayName={emptyDisplayName} isSharedView={isSharedView} />;
  }

  const headerDisplayName = isSharedView && sharedUserProfile ? `${sharedUserProfile.full_name}'s` : 'My';

  return (
    <div className="h-full bg-white flex flex-col min-h-0">
      <MyFiveHeader displayName={headerDisplayName} />
      
      {/* Scrollable Song List - Fixed height container for proper mobile scrolling */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="bg-white px-2">
          {songs.map((song, index) => (
            <MyFiveSongItem
              key={index}
              song={song}
              index={index}
              isSelected={selectedSongIndex === index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyFiveFullView;
