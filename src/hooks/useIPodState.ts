
import { useState } from 'react';

export const useIPodState = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [selectedMenuItem, setSelectedMenuItem] = useState(0);
  const [selectedSong, setSelectedSong] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [lastAngle, setLastAngle] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [isInSettingsView, setIsInSettingsView] = useState(false);
  const [selectedSettingsItem, setSelectedSettingsItem] = useState(0);
  const [isInMyFiveView, setIsInMyFiveView] = useState(false);
  const [selectedMyFiveSong, setSelectedMyFiveSong] = useState(0);
  const [myFiveSongsCount, setMyFiveSongsCount] = useState(0);
  const [isSharedView, setIsSharedView] = useState(false);
  const [isInFriendsView, setIsInFriendsView] = useState(false);
  const [selectedFriendsItem, setSelectedFriendsItem] = useState(0);
  const [isInFriendsListView, setIsInFriendsListView] = useState(false);
  const [selectedFriendsListItem, setSelectedFriendsListItem] = useState(0);
  const [isInAboutView, setIsInAboutView] = useState(false);
  const [isInPrivacyPolicyView, setIsInPrivacyPolicyView] = useState(false);

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
    lastAngle,
    setLastAngle,
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
    isInFriendsView,
    setIsInFriendsView,
    selectedFriendsItem,
    setSelectedFriendsItem,
    isInFriendsListView,
    setIsInFriendsListView,
    selectedFriendsListItem,
    setSelectedFriendsListItem,
    isInAboutView,
    setIsInAboutView,
    isInPrivacyPolicyView,
    setIsInPrivacyPolicyView,
  };
};
