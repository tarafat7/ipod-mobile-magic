
import React from 'react';
import FriendsScreen from '../FriendsScreen';
import SettingsScreen from '../SettingsScreen';
import DailyDropScreen from '../DailyDropScreen';
import { User, Music } from 'lucide-react';

interface MenuScreenContentProps {
  selectedItem: string;
  showDailyDropMenu: boolean;
  showSettingsMenu: boolean;
  isSignedIn: boolean;
  isInDailyDropView: boolean;
  isInSettingsView: boolean;
}

const MenuScreenContent: React.FC<MenuScreenContentProps> = ({
  selectedItem,
  showDailyDropMenu,
  showSettingsMenu,
  isSignedIn,
  isInDailyDropView,
  isInSettingsView
}) => {
  if (isInDailyDropView) {
    return (
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
    );
  }

  if (isInSettingsView) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-3">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-purple-600 rounded-md"></div>
          </div>
        </div>
        <h3 className="font-bold text-lg mb-1">Settings</h3>
        <p className="text-sm text-gray-600 text-center leading-tight">
          Configure your<br />FivePod settings
        </p>
      </div>
    );
  }

  switch (selectedItem) {
    case 'Friends':
      return <FriendsScreen />;
    case 'The Daily Drop':
      if (showDailyDropMenu) {
        return <DailyDropScreen />;
      }
      return <DailyDropScreen />;
    case 'Settings':
      if (showSettingsMenu && isSignedIn) {
        return (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-green-600 rounded-md"></div>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-1">Settings</h3>
            <p className="text-sm text-gray-600 text-center leading-tight">
              Configure your<br />FivePod settings
            </p>
          </div>
        );
      }
      return <SettingsScreen />;
    case 'My Five':
      return (
        <div className="h-full flex flex-col items-center justify-center p-4 text-center">
          <Music size={32} className="text-blue-600 mb-3" />
          <h3 className="font-bold text-lg mb-1">My Five</h3>
          <p className="text-sm text-gray-600 leading-tight">
            Add the 5 songs that are<br />
            on repeat for you right now
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
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-purple-600 rounded-md"></div>
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

export default MenuScreenContent;
