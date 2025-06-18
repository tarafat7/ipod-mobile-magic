
import React, { useState, useEffect } from 'react';
import { getMenuItems } from '../../data/iPodData';
import { supabase } from '../../integrations/supabase/client';
import MenuPanel from './MenuPanel';
import ContentPanel from './ContentPanel';

interface MenuScreenProps {
  selectedMenuItem: number;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ selectedMenuItem }) => {
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isInSettingsView, setIsInSettingsView] = useState(false);
  const [selectedSettingsItem, setSelectedSettingsItem] = useState(0);
  const [currentSelectedMenuItem, setCurrentSelectedMenuItem] = useState(selectedMenuItem);

  useEffect(() => {
    setCurrentSelectedMenuItem(selectedMenuItem);
  }, [selectedMenuItem]);

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
    setIsInSettingsView(true);
    setSelectedSettingsItem(0);
  };

  const handleBackToMain = () => {
    setIsInSettingsView(false);
    setSelectedSettingsItem(0);
  };

  const handleMenuItemClick = (index: number) => {
    setCurrentSelectedMenuItem(index);
  };

  const handleSettingsAction = async (action: string) => {
    switch (action) {
      case 'Edit Account':
        window.location.href = '/sign-in?mode=edit';
        break;
      case 'Logout':
        await supabase.auth.signOut();
        handleBackToMain();
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
        handleBackToMain();
        break;
      default:
        break;
    }
  };

  return (
    <div className="h-full flex">
      <MenuPanel
        menuItems={menuItems}
        selectedMenuItem={currentSelectedMenuItem}
        isInSettingsView={isInSettingsView}
        isSignedIn={isSignedIn}
        selectedSettingsItem={selectedSettingsItem}
        onSettingsClick={handleSettingsClick}
        onSettingsAction={handleSettingsAction}
        onMenuItemClick={handleMenuItemClick}
      />
      <ContentPanel
        menuItems={menuItems}
        selectedMenuItem={currentSelectedMenuItem}
        isInSettingsView={isInSettingsView}
        isSignedIn={isSignedIn}
      />
    </div>
  );
};

export default MenuScreen;
