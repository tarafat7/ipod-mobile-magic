
import React, { useState, useEffect } from 'react';
import { getMenuItems } from '../../data/iPodData';
import { supabase } from '../../integrations/supabase/client';
import MenuPanel from './MenuPanel';
import ContentPanel from './ContentPanel';

interface MenuScreenProps {
  selectedMenuItem: number;
  selectedSettingsItem: number;
  isInSettingsView: boolean;
  onSettingsItemChange: (index: number) => void;
  isInMyFiveView?: boolean;
  selectedMyFiveSong?: number;
  onMyFiveSongChange?: (index: number) => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ 
  selectedMenuItem, 
  selectedSettingsItem,
  isInSettingsView,
  onSettingsItemChange,
  isInMyFiveView = false,
  selectedMyFiveSong = 0,
  onMyFiveSongChange
}) => {
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

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

  const handleSettingsClick = () => {
    console.log('Settings clicked');
  };

  const handleMenuItemClick = (index: number) => {
    console.log('Menu item clicked:', index);
  };

  const handleSettingsItemClick = (index: number) => {
    onSettingsItemChange(index);
  };

  const handleSettingsAction = async (action: string) => {
    switch (action) {
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
      />
      <ContentPanel
        menuItems={menuItems}
        selectedMenuItem={selectedMenuItem}
        isInSettingsView={isInSettingsView}
        isSignedIn={isSignedIn}
        isInMyFiveView={isInMyFiveView}
        selectedMyFiveSong={selectedMyFiveSong}
      />
    </div>
  );
};

export default MenuScreen;
