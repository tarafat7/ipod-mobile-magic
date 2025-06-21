
import React, { useState } from 'react';
import { MenuPanelProps } from './types';
import { settingsMenuItems, friendsMenuItems, dailyDropMenuItems } from './constants';
import { MenuActions } from './MenuActions';
import MenuHeader from './MenuHeader';
import MenuItem from './MenuItem';

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
  onFriendsItemHover,
  isInFriendsListView = false,
  selectedFriendsListItem = 0,
  onFriendsListItemClick,
  onFriendsListItemHover,
  friendsList = [],
  isInDailyDropView = false,
  selectedDailyDropItem = 0,
  onDailyDropClick,
  onDailyDropItemClick,
  onDailyDropItemHover
}) => {
  const [touchedItem, setTouchedItem] = useState<string | null>(null);
  
  // Modify menu items for shared view
  const displayMenuItems = isSharedView && !isSignedIn 
    ? ['Sign In', ...menuItems.filter(item => item !== 'Sign In')] 
    : menuItems;
  
  let currentMenuItems = displayMenuItems;
  let currentSelectedIndex = selectedMenuItem;
  
  if (isInFriendsListView) {
    // Show friends list
    currentMenuItems = friendsList.map(friend => friend.full_name || 'Unknown User');
    currentSelectedIndex = selectedFriendsListItem;
  } else if (isInDailyDropView) {
    currentMenuItems = dailyDropMenuItems;
    currentSelectedIndex = selectedDailyDropItem;
    
    // Trigger hover effect for the currently selected Daily Drop item
    const selectedDailyDropItemName = dailyDropMenuItems[selectedDailyDropItem];
    if (onDailyDropItemHover && selectedDailyDropItemName) {
      // Use setTimeout to ensure this runs after the component renders
      setTimeout(() => {
        onDailyDropItemHover(selectedDailyDropItemName);
      }, 0);
    }
  } else if (isInSettingsView) {
    currentMenuItems = settingsMenuItems;
    currentSelectedIndex = selectedSettingsItem;
  } else if (isInFriendsView) {
    currentMenuItems = friendsMenuItems;
    currentSelectedIndex = selectedFriendsItem;
  }

  const handleItemClick = (item: string, index: number) => {
    // Clear any touched state first
    setTouchedItem(null);
    if (onSettingsItemHover) {
      onSettingsItemHover(null);
    }
    if (onFriendsItemHover) {
      onFriendsItemHover(null);
    }
    if (onFriendsListItemHover) {
      onFriendsListItemHover(null);
    }
    if (onDailyDropItemHover) {
      onDailyDropItemHover(null);
    }
    
    if (isInFriendsListView) {
      if (onFriendsListItemClick) {
        onFriendsListItemClick(index);
      }
    } else if (isInDailyDropView) {
      if (onDailyDropItemClick) {
        onDailyDropItemClick(index);
      }
    } else if (isInSettingsView) {
      onSettingsItemClick(index);
      if (item === 'Product Feedback') {
        MenuActions.handleProductFeedback();
      } else if (item === 'Delete Account') {
        MenuActions.handleDeleteAccount();
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
      // Handle main menu clicks
      if (item === 'The Daily Drop') {
        console.log('Daily Drop clicked in MenuPanel');
        if (onDailyDropClick) {
          onDailyDropClick();
        }
      } else {
        onMenuItemClick(index);
        if (item === 'Settings' && isSignedIn) {
          onSettingsClick();
        } else if (item === 'Friends' && isSignedIn && onFriendsClick) {
          onFriendsClick();
        } else if (item === 'Edit My Five') {
          window.location.href = '/edit-my-five';
        } else if (item === 'Share Profile') {
          MenuActions.handleShareProfile();
        }
      }
    }
  };

  const handleItemHover = (item: string, index: number) => {
    if (isInFriendsListView && onFriendsListItemHover) {
      onFriendsListItemHover(friendsList[index]);
    } else if (isInDailyDropView && onDailyDropItemHover) {
      onDailyDropItemHover(item);
    } else if (isInSettingsView && onSettingsItemHover) {
      onSettingsItemHover(item);
    } else if (isInFriendsView && onFriendsItemHover) {
      onFriendsItemHover(item);
    }
  };

  const handleItemLeave = () => {
    if (isInFriendsListView && onFriendsListItemHover && !touchedItem) {
      onFriendsListItemHover(null);
    } else if (isInDailyDropView && onDailyDropItemHover && !touchedItem) {
      onDailyDropItemHover(null);
    } else if (isInSettingsView && onSettingsItemHover && !touchedItem) {
      onSettingsItemHover(null);
    } else if (isInFriendsView && onFriendsItemHover && !touchedItem) {
      onFriendsItemHover(null);
    }
  };

  const handleTouchStart = (item: string, index: number) => {
    if (isInFriendsListView && onFriendsListItemHover) {
      setTouchedItem(item);
      onFriendsListItemHover(friendsList[index]);
    } else if (isInDailyDropView && onDailyDropItemHover) {
      setTouchedItem(item);
      onDailyDropItemHover(item);
    } else if (isInSettingsView && onSettingsItemHover) {
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
      if (isInFriendsListView && onFriendsListItemHover) {
        onFriendsListItemHover(null);
      } else if (isInDailyDropView && onDailyDropItemHover) {
        onDailyDropItemHover(null);
      } else if (isInSettingsView && onSettingsItemHover) {
        onSettingsItemHover(null);
      } else if (isInFriendsView && onFriendsItemHover) {
        onFriendsItemHover(null);
      }
    }, 100);
  };

  return (
    <div className={`w-1/2 bg-white border-r border-gray-300 transition-transform duration-300 relative ${
      (isInSettingsView || isInFriendsView || isInFriendsListView || isInDailyDropView) ? 'transform translate-x-0' : 'transform translate-x-0'
    }`}>
      {/* Battery indicator - only show in main menu */}
      {!isInSettingsView && !isInFriendsView && !isInFriendsListView && !isInDailyDropView && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
        </div>
      )}
      
      <div className="p-2">
        <MenuHeader
          isInSettingsView={isInSettingsView}
          isInFriendsView={isInFriendsView}
          isInFriendsListView={isInFriendsListView}
          isInDailyDropView={isInDailyDropView}
        />
        
        <div className="space-y-0">
          {currentMenuItems.map((item, index) => (
            <MenuItem
              key={item}
              item={item}
              index={index}
              isSelected={currentSelectedIndex === index}
              isInSettingsView={isInSettingsView}
              isInFriendsView={isInFriendsView}
              isInFriendsListView={isInFriendsListView}
              isInDailyDropView={isInDailyDropView}
              isSignedIn={isSignedIn}
              onClick={handleItemClick}
              onHover={handleItemHover}
              onLeave={handleItemLeave}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuPanel;
