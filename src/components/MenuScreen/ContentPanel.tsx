
import React from 'react';
import FriendsScreen from '../FriendsScreen';
import SettingsScreen from '../SettingsScreen';
import MyFivePreview from '../MyFivePreview';
import MyFiveFullView from '../MyFiveFullView';
import AccountPreview from '../AccountPreview';
import FriendSongsPreview from '../FriendSongsPreview';
import FriendsListPreview from '../FriendsListPreview';
import { User, Settings, Users, Music } from 'lucide-react';

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
  friendsList = []
}) => {
  if (isInMyFiveView) {
    return (
      <div className="w-full bg-gray-50 transition-all duration-300 ease-out transform">
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
      <div className="w-1/2 bg-gray-50 transition-all duration-300 ease-out transform">
        <FriendsListPreview 
          selectedFriend={hoveredFriendsListItem}
        />
      </div>
    );
  }

  if (isInFriendsView) {
    return (
      <div className="w-1/2 bg-gray-50 transition-all duration-300 ease-out transform">
        <div className="h-full flex flex-col items-center justify-center p-4 text-center">
          <Users size={32} className="text-gray-600 mb-3 transition-all duration-200 ease-out" />
          <h3 className="font-bold text-lg mb-1 transition-all duration-200 ease-out">Friends</h3>
          <p className="text-sm text-gray-600 text-center leading-tight transition-all duration-200 ease-out">
            Connect with friends<br />
            and share music
          </p>
        </div>
      </div>
    );
  }

  if (isInSettingsView) {
    // Show account preview when hovering over "Edit Account"
    if (hoveredSettingsItem === 'Edit Account') {
      return (
        <div className="w-1/2 bg-gray-50 transition-all duration-300 ease-out transform">
          <AccountPreview />
        </div>
      );
    }
    
    return (
      <div className="w-1/2 bg-gray-50 transition-all duration-300 ease-out transform">
        <div className="h-full flex flex-col items-center justify-center p-4 text-center">
          <Settings size={32} className="text-gray-600 mb-3 transition-all duration-200 ease-out" />
          <h3 className="font-bold text-lg mb-1 transition-all duration-200 ease-out">Settings</h3>
          <p className="text-sm text-gray-600 text-center leading-tight transition-all duration-200 ease-out">
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
        if (isSignedIn) {
          return (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
              <Users size={32} className="text-gray-600 mb-3 transition-all duration-200 ease-out" />
              <h3 className="font-bold text-lg mb-1 transition-all duration-200 ease-out">Friends</h3>
              <p className="text-sm text-gray-600 text-center leading-tight transition-all duration-200 ease-out">
                Connect with friends<br />
                and share music
              </p>
            </div>
          );
        }
        return <FriendsScreen />;
      case 'Settings':
        if (isSignedIn) {
          return (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
              <Settings size={32} className="text-gray-600 mb-3 transition-all duration-200 ease-out" />
              <h3 className="font-bold text-lg mb-1 transition-all duration-200 ease-out">Settings</h3>
              <p className="text-sm text-gray-600 text-center leading-tight transition-all duration-200 ease-out">
                Configure your<br />FivePod settings
              </p>
            </div>
          );
        }
        return <SettingsScreen />;
      case 'My Five':
        return <MyFivePreview />;
      case 'Sign In':
        return (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <User size={32} className="text-gray-600 mb-3 transition-all duration-200 ease-out" />
            <h3 className="font-bold text-lg mb-1 transition-all duration-200 ease-out">Sign In</h3>
            <p className="text-sm text-gray-600 leading-tight transition-all duration-200 ease-out">
              Create an account<br />
              to get started
            </p>
          </div>
        );
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-3 transition-all duration-200 ease-out">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center transition-all duration-200 ease-out">
                <div className="w-6 h-6 bg-green-600 rounded-md transition-all duration-200 ease-out"></div>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-1 transition-all duration-200 ease-out">FivePod</h3>
            <p className="text-sm text-gray-600 text-center leading-tight transition-all duration-200 ease-out">
              Your personal<br />music player
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-1/2 bg-gray-50 transition-all duration-300 ease-out transform">
      {renderContent()}
    </div>
  );
};

export default ContentPanel;
