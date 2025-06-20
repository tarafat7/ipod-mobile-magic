
import React, { useState, useEffect } from 'react';
import { getMenuItems } from '../../data/iPodData';
import { supabase } from '../../integrations/supabase/client';
import { MenuScreenState, settingsMenuItems, dailyDropMenuItems } from './MenuScreenTypes';
import { MenuScreenActions } from './MenuScreenActions';
import MenuScreenContent from './MenuScreenContent';

interface MenuScreenLogicProps {
  selectedMenuItem: number;
}

const MenuScreenLogic: React.FC<MenuScreenLogicProps> = ({ selectedMenuItem }) => {
  const [state, setState] = useState<MenuScreenState>({
    menuItems: [],
    isSignedIn: false,
    showSettingsMenu: false,
    isInSettingsView: false,
    selectedSettingsItem: 0,
    showDailyDropMenu: false,
    isInDailyDropView: false,
    selectedDailyDropItem: 0,
  });

  useEffect(() => {
    const loadMenuItems = async () => {
      const items = await getMenuItems();
      const { data: { session } } = await supabase.auth.getSession();
      
      setState(prev => ({
        ...prev,
        menuItems: items,
        isSignedIn: !!session
      }));
    };

    loadMenuItems();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setState(prev => ({
        ...prev,
        isSignedIn: !!session
      }));
      loadMenuItems();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const selectedItem = state.menuItems[selectedMenuItem];
    if (selectedItem === 'Settings' && state.isSignedIn) {
      setState(prev => ({
        ...prev,
        showSettingsMenu: true,
        showDailyDropMenu: false
      }));
    } else if (selectedItem === 'The Daily Drop') {
      setState(prev => ({
        ...prev,
        showDailyDropMenu: true,
        showSettingsMenu: false
      }));
    } else {
      setState(prev => ({
        ...prev,
        showSettingsMenu: false,
        showDailyDropMenu: false,
        isInSettingsView: false,
        isInDailyDropView: false
      }));
    }
  }, [selectedMenuItem, state.menuItems, state.isSignedIn]);

  const handleSettingsClick = () => {
    if (state.showSettingsMenu && state.isSignedIn) {
      setState(prev => ({ ...prev, isInSettingsView: true }));
    }
  };

  const handleDailyDropClick = () => {
    if (state.showDailyDropMenu) {
      setState(prev => ({ ...prev, isInDailyDropView: true }));
    }
  };

  const handleBackToMain = () => {
    setState(prev => ({
      ...prev,
      isInSettingsView: false,
      selectedSettingsItem: 0,
      isInDailyDropView: false,
      selectedDailyDropItem: 0
    }));
  };

  const currentMenuItems = state.isInDailyDropView ? dailyDropMenuItems : 
                          state.isInSettingsView ? settingsMenuItems : 
                          state.menuItems;
  const currentSelectedIndex = state.isInDailyDropView ? state.selectedDailyDropItem : 
                              state.isInSettingsView ? state.selectedSettingsItem : 
                              selectedMenuItem;

  return (
    <div className="h-full flex">
      {/* Left menu panel */}
      <div className={`w-1/2 bg-white border-r border-gray-300 transition-all duration-300 relative ${state.isInSettingsView || state.isInDailyDropView ? 'transform translate-x-0' : ''}`}>
        {/* Battery indicator */}
        {!state.isInSettingsView && !state.isInDailyDropView && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
          </div>
        )}
        
        <div className="p-2">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold">
              {state.isInDailyDropView ? 'The Daily Drop' : 
               state.isInSettingsView ? 'Settings' : 'FivePod'}
            </span>
            {(state.isInSettingsView || state.isInDailyDropView) && (
              <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
            )}
          </div>
          <div className="space-y-0">
            {currentMenuItems.map((item, index) => (
              <div
                key={item}
                className={`px-2 py-1 text-sm flex items-center justify-between cursor-pointer ${
                  currentSelectedIndex === index && (state.isInSettingsView || state.isInDailyDropView)
                    ? 'bg-blue-500 text-white'
                    : currentSelectedIndex === index && !state.isInSettingsView && !state.isInDailyDropView
                    ? 'bg-gray-200 text-black'
                    : 'text-black hover:bg-gray-100'
                } ${item === 'Delete Account' ? 'text-red-600' : ''}`}
                onClick={() => {
                  if (state.isInDailyDropView) {
                    MenuScreenActions.handleDailyDropAction(item);
                  } else if (state.isInSettingsView) {
                    MenuScreenActions.handleSettingsAction(item);
                    handleBackToMain();
                  } else if (item === 'Settings' && state.isSignedIn) {
                    handleSettingsClick();
                  } else if (item === 'The Daily Drop') {
                    handleDailyDropClick();
                  }
                }}
              >
                <span>{item}</span>
                {currentSelectedIndex === index && (state.isInSettingsView || state.isInDailyDropView) && (
                  <span className="text-white">▶</span>
                )}
                {currentSelectedIndex === index && !state.isInSettingsView && !state.isInDailyDropView && 
                 ((item === 'Settings' && state.isSignedIn) || item === 'The Daily Drop') && (
                  <span className="text-black">▶</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right content panel */}
      <div className="w-1/2 bg-gray-50 transition-all duration-300">
        <MenuScreenContent
          selectedItem={state.menuItems[selectedMenuItem]}
          showDailyDropMenu={state.showDailyDropMenu}
          showSettingsMenu={state.showSettingsMenu}
          isSignedIn={state.isSignedIn}
          isInDailyDropView={state.isInDailyDropView}
          isInSettingsView={state.isInSettingsView}
        />
      </div>
    </div>
  );
};

export default MenuScreenLogic;
