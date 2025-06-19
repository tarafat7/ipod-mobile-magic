import React, { useState, useEffect } from 'react';
import { getMenuItems } from '../data/iPodData';
import FriendsScreen from './FriendsScreen';
import SettingsScreen from './SettingsScreen';
import { User, Music } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

interface MenuScreenProps {
  selectedMenuItem: number;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ selectedMenuItem }) => {
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isInSettingsView, setIsInSettingsView] = useState(false);
  const [selectedSettingsItem, setSelectedSettingsItem] = useState(0);

  const settingsMenuItems = [
    'Share Profile',
    'Edit Account', 
    'Edit My Five',
    'Logout',
    'Delete Account'
  ];

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
      loadMenuItems(); // Reload menu items when auth state changes
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const selectedItem = menuItems[selectedMenuItem];
    if (selectedItem === 'Settings' && isSignedIn) {
      setShowSettingsMenu(true);
    } else {
      setShowSettingsMenu(false);
      setIsInSettingsView(false);
    }
  }, [selectedMenuItem, menuItems, isSignedIn]);

  const handleSettingsClick = () => {
    if (showSettingsMenu && isSignedIn) {
      setIsInSettingsView(true);
    }
  };

  const handleBackToMain = () => {
    setIsInSettingsView(false);
    setSelectedSettingsItem(0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    handleBackToMain();
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Delete user profile first
          await supabase.from('profiles').delete().eq('id', user.id);
          // Then sign out
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
    handleBackToMain();
  };

  const handleEditAccount = () => {
    window.location.href = '/sign-in?mode=edit';
  };

  const handleEditMyFive = () => {
    window.location.href = '/edit-my-five';
  };

  const handleSettingsAction = (item: string) => {
    switch (item) {
      case 'Edit Account':
        handleEditAccount();
        break;
      case 'Edit My Five':
        handleEditMyFive();
        break;
      case 'Logout':
        handleLogout();
        break;
      case 'Delete Account':
        handleDeleteAccount();
        break;
      default:
        // Handle other actions later
        break;
    }
  };

  const renderRightPanel = () => {
    if (isInSettingsView) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-purple-600 rounded-md"></div>
            </div>
          </div>
          <h3 className="font-bold text-lg mb-1">Settings</h3>
          <p className="text-sm text-gray-600 text-center leading-tight">
            Configure your<br />FivePod settings
          </p>
        </div>
      );
    }

    const selectedItem = menuItems[selectedMenuItem];
    
    switch (selectedItem) {
      case 'Friends':
        return <FriendsScreen />;
      case 'Settings':
        if (showSettingsMenu && isSignedIn) {
          return (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
              <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-green-600 rounded-md"></div>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">Settings</h3>
              <p className="text-sm text-gray-600 text-center leading-tight">
                Configure your<br />FivePod settings
              </p>
            </div>
          );
        }
        return <SettingsScreen />;
      case 'My Five':
        return (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <Music size={32} className="text-blue-600 mb-3" />
            <h3 className="font-bold text-lg mb-1">My Five</h3>
            <p className="text-sm text-gray-600 leading-tight">
              Add the 5 songs that are<br />
              on repeat for you right now
            </p>
          </div>
        );
      case 'Sign In':
        return (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <User size={32} className="text-gray-600 mb-3" />
            <h3 className="font-bold text-lg mb-1">Sign In</h3>
            <p className="text-sm text-gray-600 leading-tight">
              Create an account<br />
              to get started
            </p>
          </div>
        );
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-purple-600 rounded-md"></div>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-1">FivePod</h3>
            <p className="text-sm text-gray-600 text-center leading-tight">
              Your personal<br />music player
            </p>
          </div>
        );
    }
  };

  const currentMenuItems = isInSettingsView ? settingsMenuItems : menuItems;
  const currentSelectedIndex = isInSettingsView ? selectedSettingsItem : selectedMenuItem;

  return (
    <div className="h-full flex">
      {/* Left menu panel */}
      <div className={`w-1/2 bg-white border-r border-gray-300 transition-all duration-300 relative ${isInSettingsView ? 'transform translate-x-0' : ''}`}>
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
                  currentSelectedIndex === index && isInSettingsView
                    ? 'bg-blue-500 text-white'
                    : currentSelectedIndex === index && !isInSettingsView
                    ? 'bg-gray-200 text-black'
                    : 'text-black hover:bg-gray-100'
                } ${item === 'Delete Account' ? 'text-red-600' : ''}`}
                onClick={() => {
                  if (isInSettingsView) {
                    handleSettingsAction(item);
                  } else if (item === 'Settings' && isSignedIn) {
                    handleSettingsClick();
                  }
                }}
              >
                <span>{item}</span>
                {currentSelectedIndex === index && isInSettingsView && (
                  <span className="text-white">▶</span>
                )}
                {currentSelectedIndex === index && !isInSettingsView && item === 'Settings' && isSignedIn && (
                  <span className="text-black">▶</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right content panel */}
      <div className="w-1/2 bg-gray-50 transition-all duration-300">
        {renderRightPanel()}
      </div>
    </div>
  );
};

export default MenuScreen;
