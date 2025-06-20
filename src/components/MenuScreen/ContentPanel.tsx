import React from 'react';
import FriendsScreen from '../FriendsScreen';
import SettingsScreen from '../SettingsScreen';
import MyFivePreview from '../MyFivePreview';
import MyFiveFullView from '../MyFiveFullView';
import AccountPreview from '../AccountPreview';
import FriendSongsPreview from '../FriendSongsPreview';
import FriendsListPreview from '../FriendsListPreview';
import ContentRenderer from './ContentRenderer';
import { Users, Settings } from 'lucide-react';

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
  selectedFriendsItem = 0,
  hoveredFriendsItem = null,
  isInFriendsListView = false,
  selectedFriendsListItem = 0,
  hoveredFriendsListItem = null,
  friendsList = [],
  isInDailyDropView = false,
  selectedDailyDropItem = 0,
  hoveredDailyDropItem = null
}) => {
  if (isInDailyDropView) {
    return (
      <div className="w-1/2 bg-gray-50">
        <div className="h-full flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-orange-600 rounded-md"></div>
            </div>
          </div>
          <h3 className="font-bold text-lg mb-1">The Daily Drop</h3>
          <p className="text-sm text-gray-600 text-center leading-tight">
            A global playlist built<br />
            daily around a prompt
          </p>
        </div>
      </div>
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
  
  const getContent = () => {
    if (selectedItem === 'Friends' && !isSignedIn) {
      return <FriendsScreen />;
    }
    
    if (selectedItem === 'Settings' && !isSignedIn) {
      return <SettingsScreen />;
    }
    
    if (selectedItem === 'My Five') {
      return <MyFivePreview />;
    }

    return <ContentRenderer selectedItem={selectedItem} isSignedIn={isSignedIn} />;
  };

  return (
    <div className="w-1/2 bg-gray-50">
      {getContent()}
    </div>
  );
};

export default ContentPanel;
