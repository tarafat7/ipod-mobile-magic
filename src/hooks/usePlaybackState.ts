
import { useState } from 'react';

export const usePlaybackState = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSong, setSelectedSong] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');

  return {
    isPlaying,
    setIsPlaying,
    selectedSong,
    setSelectedSong,
    currentTime,
    setCurrentTime
  };
};
