import React, { useState } from 'react';
import { Settings } from 'lucide-react';

interface MenuPanelProps {
  menuItems: string[];
  selectedMenuItem: number;
  isInSettingsView: boolean;
  isSignedIn: boolean;
  selectedSettingsItem: number;
  onSettingsClick: () => void;
  onSettingsAction: (action: string) => Promise<void>;
  onMenuItemClick: (index: number) => void;
  onSettingsItemClick: (index: number) => void;
  onSettingsItemHover: (item: string | null) => void;
  isSharedView: boolean;
  isInFriendsView: boolean;
  selectedFriendsItem: number;
  onFriendsClick: () => void;
  onFriendsAction: (action: string) => Promise<void>;
  onFriendsItemClick: (index: number) => void;
  onFriendsItemHover: (item: string | null) => void;
  isInFriendsListView: boolean;
  selectedFriendsListItem: number;
  onFriendsListItemClick: (index: number) => void;
  onFriendsListItemHover: (friend: any) => void;
  friendsList: any[];
}

const MenuPanel: React.FC<MenuPanelProps> = ({
  menuItems,
  selectedMenuItem,
  isInSettingsView,
  isSignedIn,
  selectedSettingsItem,
  onSettingsClick,
  onSettingsAction,
  onMenuItemClick,
  onSettingsItemClick,
  onSettingsItemHover,
  isSharedView,
  isInFriendsView,
  selectedFriendsItem,
  onFriendsClick,
  onFriendsAction,
  onFriendsItemClick,
  onFriendsItemHover,
  isInFriendsListView,
  selectedFriendsListItem,
  onFriendsListItemClick,
  onFriendsListItemHover,
  friendsList
}) => {
  const [touchedItem, setTouchedItem] = useState<string | null>(null);

  const handleProductFeedback = () => {
    window.open('https://app.formbricks.com/s/cmc2iwfd7d33uu2017tjqmhji', '_blank');
  };

  const handleLogout = async () => {
    await onSettingsAction('Logout');
  };

  const handleDeleteAccount = async () => {
    await onSettingsAction('Delete Account');
  };

  const handleItemClick = (item: string, index: number) => {
    // Clear any touched state first
    setTouchedItem(null);
    
    if (isInFriendsListView) {
      onFriendsListItemClick(index);
      if (onFriendsListItemHover) {
        onFriendsListItemHover(friendsList[index]);
      }
    } else if (isInFriendsView) {
      onFriendsItemClick(index);
      if (onFriendsItemHover) {
        onFriendsItemHover(item);
      }
      if (item === 'Add a friend') {
        onFriendsAction(item);
      }
    } else if (isInSettingsView) {
      onSettingsItemClick(index);
      
      // Handle settings actions directly here
      if (item === 'About') {
        // Trigger About full screen view
        const event = new CustomEvent('openAboutView');
        window.dispatchEvent(event);
      } else if (item === 'Edit Account') {
        window.location.href = '/signin?mode=edit';
      } else if (item === 'Product Feedback') {
        handleProductFeedback();
      } else if (item === 'Logout') {
        handleLogout();
      } else if (item === 'Delete Account') {
        handleDeleteAccount();
      }
    } else if (isInFriendsView) {
      if (onFriendsItemClick) {
        onFriendsItemClick(index);
      }
      if (onFriendsItemHover) {
        onFriendsItemHover(item);
      }
    } else {
      onMenuItemClick(index);
    }
  };

  const currentMenuItems = isInSettingsView
    ? ['Edit Account', 'Product Feedback', 'About', 'Logout', 'Delete Account']
    : isInFriendsView
    ? ['Add a friend', 'My Friends']
    : menuItems;
  const currentSelectedIndex = isInSettingsView
    ? selectedSettingsItem
    : isInFriendsView
    ? selectedFriendsItem
    : selectedMenuItem;

  return (
    <div className={`w-1/2 bg-white border-r border-gray-300 transition-all duration-300 relative`}>
      <div className="p-2">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold">{isInSettingsView ? 'Settings' : isInFriendsView ? 'Friends' : 'FivePod'}</span>
          <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
        </div>
        <div className="space-y-0">
          {currentMenuItems.map((item, index) => (
            <div
              key={item}
              className={`px-2 py-1 text-sm flex items-center justify-between cursor-pointer ${
                currentSelectedIndex === index
                  ? 'bg-blue-500 text-white'
                  : 'text-black hover:bg-gray-100'
              } ${item === 'Delete Account' ? 'text-red-600' : ''}`}
              onClick={() => handleItemClick(item, index)}
              onMouseEnter={() => {
                setTouchedItem(item);
                if (isInSettingsView) {
                  onSettingsItemHover(item);
                } else if (isInFriendsView) {
                  onFriendsItemHover(item);
                }
              }}
              onMouseLeave={() => {
                setTouchedItem(null);
                if (isInSettingsView) {
                  onSettingsItemHover(null);
                } else if (isInFriendsView) {
                  onFriendsItemHover(null);
                }
              }}
            >
              <span>{item}</span>
              {currentSelectedIndex === index && (
                <span className="text-white">▶</span>
              )}
            </div>
          ))}
          {!isSignedIn && !isInSettingsView && (
            <div
              className={`px-2 py-1 text-sm flex items-center justify-between cursor-pointer ${
                selectedMenuItem === menuItems.length - 1
                  ? 'bg-gray-200 text-black'
                  : 'text-black hover:bg-gray-100'
              }`}
              onClick={() => {
                onMenuItemClick(menuItems.length - 1);
              }}
            >
              <span>Sign In</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuPanel;
