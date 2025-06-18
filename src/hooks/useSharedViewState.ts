
import { useEffect } from 'react';

interface UseSharedViewStateProps {
  sharedUserProfile: any;
  sharedUserSongs: any[];
  isSharedView: boolean;
  setIsSharedView: (value: boolean) => void;
  setCurrentScreen: (screen: string) => void;
  setIsInMyFiveView: (value: boolean) => void;
  setSelectedMenuItem: (index: number) => void;
  setMyFiveSongsCount: (count: number) => void;
  setSelectedMyFiveSong: (index: number) => void;
}

export const useSharedViewState = ({
  sharedUserProfile,
  sharedUserSongs,
  isSharedView,
  setIsSharedView,
  setCurrentScreen,
  setIsInMyFiveView,
  setSelectedMenuItem,
  setMyFiveSongsCount,
  setSelectedMyFiveSong
}: UseSharedViewStateProps) => {
  // Handle route-based shared view detection
  useEffect(() => {
    const currentPath = window.location.pathname;
    const isMyFiveRoute = currentPath.includes('/my-five/');
    const wasSharedView = isSharedView;
    
    if (isMyFiveRoute && sharedUserProfile) {
      // We're on a shared route with shared data
      setIsSharedView(true);
      setCurrentScreen('menu');
      setIsInMyFiveView(true);
      setSelectedMenuItem(0);
      setMyFiveSongsCount(sharedUserSongs.length);
    } else {
      // We're not on a shared route, reset shared view state
      setIsSharedView(false);
      setIsInMyFiveView(false);
      setSelectedMyFiveSong(0);
      // Reset to main menu when leaving shared view
      if (wasSharedView) {
        setCurrentScreen('menu');
        setSelectedMenuItem(0);
      }
    }
  }, [sharedUserProfile, sharedUserSongs, window.location.pathname]);

  // Update songs count when shared songs change
  useEffect(() => {
    if (isSharedView && sharedUserSongs.length > 0) {
      setMyFiveSongsCount(sharedUserSongs.length);
    }
  }, [sharedUserSongs, isSharedView]);
};
