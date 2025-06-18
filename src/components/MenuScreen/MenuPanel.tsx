
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
}

const settingsMenuItems = [
  'Share Profile',
  'Edit Account', 
  'Edit My Five',
  'Logout',
  'Delete Account'
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
  onSettingsItemHover
}) => {
  const [touchedItem, setTouchedItem] = useState<string | null>(null);
  
  const currentMenuItems = isInSettingsView ? settingsMenuItems : menuItems;
  const currentSelectedIndex = isInSettingsView ? selectedSettingsItem : selectedMenuItem;

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
    
    if (isInSettingsView) {
      onSettingsItemClick(index);
      if (item === 'Edit My Five') {
        window.location.href = '/edit-my-five';
      } else if (item === 'Share Profile') {
        handleShareProfile();
      } else {
        onSettingsAction(item);
      }
    } else {
      onMenuItemClick(index);
      if (item === 'Settings' && isSignedIn) {
        onSettingsClick();
      }
    }
  };

  const handleItemHover = (item: string) => {
    if (isInSettingsView && onSettingsItemHover) {
      onSettingsItemHover(item);
    }
  };

  const handleItemLeave = () => {
    if (isInSettingsView && onSettingsItemHover && !touchedItem) {
      onSettingsItemHover(null);
    }
  };

  const handleTouchStart = (item: string) => {
    if (isInSettingsView && onSettingsItemHover) {
      setTouchedItem(item);
      onSettingsItemHover(item);
    }
  };

  const handleTouchEnd = () => {
    // Small delay to allow preview to be seen before clearing
    setTimeout(() => {
      setTouchedItem(null);
      if (isInSettingsView && onSettingsItemHover) {
        onSettingsItemHover(null);
      }
    }, 100);
  };

  return (
    <div className={`w-1/2 bg-white border-r border-gray-300 transition-transform duration-300 relative ${
      isInSettingsView ? 'transform translate-x-0' : 'transform translate-x-0'
    }`}>
      {/* Battery indicator - only show in main menu */}
      {!isInSettingsView && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
        </div>
      )}
      
      <div className="p-2">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold">{isInSettingsView ? 'Settings' : 'FivePod'}</span>
          {/* Battery indicator for Settings view */}
          {isInSettingsView && (
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
              {currentSelectedIndex === index && isInSettingsView && (
                <span className="text-white">▶</span>
              )}
              {currentSelectedIndex === index && !isInSettingsView && item === 'Settings' && isSignedIn && (
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
