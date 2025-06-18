
import { useState } from 'react';

export const useMyFiveState = () => {
  const [isInMyFiveView, setIsInMyFiveView] = useState(false);
  const [selectedMyFiveSong, setSelectedMyFiveSong] = useState(0);
  const [myFiveSongsCount, setMyFiveSongsCount] = useState(0);

  return {
    isInMyFiveView,
    setIsInMyFiveView,
    selectedMyFiveSong,
    setSelectedMyFiveSong,
    myFiveSongsCount,
    setMyFiveSongsCount
  };
};
