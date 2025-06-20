
import React from 'react';

interface MenuHeaderProps {
  isInSettingsView: boolean;
  isInFriendsView: boolean;
  isInFriendsListView: boolean;
  isInDailyDropView: boolean;
}

const MenuHeader: React.FC<MenuHeaderProps> = ({
  isInSettingsView,
  isInFriendsView,
  isInFriendsListView,
  isInDailyDropView
}) => {
  const getHeaderTitle = () => {
    if (isInFriendsListView) return 'My Friends';
    if (isInDailyDropView) return 'The Daily Drop';
    if (isInSettingsView) return 'Settings';
    if (isInFriendsView) return 'Friends';
    return 'FivePod';
  };

  const showBattery = isInSettingsView || isInFriendsView || isInFriendsListView || isInDailyDropView;

  return (
    <div className="flex items-center justify-between mb-3 text-xs">
      <span className="font-bold">{getHeaderTitle()}</span>
      {showBattery && (
        <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
      )}
    </div>
  );
};

export default MenuHeader;
