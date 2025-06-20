
import React from 'react';

interface MenuItemProps {
  item: string;
  index: number;
  isSelected: boolean;
  isInSettingsView: boolean;
  isInFriendsView: boolean;
  isInFriendsListView: boolean;
  isInDailyDropView: boolean;
  isSignedIn: boolean;
  onClick: (item: string, index: number) => void;
  onHover: (item: string, index: number) => void;
  onLeave: () => void;
  onTouchStart: (item: string, index: number) => void;
  onTouchEnd: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
  item,
  index,
  isSelected,
  isInSettingsView,
  isInFriendsView,
  isInFriendsListView,
  isInDailyDropView,
  isSignedIn,
  onClick,
  onHover,
  onLeave,
  onTouchStart,
  onTouchEnd
}) => {
  const showArrow = isSelected && (
    (isInSettingsView || isInFriendsView || isInFriendsListView || isInDailyDropView) ||
    (!isInSettingsView && !isInFriendsView && !isInFriendsListView && !isInDailyDropView && 
     ((item === 'Settings' && isSignedIn) || (item === 'Friends' && isSignedIn) || item === 'The Daily Drop'))
  );

  return (
    <div
      className={`px-2 py-1 text-sm flex items-center justify-between cursor-pointer ${
        isSelected
          ? 'text-white'
          : 'text-black hover:bg-gray-100'
      } ${item === 'Delete Account' ? 'text-red-600' : ''}`}
      style={{
        backgroundColor: isSelected ? '#3398d8' : 'transparent'
      }}
      onClick={() => onClick(item, index)}
      onMouseEnter={() => onHover(item, index)}
      onMouseLeave={onLeave}
      onTouchStart={() => onTouchStart(item, index)}
      onTouchEnd={onTouchEnd}
    >
      <span>{item}</span>
      {showArrow && (
        <span className="text-white">▶</span>
      )}
    </div>
  );
};

export default MenuItem;
