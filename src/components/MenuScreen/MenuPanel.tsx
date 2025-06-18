
import React from 'react';

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
  onSettingsItemClick
}) => {
  const currentMenuItems = isInSettingsView ? settingsMenuItems : menuItems;
  const currentSelectedIndex = isInSettingsView ? selectedSettingsItem : selectedMenuItem;

  return (
    <div className={`w-1/2 bg-white border-r border-gray-300 transition-transform duration-300 relative ${
      isInSettingsView ? 'transform translate-x-0' : 'transform translate-x-0'
    }`}>
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
                currentSelectedIndex === index
                  ? 'text-white'
                  : 'text-black hover:bg-gray-100'
              } ${item === 'Delete Account' ? 'text-red-600' : ''}`}
              style={{
                backgroundColor: currentSelectedIndex === index ? '#3398d8' : 'transparent'
              }}
              onClick={() => {
                if (isInSettingsView) {
                  onSettingsItemClick(index);
                  onSettingsAction(item);
                } else {
                  onMenuItemClick(index);
                  if (item === 'Settings' && isSignedIn) {
                    onSettingsClick();
                  }
                }
              }}
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
