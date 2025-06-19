import React, { useState } from 'react';
import { supabase } from '../../integrations/supabase/client';

interface MenuPanelProps {
  menuItems: string[];
  selectedMenuItem: number;
  isInSettingsView: boolean;
  isSignedIn: boolean;
  selectedSettingsItem: number;
  onSettingsClick: () => void;
  onSettingsAction: (action: string) => void;
  onMenuItemClick: (index: number) => void;
  onSettingsItemClick: (index: number) => void;
  onSettingsItemHover?: (item: string | null) => void;
  isSharedView?: boolean;
  isInFriendsView?: boolean;
  selectedFriendsItem?: number;
  onFriendsClick?: () => void;
  onFriendsAction?: (action: string) => void;
  onFriendsItemClick?: (index: number) => void;
  onFriendsItemHover?: (item: string | null) => void;
}

const settingsMenuItems = [
  'Share Profile',
  'Edit Account', 
  'Edit My Five',
  'Logout',
  'Delete Account'
];

const friendsMenuItems = [
  'Add a friend',
  'My Friends',
  'Friend Requests'
];

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
  isSharedView = false,
  isInFriendsView = false,
  selectedFriendsItem = 0,
  onFriendsClick,
  onFriendsAction,
  onFriendsItemClick,
  onFriendsItemHover
}) => {
  const [touchedItem, setTouchedItem] = useState<string | null>(null);
  
  // Modify menu items for shared view
  const displayMenuItems = isSharedView && !isSignedIn 
    ? ['Sign In', ...menuItems.filter(item => item !== 'Sign In')] 
    : menuItems;
  
  let currentMenuItems = displayMenuItems;
  let currentSelectedIndex = selectedMenuItem;
  
  if (isInSettingsView) {
    currentMenuItems = settingsMenuItems;
    currentSelectedIndex = selectedSettingsItem;
  } else if (isInFriendsView) {
    currentMenuItems = friendsMenuItems;
    currentSelectedIndex = selectedFriendsItem;
  }

  const handleShareProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const shareUrl = `${window.location.origin}/my-five/${user.id}`;
      const shareData = {
        title: 'Check out my Five!',
        text: 'Here are the 5 songs on repeat for me right now',
        url: shareUrl
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  const handleItemClick = (item: string, index: number) => {
    // Clear any touched state first
    setTouchedItem(null);
    if (onSettingsItemHover) {
      onSettingsItemHover(null);
    }
    if (onFriendsItemHover) {
      onFriendsItemHover(null);
    }
    
    if (isInSettingsView) {
      onSettingsItemClick(index);
      if (item === 'Edit My Five') {
        window.location.href = '/edit-my-five';
      } else if (item === 'Share Profile') {
        handleShareProfile();
      } else {
        onSettingsAction(item);
      }
    } else if (isInFriendsView) {
      if (onFriendsItemClick) {
        onFriendsItemClick(index);
      }
      if (onFriendsAction) {
        onFriendsAction(item);
      }
    } else {
      onMenuItemClick(index);
      if (item === 'Settings' && isSignedIn) {
        onSettingsClick();
      } else if (item === 'Friends' && isSignedIn && onFriendsClick) {
        onFriendsClick();
      }
    }
  };

  const handleItemHover = (item: string) => {
    if (isInSettingsView && onSettingsItemHover) {
      onSettingsItemHover(item);
    } else if (isInFriendsView && onFriendsItemHover) {
      onFriendsItemHover(item);
    }
  };

  const handleItemLeave = () => {
    if (isInSettingsView && onSettingsItemHover && !touchedItem) {
      onSettingsItemHover(null);
    } else if (isInFriendsView && onFriendsItemHover && !touchedItem) {
      onFriendsItemHover(null);
    }
  };

  const handleTouchStart = (item: string) => {
    if (isInSettingsView && onSettingsItemHover) {
      setTouchedItem(item);
      onSettingsItemHover(item);
    } else if (isInFriendsView && onFriendsItemHover) {
      setTouchedItem(item);
      onFriendsItemHover(item);
    }
  };

  const handleTouchEnd = () => {
    // Small delay to allow preview to be seen before clearing
    setTimeout(() => {
      setTouchedItem(null);
      if (isInSettingsView && onSettingsItemHover) {
        onSettingsItemHover(null);
      } else if (isInFriendsView && onFriendsItemHover) {
        onFriendsItemHover(null);
      }
    }, 100);
  };

  const getHeaderTitle = () => {
    if (isInSettingsView) return 'Settings';
    if (isInFriendsView) return 'Friends';
    return 'FivePod';
  };

  return (
    <div className={`w-1/2 bg-white border-r border-gray-300 transition-transform duration-300 relative ${
      (isInSettingsView || isInFriendsView) ? 'transform translate-x-0' : 'transform translate-x-0'
    }`}>
      {/* Battery indicator - only show in main menu */}
      {!isInSettingsView && !isInFriendsView && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
        </div>
      )}
      
      <div className="p-2">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold">{getHeaderTitle()}</span>
          {/* Battery indicator for Settings and Friends view */}
          {(isInSettingsView || isInFriendsView) && (
            <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
          )}
        </div>
        
        <div className="space-y-0">
          {currentMenuItems.map((item, index) => (
            <div
              key={item}
              className={`px-2 py-1 text-sm flex items-center justify-between cursor-pointer ${
                currentSelectedIndex === index
                  ? 'text-white'
                  : 'text-black hover:bg-gray-100'
              } ${item === 'Delete Account' ? 'text-red-600' : ''}`}
              style={{
                backgroundColor: currentSelectedIndex === index ? '#3398d8' : 'transparent'
              }}
              onClick={() => handleItemClick(item, index)}
              onMouseEnter={() => handleItemHover(item)}
              onMouseLeave={handleItemLeave}
              onTouchStart={() => handleTouchStart(item)}
              onTouchEnd={handleTouchEnd}
            >
              <span>{item}</span>
              {currentSelectedIndex === index && (isInSettingsView || isInFriendsView) && (
                <span className="text-white">▶</span>
              )}
              {currentSelectedIndex === index && !isInSettingsView && !isInFriendsView && 
               ((item === 'Settings' && isSignedIn) || (item === 'Friends' && isSignedIn)) && (
                <span className="text-white">▶</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuPanel;
