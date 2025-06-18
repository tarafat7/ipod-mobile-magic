
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

  const renderRightPanel = () => {
    const selectedItem = menuItems[selectedMenuItem];
    
    switch (selectedItem) {
      case 'Friends':
        return <FriendsScreen />;
      case 'Settings':
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
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-green-600 rounded-md"></div>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-1">iPod.js</h3>
            <p className="text-sm text-gray-600 text-center leading-tight">
              Your personal<br />music player
            </p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex">
      {/* Left menu panel */}
      <div className="w-1/2 bg-white border-r border-gray-300">
        <div className="p-2">
          <div className="flex items-center gap-1 mb-3 text-xs">
            <div className="w-3 h-2 bg-green-500 rounded-sm"></div>
            <span className="font-bold">iPod.js</span>
          </div>
          <div className="space-y-0">
            {menuItems.map((item, index) => (
              <div
                key={item}
                className={`px-2 py-1 text-sm flex items-center justify-between ${
                  selectedMenuItem === index
                    ? 'bg-blue-500 text-white'
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                <span>{item}</span>
                {selectedMenuItem === index && (
                  <span className="text-white">▶</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right content panel */}
      <div className="w-1/2 bg-gray-50">
        {renderRightPanel()}
      </div>
    </div>
  );
};

export default MenuScreen;
