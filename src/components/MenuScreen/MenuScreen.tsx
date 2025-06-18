
import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import MenuPanel from './MenuPanel';
import ContentPanel from './ContentPanel';
import MyFiveFullView from '../MyFiveFullView';
import { useMenuLogic } from '../../hooks/useMenuLogic';
import { useSettingsActions } from '../../hooks/useSettingsActions';

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
  sharedUserSongs = []
}) => {
  const [hoveredSettingsItem, setHoveredSettingsItem] = useState<string | null>(null);
  const { menuItems, isSignedIn } = useMenuLogic();
  const { handleSettingsAction } = useSettingsActions();

  console.log('MenuScreen render - isInMyFiveView:', isInMyFiveView, 'selectedMyFiveSong:', selectedMyFiveSong);

  // If we're in My Five view, show the full view
  if (isInMyFiveView) {
    console.log('Rendering MyFiveFullView');
    return (
      <div className="h-full">
        <MyFiveFullView 
          selectedSongIndex={selectedMyFiveSong}
          isSharedView={isSharedView}
          sharedUserProfile={sharedUserProfile}
          sharedUserSongs={sharedUserSongs}
        />
      </div>
    );
  }

  const handleSettingsClick = () => {
    console.log('Settings clicked');
  };

  const handleMenuItemClick = (index: number) => {
    console.log('Menu item clicked:', index);
  };

  const handleSettingsItemClick = (index: number) => {
    onSettingsItemChange(index);
  };

  const handleSettingsItemHover = (item: string | null) => {
    setHoveredSettingsItem(item);
  };

  return (
    <div className="h-full flex">
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
      />
      <ContentPanel
        menuItems={menuItems}
        selectedMenuItem={selectedMenuItem}
        isInSettingsView={isInSettingsView}
        isSignedIn={isSignedIn}
        isInMyFiveView={false}
        selectedMyFiveSong={selectedMyFiveSong}
        hoveredSettingsItem={hoveredSettingsItem}
        isSharedView={isSharedView}
        sharedUserProfile={sharedUserProfile}
        sharedUserSongs={sharedUserSongs}
      />
    </div>
  );
};

export default MenuScreen;
