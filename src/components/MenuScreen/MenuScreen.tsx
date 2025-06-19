import React, { useState, useEffect } from 'react';
import { getMenuItems } from '../../data/iPodData';
import { supabase } from '../../integrations/supabase/client';
import MenuPanel from './MenuPanel';
import ContentPanel from './ContentPanel';

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
  onFriendsItemChange
}) => {
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [hoveredSettingsItem, setHoveredSettingsItem] = useState<string | null>(null);
  const [hoveredFriendsItem, setHoveredFriendsItem] = useState<string | null>(null);

  useEffect(() => {
    const loadMenuItems = async () => {
      const items = await getMenuItems();
      setMenuItems(items);
      
      // Check auth status
      const { data: { session } } = await supabase.auth.getSession();
      setIsSignedIn(!!session);
    };

    loadMenuItems();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsSignedIn(!!session);
      loadMenuItems();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Add effect to load shared profile data when in shared view
  useEffect(() => {
    if (isSharedView && !sharedUserProfile) {
      // Extract user ID from URL
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
      // For now, we'll rely on the shared props being passed down
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

  const handleSettingsItemHover = (item: string | null) => {
    setHoveredSettingsItem(item);
  };

  const handleFriendsItemHover = (item: string | null) => {
    setHoveredFriendsItem(item);
  };

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
          onSettingsItemHover={handleSettingsItemHover}
          isSharedView={isSharedView}
          isInFriendsView={isInFriendsView}
          selectedFriendsItem={selectedFriendsItem}
          onFriendsClick={handleFriendsClick}
          onFriendsAction={handleFriendsAction}
          onFriendsItemClick={handleFriendsItemClick}
          onFriendsItemHover={handleFriendsItemHover}
        />
      )}
      <ContentPanel
        menuItems={menuItems}
        selectedMenuItem={selectedMenuItem}
        isInSettingsView={isInSettingsView}
        isSignedIn={isSignedIn}
        isInMyFiveView={isInMyFiveView}
        selectedMyFiveSong={selectedMyFiveSong}
        hoveredSettingsItem={hoveredSettingsItem}
        isSharedView={isSharedView}
        sharedUserProfile={sharedUserProfile}
        sharedUserSongs={sharedUserSongs}
        isInFriendsView={isInFriendsView}
        selectedFriendsItem={selectedFriendsItem}
        hoveredFriendsItem={hoveredFriendsItem}
      />
    </div>
  );
};

export default MenuScreen;
