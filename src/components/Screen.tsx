import React from 'react';
import MenuScreen from './MenuScreen/MenuScreen';
import MusicScreen from './MusicScreen';
import FriendsScreen from './FriendsScreen';
import SettingsScreen from './SettingsScreen';
import AboutScreen from './AboutScreen';
import PrivacyPolicyScreen from './PrivacyPolicyScreen';
import MyFiveAuthScreen from './MyFiveAuthScreen';
import { Song } from '../types/iPod';
import { songs } from '../data/iPodData';

interface SpotifyTrackInfo {
  name: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
  addedDate: string;
}

interface UserProfile {
  full_name: string | null;
}

interface ScreenProps {
  currentScreen: string;
  selectedMenuItem: number;
  selectedSong: number;
  isPlaying: boolean;
  currentTime: string;
  selectedSettingsItem?: number;
  isInSettingsView?: boolean;
  onSettingsItemChange?: (index: number) => void;
  isInMyFiveView?: boolean;
  selectedMyFiveSong?: number;
  onMyFiveSongChange?: (index: number) => void;
  isSharedView?: boolean;
  sharedUserProfile?: UserProfile | null;
  sharedUserSongs?: SpotifyTrackInfo[];
  isInFriendsView?: boolean;
  selectedFriendsItem?: number;
  onFriendsItemChange?: (index: number) => void;
  isInFriendsListView?: boolean;
  selectedFriendsListItem?: number;
  onFriendsListItemChange?: (index: number) => void;
  friendsList?: any[];
  isInAboutView?: boolean;
  isInPrivacyPolicyView?: boolean;
  isInMyFiveAuthView?: boolean;
  selectedMyFiveAuthOption?: number;
  onMyFiveAuthSignIn?: () => void;
  onMyFiveAuthSignUp?: () => void;
  isInDailyDropView?: boolean;
  selectedDailyDropItem?: number;
  onDailyDropItemChange?: (index: number) => void;
  onDailyDropEnter?: () => void;
}

const Screen: React.FC<ScreenProps> = ({ 
  currentScreen, 
  selectedMenuItem, 
  selectedSong, 
  isPlaying, 
  currentTime,
  selectedSettingsItem = 0,
  isInSettingsView = false,
  onSettingsItemChange,
  isInMyFiveView = false,
  selectedMyFiveSong = 0,
  onMyFiveSongChange,
  isSharedView = false,
  sharedUserProfile = null,
  sharedUserSongs = [],
  isInFriendsView = false,
  selectedFriendsItem = 0,
  onFriendsItemChange,
  isInFriendsListView = false,
  selectedFriendsListItem = 0,
  onFriendsListItemChange,
  friendsList = [],
  isInAboutView = false,
  isInPrivacyPolicyView = false,
  isInMyFiveAuthView = false,
  selectedMyFiveAuthOption = 0,
  onMyFiveAuthSignIn,
  onMyFiveAuthSignUp,
  isInDailyDropView = false,
  selectedDailyDropItem = 0,
  onDailyDropItemChange,
  onDailyDropEnter
}) => {
  const renderScreen = () => {
    // Handle About view
    if (isInAboutView) {
      return <AboutScreen />;
    }

    // Handle Privacy Policy view
    if (isInPrivacyPolicyView) {
      return <PrivacyPolicyScreen />;
    }

    // Handle My Five Auth view
    if (isInMyFiveAuthView) {
      return (
        <MyFiveAuthScreen
          selectedOption={selectedMyFiveAuthOption}
          onSignInClick={onMyFiveAuthSignIn || (() => {})}
          onSignUpClick={onMyFiveAuthSignUp || (() => {})}
        />
      );
    }

    switch (currentScreen) {
      case 'menu':
        return (
          <MenuScreen 
            selectedMenuItem={selectedMenuItem} 
            selectedSettingsItem={selectedSettingsItem}
            isInSettingsView={isInSettingsView}
            onSettingsItemChange={onSettingsItemChange}
            isInMyFiveView={isInMyFiveView}
            selectedMyFiveSong={selectedMyFiveSong}
            onMyFiveSongChange={onMyFiveSongChange}
            isSharedView={isSharedView}
            sharedUserProfile={sharedUserProfile}
            sharedUserSongs={sharedUserSongs}
            isInFriendsView={isInFriendsView}
            selectedFriendsItem={selectedFriendsItem}
            onFriendsItemChange={onFriendsItemChange}
            isInFriendsListView={isInFriendsListView}
            selectedFriendsListItem={selectedFriendsListItem}
            onFriendsListItemChange={onFriendsListItemChange}
            friendsList={friendsList}
            isInDailyDropView={isInDailyDropView}
            selectedDailyDropItem={selectedDailyDropItem}
            onDailyDropItemChange={onDailyDropItemChange}
            onDailyDropEnter={onDailyDropEnter}
          />
        );
      case 'friends':
        return <FriendsScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'music':
        return (
          <MusicScreen 
            selectedSong={songs[selectedSong]} 
            isPlaying={isPlaying} 
            currentTime={currentTime} 
          />
        );
      default:
        return (
          <div className="bg-white h-full flex items-center justify-center text-black">
            iPod
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-2 mb-3 md:mb-6 shadow-inner flex-1 max-h-[40vh] md:max-h-none md:flex-none md:min-h-[220px]">
      <div className="bg-gray-100 rounded-lg h-full border border-gray-300 overflow-hidden">
        {renderScreen()}
      </div>
    </div>
  );
};

export default Screen;
