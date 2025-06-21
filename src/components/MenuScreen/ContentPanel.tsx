
import React from 'react';
import FriendsScreen from '../FriendsScreen';
import SettingsScreen from '../SettingsScreen';
import MyFivePreview from '../MyFivePreview';
import MyFiveFullView from '../MyFiveFullView';
import AccountPreview from '../AccountPreview';
import FriendsListPreview from '../FriendsListPreview';
import DailyDropContent from './DailyDropContent';
import MenuContentRenderer from './MenuContentRenderer';
import TodaysPlaylistView from '../TodaysPlaylistView';
import { Settings, Users } from 'lucide-react';

interface SpotifyTrackInfo {
  name: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
  addedDate: string;
}

interface ContentPanelProps {
  menuItems: string[];
  selectedMenuItem: number;
  isInSettingsView: boolean;
  isSignedIn: boolean;
  isInMyFiveView?: boolean;
  selectedMyFiveSong?: number;
  hoveredSettingsItem?: string | null;
  isSharedView?: boolean;
  sharedUserProfile?: {full_name: string} | null;
  sharedUserSongs?: SpotifyTrackInfo[];
  isInFriendsView?: boolean;
  selectedFriendsItem?: number;
  hoveredFriendsItem?: string | null;
  isInFriendsListView?: boolean;
  selectedFriendsListItem?: number;
  hoveredFriendsListItem?: any;
  friendsList?: any[];
  isInDailyDropView?: boolean;
  selectedDailyDropItem?: number;
  hoveredDailyDropItem?: string | null;
  isInTodaysPlaylistView?: boolean;
  selectedTodaysPlaylistItem?: number;
}

const ContentPanel: React.FC<ContentPanelProps> = ({
  menuItems,
  selectedMenuItem,
  isInSettingsView,
  isSignedIn,
  isInMyFiveView = false,
  selectedMyFiveSong = 0,
  hoveredSettingsItem = null,
  isSharedView = false,
  sharedUserProfile = null,
  sharedUserSongs = [],
  isInFriendsView = false,
  isInFriendsListView = false,
  hoveredFriendsListItem = null,
  isInDailyDropView = false,
  selectedDailyDropItem = 0,
  hoveredDailyDropItem = null,
  isInTodaysPlaylistView = false,
  selectedTodaysPlaylistItem = 0
}) => {
  if (isInTodaysPlaylistView) {
    return (
      <div className="w-full bg-gray-50">
        <TodaysPlaylistView selectedItemIndex={selectedTodaysPlaylistItem} />
      </div>
    );
  }

  if (isInDailyDropView) {
    return (
      <DailyDropContent
        selectedDailyDropItem={selectedDailyDropItem}
        hoveredDailyDropItem={hoveredDailyDropItem}
        isSignedIn={isSignedIn}
      />
    );
  }

  if (isInMyFiveView) {
    return (
      <div className="w-full bg-gray-50">
        <MyFiveFullView 
          selectedSongIndex={selectedMyFiveSong}
          isSharedView={isSharedView}
          sharedUserProfile={sharedUserProfile}
          sharedUserSongs={sharedUserSongs}
        />
      </div>
    );
  }

  if (isInFriendsListView) {
    return (
      <div className="w-1/2 bg-gray-50">
        <FriendsListPreview 
          selectedFriend={hoveredFriendsListItem}
        />
      </div>
    );
  }

  if (isInFriendsView) {
    return (
      <div className="w-1/2 bg-gray-50">
        <div className="h-full flex flex-col items-center justify-center p-4 text-center">
          <Users size={32} className="text-gray-600 mb-3" />
          <h3 className="font-bold text-lg mb-1">Friends</h3>
          <p className="text-sm text-gray-600 text-center leading-tight">
            Connect with friends<br />
            and share music
          </p>
        </div>
      </div>
    );
  }

  if (isInSettingsView) {
    if (hoveredSettingsItem === 'Edit Account') {
      return (
        <div className="w-1/2 bg-gray-50">
          <AccountPreview />
        </div>
      );
    }
    
    return (
      <div className="w-1/2 bg-gray-50">
        <div className="h-full flex flex-col items-center justify-center p-4 text-center">
          <Settings size={32} className="text-gray-600 mb-3" />
          <h3 className="font-bold text-lg mb-1">Settings</h3>
          <p className="text-sm text-gray-600 text-center leading-tight">
            Configure your<br />FivePod settings
          </p>
        </div>
      </div>
    );
  }

  const selectedItem = menuItems[selectedMenuItem];
  
  const renderContent = () => {
    switch (selectedItem) {
      case 'Friends':
        if (!isSignedIn) {
          return <FriendsScreen />;
        }
        break;
      case 'Settings':
        if (!isSignedIn) {
          return <SettingsScreen />;
        }
        break;
      case 'My Five':
        return <MyFivePreview />;
    }
    
    return (
      <MenuContentRenderer
        selectedItem={selectedItem}
        isSignedIn={isSignedIn}
      />
    );
  };

  return (
    <div className="w-1/2 bg-gray-50">
      {renderContent()}
    </div>
  );
};

export default ContentPanel;
