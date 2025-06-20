
import { useState } from 'react';

export const useMyFiveState = () => {
  const [isInMyFiveView, setIsInMyFiveView] = useState(false);
  const [selectedMyFiveSong, setSelectedMyFiveSong] = useState(0);
  const [myFiveSongsCount, setMyFiveSongsCount] = useState(0);
  const [isInMyFiveAuthView, setIsInMyFiveAuthView] = useState(false);
  const [selectedMyFiveAuthOption, setSelectedMyFiveAuthOption] = useState(0);

  const enterMyFiveView = () => {
    setIsInMyFiveView(true);
    setSelectedMyFiveSong(0);
  };

  const exitMyFiveView = () => {
    setIsInMyFiveView(false);
    setSelectedMyFiveSong(0);
  };

  const enterMyFiveAuthView = () => {
    setIsInMyFiveAuthView(true);
    setSelectedMyFiveAuthOption(0);
  };

  const exitMyFiveAuthView = () => {
    setIsInMyFiveAuthView(false);
    setSelectedMyFiveAuthOption(0);
  };

  const handleMyFiveSongChange = (index: number) => {
    setSelectedMyFiveSong(index);
  };

  return {
    isInMyFiveView,
    selectedMyFiveSong,
    myFiveSongsCount,
    isInMyFiveAuthView,
    selectedMyFiveAuthOption,
    enterMyFiveView,
    exitMyFiveView,
    enterMyFiveAuthView,
    exitMyFiveAuthView,
    handleMyFiveSongChange,
    setIsInMyFiveView,
    setSelectedMyFiveSong,
    setMyFiveSongsCount,
    setIsInMyFiveAuthView,
    setSelectedMyFiveAuthOption
  };
};
