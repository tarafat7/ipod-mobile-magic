
import React from 'react';
import FriendsScreen from '../FriendsScreen';
import SettingsScreen from '../SettingsScreen';
import MyFivePreview from '../MyFivePreview';
import MyFiveFullView from '../MyFiveFullView';
import AccountPreview from '../AccountPreview';
import FriendSongsPreview from '../FriendSongsPreview';
import FriendsListPreview from '../FriendsListPreview';
import AboutScreen from '../AboutScreen';
import { User, Settings, Users, Music, Share } from 'lucide-react';

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
  isInAboutView?: boolean;
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
  isInAboutView = false
}) => {
  if (isInAboutView) {
    return (
      <div className="w-full bg-gray-50">
        <AboutScreen />
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
    // Show about text when hovering over "About"
    if (hoveredSettingsItem === 'About') {
      return (
        <div className="w-1/2 bg-gray-50">
          <div className="h-full flex flex-col justify-center p-6 text-center">
            <h3 className="font-bold text-lg mb-4">About FivePod</h3>
            <p className="text-sm text-gray-700 leading-relaxed text-left">
              FivePod is a small experiment in sharing music the way we used to. It's meant to feel quiet and low-pressure, like handing someone your iPod and saying "just listen." There are no profiles to perfect and nothing to perform. Just five songs that say what you might not feel like putting into words. I built it to feel a little like the early 2000s, a way to check in with people without needing to say much at all.
              <br /><br />
              I hope you enjoy it.
            </p>
          </div>
        </div>
      );
    }
    
    // Show account preview when hovering over "Edit Account"
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
        if (isSignedIn) {
          return (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
              <Users size={32} className="text-gray-600 mb-3" />
              <h3 className="font-bold text-lg mb-1">Friends</h3>
              <p className="text-sm text-gray-600 text-center leading-tight">
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
              <Settings size={32} className="text-gray-600 mb-3" />
              <h3 className="font-bold text-lg mb-1">Settings</h3>
              <p className="text-sm text-gray-600 text-center leading-tight">
                Configure your<br />FivePod settings
              </p>
            </div>
          );
        }
        return <SettingsScreen />;
      case 'My Five':
        return <MyFivePreview />;
      case 'Edit My Five':
        return (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <Music size={32} className="text-blue-600 mb-3" />
            <h3 className="font-bold text-lg mb-1">Edit</h3>
            <p className="text-sm text-gray-600 text-center leading-tight">
              Add or change what you<br />
              have on repeat currently
            </p>
          </div>
        );
      case 'Share Profile':
        return (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <Share size={32} className="text-green-600 mb-3" />
            <h3 className="font-bold text-lg mb-1">Share</h3>
            <p className="text-sm text-gray-600 text-center leading-tight">
              Share your five<br />
              with friends
            </p>
          </div>
        );
      case 'Sign In':
        return (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <User size={32} className="text-gray-600 mb-3" />
            <h3 className="font-bold text-lg mb-1">Sign In</h3>
            <p className="text-sm text-gray-600 leading-tight">
              Create an account<br />
              to get started
            </p>
          </div>
        );
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-green-600 rounded-md"></div>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-1">FivePod</h3>
            <p className="text-sm text-gray-600 text-center leading-tight">
              Your personal<br />music player
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-1/2 bg-gray-50">
      {renderContent()}
    </div>
  );
};

export default ContentPanel;
