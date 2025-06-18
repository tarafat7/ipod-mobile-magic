
import React, { useState } from 'react';

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
}

const settingsMenuItems = [
  'Share Profile',
  'Edit Account', 
  'Edit My Five',
  'Logout',
  'Delete Account'
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
  isSharedView = false
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // Modify menu items for shared view
  const displayMenuItems = isSharedView && !isSignedIn 
    ? ['Sign In', ...menuItems.filter(item => item !== 'Sign In')] 
    : (isInSettingsView ? settingsMenuItems : menuItems);
  
  const currentMenuItems = displayMenuItems;
  const currentSelectedIndex = isInSettingsView ? selectedSettingsItem : selectedMenuItem;

  const handleItemClick = (item: string, index: number) => {
    // Clear hover state on click
    setHoveredItem(null);
    if (onSettingsItemHover) {
      onSettingsItemHover(null);
    }
    
    if (isInSettingsView) {
      onSettingsItemClick(index);
      if (item === 'Edit My Five') {
        window.location.href = '/edit-my-five';
      } else {
        onSettingsAction(item);
      }
    } else {
      onMenuItemClick(index);
      if (item === 'Settings' && isSignedIn) {
        onSettingsClick();
      }
    }
  };

  const handleItemHover = (item: string) => {
    console.log('Hovering over item:', item);
    setHoveredItem(item);
    if (isInSettingsView && onSettingsItemHover) {
      console.log('Calling onSettingsItemHover with:', item);
      onSettingsItemHover(item);
    }
  };

  const handleItemLeave = () => {
    console.log('Left item hover');
    setHoveredItem(null);
    if (isInSettingsView && onSettingsItemHover) {
      console.log('Calling onSettingsItemHover with null');
      onSettingsItemHover(null);
    }
  };

  return (
    <div className={`w-1/2 bg-white border-r border-gray-300 transition-all duration-300 relative`}>
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
              className={`px-2 py-1 text-sm flex items-center justify-between cursor-pointer transition-colors duration-200 ${
                currentSelectedIndex === index
                  ? 'text-white'
                  : 'text-black hover:bg-gray-100'
              } ${item === 'Delete Account' ? 'text-red-600' : ''}`}
              style={{
                backgroundColor: currentSelectedIndex === index ? '#3398d8' : 'transparent'
              }}
              onClick={() => handleItemClick(item, index)}
              onMouseEnter={() => handleItemHover(item)}
              onMouseLeave={handleItemLeave}
            >
              <span>{item}</span>
              {currentSelectedIndex === index && isInSettingsView && (
                <span className="text-white">▶</span>
              )}
              {currentSelectedIndex === index && !isInSettingsView && item === 'Settings' && isSignedIn && (
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
