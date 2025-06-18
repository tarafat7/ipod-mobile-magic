
import { useState, useEffect } from 'react';
import { getMenuItems } from '../data/iPodData';
import { supabase } from '../integrations/supabase/client';

export const useIPodState = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [selectedMenuItem, setSelectedMenuItem] = useState(0);
  const [selectedSong, setSelectedSong] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [isInSettingsView, setIsInSettingsView] = useState(false);
  const [selectedSettingsItem, setSelectedSettingsItem] = useState(0);
  const [isInMyFiveView, setIsInMyFiveView] = useState(false);
  const [selectedMyFiveSong, setSelectedMyFiveSong] = useState(0);
  const [myFiveSongsCount, setMyFiveSongsCount] = useState(0);
  const [isSharedView, setIsSharedView] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  return {
    isPlaying,
    setIsPlaying,
    currentScreen,
    setCurrentScreen,
    selectedMenuItem,
    setSelectedMenuItem,
    selectedSong,
    setSelectedSong,
    currentTime,
    setCurrentTime,
    menuItems,
    setMenuItems,
    isInSettingsView,
    setIsInSettingsView,
    selectedSettingsItem,
    setSelectedSettingsItem,
    isInMyFiveView,
    setIsInMyFiveView,
    selectedMyFiveSong,
    setSelectedMyFiveSong,
    myFiveSongsCount,
    setMyFiveSongsCount,
    isSharedView,
    setIsSharedView,
    currentUser,
    setCurrentUser
  };
};
