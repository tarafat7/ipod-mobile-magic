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
  isInFriendsListView?: boolean;
  selectedFriendsListItem?: number;
  onFriendsListItemClick?: (index: number) => void;
  onFriendsListItemHover?: (friend: any) => void;
  friendsList?: any[];
  isInDailyDropView?: boolean;
  selectedDailyDropItem?: number;
  onDailyDropClick?: () => void;
  onDailyDropItemClick?: (index: number) => void;
  onDailyDropItemHover?: (item: string | null) => void;
}

const settingsMenuItems = [
  'Edit Account',
  'Privacy Policy',
  'Product Feedback',
  'Logout',
  'Delete Account'
];

const friendsMenuItems = [
  'Add a friend',
  'My Friends'
];

const dailyDropMenuItems = [
  "Today's Prompt",
  'Add a Song',
  'View Today\'s Playlist'
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
  
  console.log('MenuPanel render - isInDailyDropView:', isInDailyDropView, 'selectedDailyDropItem:', selectedDailyDropItem);
  
  // Modify menu items for shared view
  const displayMenuItems = isSharedView && !isSignedIn 
    ? ['Sign In', ...menuItems.filter(item => item !== 'Sign In')] 
    : menuItems;
  
  let currentMenuItems = displayMenuItems;
  let currentSelectedIndex = selectedMenuItem;
  
  // EXACT SAME LOGIC AS SETTINGS - just for Daily Drop
  if (isInDailyDropView) {
    console.log('MenuPanel: Setting Daily Drop menu items');
    currentMenuItems = dailyDropMenuItems;
    currentSelectedIndex = selectedDailyDropItem;
  } else if (isInFriendsListView) {
    // Show friends list
    currentMenuItems = friendsList.map(friend => friend.full_name || 'Unknown User');
    currentSelectedIndex = selectedFriendsListItem;
  } else if (isInSettingsView) {
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

  const handleProductFeedback = () => {
    window.open('https://app.formbricks.com/s/cmc2iwfd7d33uu2017tjqmhji', '_blank');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log('Deleting account for user:', user.id);
          
          // Delete from user_five_songs table
          const { error: songsError } = await supabase
            .from('user_five_songs')
            .delete()
            .eq('user_id', user.id);
          
          if (songsError) {
            console.error('Error deleting user songs:', songsError);
          }
          
          // Delete from friends table (both as user and as friend)
          const { error: friendsError1 } = await supabase
            .from('friends')
            .delete()
            .eq('user_id', user.id);
            
          if (friendsError1) {
            console.error('Error deleting user friends:', friendsError1);
          }
          
          const { error: friendsError2 } = await supabase
            .from('friends')
            .delete()
            .eq('friend_user_id', user.id);
            
          if (friendsError2) {
            console.error('Error deleting friend relationships:', friendsError2);
          }
          
          // Delete from profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', user.id);
            
          if (profileError) {
            console.error('Error deleting user profile:', profileError);
          }
          
          // Finally sign out the user
          await supabase.auth.signOut();
          
          console.log('Account deletion completed');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
      }
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
    if (onFriendsListItemHover) {
      onFriendsListItemHover(null);
    }
    if (onDailyDropItemHover) {
      onDailyDropItemHover(null);
    }
    
    // EXACT SAME LOGIC AS SETTINGS - just for Daily Drop
    if (isInDailyDropView) {
      if (onDailyDropItemClick) {
        onDailyDropItemClick(index);
      }
    } else if (isInFriendsListView) {
      if (onFriendsListItemClick) {
        onFriendsListItemClick(index);
      }
    } else if (isInSettingsView) {
      onSettingsItemClick(index);
      if (item === 'Product Feedback') {
        handleProductFeedback();
      } else if (item === 'Delete Account') {
        handleDeleteAccount();
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
      } else if (item === 'The Daily Drop') {
        if (onDailyDropClick) {
          onDailyDropClick();
        }
      } else if (item === 'Friends' && isSignedIn && onFriendsClick) {
        onFriendsClick();
      } else if (item === 'Edit My Five') {
        window.location.href = '/edit-my-five';
      } else if (item === 'Share Profile') {
        handleShareProfile();
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

  const getHeaderTitle = () => {
    if (isInFriendsListView) return 'My Friends';
    if (isInDailyDropView) return 'The Daily Drop';
    if (isInSettingsView) return 'Settings';
    if (isInFriendsView) return 'Friends';
    return 'FivePod';
  };

  console.log('MenuPanel currentMenuItems:', currentMenuItems, 'currentSelectedIndex:', currentSelectedIndex);

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
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold">{getHeaderTitle()}</span>
          {/* Battery indicator for Settings, Friends, Friends List, and Daily Drop view */}
          {(isInSettingsView || isInFriendsView || isInFriendsListView || isInDailyDropView) && (
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
              onMouseEnter={() => handleItemHover(item, index)}
              onMouseLeave={handleItemLeave}
              onTouchStart={() => handleTouchStart(item, index)}
              onTouchEnd={handleTouchEnd}
            >
              <span>{item}</span>
              {currentSelectedIndex === index && (isInSettingsView || isInFriendsView || isInFriendsListView || isInDailyDropView) && (
                <span className="text-white">▶</span>
              )}
              {currentSelectedIndex === index && !isInSettingsView && !isInFriendsView && !isInFriendsListView && !isInDailyDropView && 
               ((item === 'Settings' && isSignedIn) || (item === 'Friends' && isSignedIn) || item === 'The Daily Drop') && (
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
