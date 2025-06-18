
import React from 'react';
import FriendsScreen from '../FriendsScreen';
import SettingsScreen from '../SettingsScreen';
import MyFivePreview from '../MyFivePreview';
import { User } from 'lucide-react';

interface ContentPanelProps {
  menuItems: string[];
  selectedMenuItem: number;
  isInSettingsView: boolean;
  isSignedIn: boolean;
}

const ContentPanel: React.FC<ContentPanelProps> = ({
  menuItems,
  selectedMenuItem,
  isInSettingsView,
  isSignedIn
}) => {
  if (isInSettingsView) {
    return (
      <div className="w-1/2 bg-gray-50 transition-all duration-300">
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
      </div>
    );
  }

  const selectedItem = menuItems[selectedMenuItem];
  
  const renderContent = () => {
    switch (selectedItem) {
      case 'Friends':
        return <FriendsScreen />;
      case 'Settings':
        if (isSignedIn) {
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
        return <MyFivePreview />;
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
    <div className="w-1/2 bg-gray-50 transition-all duration-300">
      {renderContent()}
    </div>
  );
};

export default ContentPanel;
