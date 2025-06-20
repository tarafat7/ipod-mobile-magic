import React, { useState, useEffect } from 'react';
import { getMenuItems } from '../../data/iPodData';
import { supabase } from '../../integrations/supabase/client';
import MenuPanel from './MenuPanel';
import ContentPanel from './ContentPanel';
import { useDailyDropState } from '../../hooks/useDailyDropState';
import { useSettingsState } from '../../hooks/useSettingsState';
import { useMyFiveState } from '../../hooks/useMyFiveState';

interface SpotifyTrackInfo {
  name: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
  addedDate: string;
}

interface MenuScreenProps {
  selectedMenuItem: number;
  selectedSettingsItem: number;
  isInSettingsView: boolean;
  onSettingsItemChange: (index: number) => void;
  isInMyFiveView?: boolean;
  selectedMyFiveSong?: number;
  onMyFiveSongChange?: (index: number) => void;
  isSharedView?: boolean;
  sharedUserProfile?: {full_name: string} | null;
  sharedUserSongs?: SpotifyTrackInfo[];
  isInFriendsView?: boolean;
  selectedFriendsItem?: number;
  onFriendsItemChange?: (index: number) => void;
  isInFriendsListView?: boolean;
  selectedFriendsListItem?: number;
  onFriendsListItemChange?: (index: number) => void;
  friendsList?: any[];
  isInDailyDropView?: boolean;
  selectedDailyDropItem?: number;
  onDailyDropItemChange?: (index: number) => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ 
  selectedMenuItem, 
  selectedSettingsItem,
  isInSettingsView,
  onSettingsItemChange,
  isInMyFiveView = false,
  selectedMyFiveSong = 0,
  onMyFiveSongChange,
  isSharedView = false,
  sharedUserProfile = null,
  sharedUserSongs = [],
  isInFriendsView = false,
  selectedFriendsItem = 0,
  onFriendsItemChange,
  isInFriendsListView = false,
  selectedFriendsListItem = 0,
  onFriendsListItemChange,
  friendsList = [],
  isInDailyDropView = false,
  selectedDailyDropItem = 0,
  onDailyDropItemChange
}) => {
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  
  const settingsState = useSettingsState();
  const [hoveredFriendsItem, setHoveredFriendsItem] = useState<string | null>(null);
  const [hoveredFriendsListItem, setHoveredFriendsListItem] = useState<any>(null);
  const [hoveredDailyDropItem, setHoveredDailyDropItem] = useState<string | null>(null);

  useEffect(() => {
    const loadMenuItems = async () => {
      const items = await getMenuItems();
      setMenuItems(items);
      
      const { data: { session } } = await supabase.auth.getSession();
      setIsSignedIn(!!session);
    };

    loadMenuItems();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsSignedIn(!!session);
      loadMenuItems();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isSharedView && !sharedUserProfile) {
      const currentPath = window.location.pathname;
      const userIdMatch = currentPath.match(/\/my-five\/([^\/]+)/);
      
      if (userIdMatch) {
        const userId = userIdMatch[1];
        loadSharedProfile(userId);
      }
    }
  }, [isSharedView, sharedUserProfile]);

  const loadSharedProfile = async (userId: string) => {
    try {
      // This will be handled by the parent component or through a different mechanism
    } catch (error) {
      console.error('Error loading shared profile:', error);
    }
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
  };

  const handleFriendsClick = () => {
    console.log('Friends clicked');
  };

  const handleDailyDropClick = () => {
    console.log('Daily Drop clicked - this should not be called from MenuScreen');
  };

  const handleMenuItemClick = (index: number) => {
    console.log('Menu item clicked:', index);
  };

  const handleSettingsItemClick = (index: number) => {
    onSettingsItemChange(index);
  };

  const handleFriendsItemClick = (index: number) => {
    if (onFriendsItemChange) {
      onFriendsItemChange(index);
    }
  };

  const handleFriendsListItemClick = (index: number) => {
    if (onFriendsListItemChange) {
      onFriendsListItemChange(index);
    }
  };

  const handleDailyDropItemClick = (index: number) => {
    if (onDailyDropItemChange) {
      onDailyDropItemChange(index);
    }
  };

  const handleFriendsItemHover = (item: string | null) => {
    setHoveredFriendsItem(item);
  };

  const handleFriendsListItemHover = (friend: any) => {
    setHoveredFriendsListItem(friend);
  };

  const handleDailyDropItemHover = (item: string | null) => {
    setHoveredDailyDropItem(item);
  };

  useEffect(() => {
    if (isInFriendsListView && friendsList.length > 0) {
      const selectedFriend = friendsList[selectedFriendsListItem];
      setHoveredFriendsListItem(selectedFriend);
    }
  }, [selectedFriendsListItem, isInFriendsListView, friendsList]);

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
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  const handleSettingsAction = async (action: string) => {
    switch (action) {
      case 'Share Profile':
        await handleShareProfile();
        break;
      case 'Edit Account':
        window.location.href = '/signin?mode=edit';
        break;
      case 'Logout':
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Error during logout:', error);
        }
        break;
      case 'Delete Account':
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await supabase.from('profiles').delete().eq('id', user.id);
              await supabase.auth.signOut();
            }
          } catch (error) {
            console.error('Error deleting account:', error);
          }
        }
        break;
      default:
        break;
    }
  };

  const handleFriendsAction = async (action: string) => {
    switch (action) {
      case 'Add a friend':
        window.location.href = '/search-friends';
        break;
      default:
        break;
    }
  };

  return (
    <div className="h-full flex">
      {!isInMyFiveView && (
        <MenuPanel
          menuItems={menuItems}
          selectedMenuItem={selectedMenuItem}
          isInSettingsView={isInSettingsView}
          isSignedIn={isSignedIn}
          selectedSettingsItem={selectedSettingsItem}
          onSettingsClick={handleSettingsClick}
          onSettingsAction={handleSettingsAction}
          onMenuItemClick={handleMenuItemClick}
          onSettingsItemClick={handleSettingsItemClick}
          onSettingsItemHover={settingsState.handleSettingsItemHover}
          isSharedView={isSharedView}
          isInFriendsView={isInFriendsView}
          selectedFriendsItem={selectedFriendsItem}
          onFriendsClick={handleFriendsClick}
          onFriendsAction={handleFriendsAction}
          onFriendsItemClick={handleFriendsItemClick}
          onFriendsItemHover={handleFriendsItemHover}
          isInFriendsListView={isInFriendsListView}
          selectedFriendsListItem={selectedFriendsListItem}
          onFriendsListItemClick={handleFriendsListItemClick}
          onFriendsListItemHover={handleFriendsListItemHover}
          friendsList={friendsList}
          isInDailyDropView={isInDailyDropView}
          selectedDailyDropItem={selectedDailyDropItem}
          onDailyDropClick={handleDailyDropClick}
          onDailyDropItemClick={handleDailyDropItemClick}
          onDailyDropItemHover={handleDailyDropItemHover}
        />
      )}
      <ContentPanel
        menuItems={menuItems}
        selectedMenuItem={selectedMenuItem}
        isInSettingsView={isInSettingsView}
        isSignedIn={isSignedIn}
        isInMyFiveView={isInMyFiveView}
        selectedMyFiveSong={selectedMyFiveSong}
        hoveredSettingsItem={settingsState.hoveredSettingsItem}
        isSharedView={isSharedView}
        sharedUserProfile={sharedUserProfile}
        sharedUserSongs={sharedUserSongs}
        isInFriendsView={isInFriendsView}
        selectedFriendsItem={selectedFriendsItem}
        hoveredFriendsItem={hoveredFriendsItem}
        isInFriendsListView={isInFriendsListView}
        selectedFriendsListItem={selectedFriendsListItem}
        hoveredFriendsListItem={hoveredFriendsListItem}
        friendsList={friendsList}
        isInDailyDropView={isInDailyDropView}
        selectedDailyDropItem={selectedDailyDropItem}
        hoveredDailyDropItem={hoveredDailyDropItem}
      />
    </div>
  );
};

export default MenuScreen;
