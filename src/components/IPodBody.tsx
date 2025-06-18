
import React from 'react';
import Screen from './Screen';
import ClickWheel from './ClickWheel';

interface IPodBodyProps {
  currentScreen: string;
  selectedMenuItem: number;
  selectedSong: number;
  isPlaying: boolean;
  currentTime: string;
  selectedSettingsItem: number;
  isInSettingsView: boolean;
  isInMyFiveView: boolean;
  selectedMyFiveSong: number;
  sharedUserProfile?: { full_name: string | null } | null;
  sharedUserSongs?: string[];
  isSharedView?: boolean;
  onWheelMove: (e: React.MouseEvent) => void;
  onWheelLeave: () => void;
  onCenterClick: () => void;
  onMenuClick: () => void;
  onSettingsItemChange: (index: number) => void;
  onMyFiveSongChange: (index: number) => void;
}

const IPodBody: React.FC<IPodBodyProps> = ({
  currentScreen,
  selectedMenuItem,
  selectedSong,
  isPlaying,
  currentTime,
  selectedSettingsItem,
  isInSettingsView,
  isInMyFiveView,
  selectedMyFiveSong,
  sharedUserProfile,
  sharedUserSongs,
  isSharedView,
  onWheelMove,
  onWheelLeave,
  onCenterClick,
  onMenuClick,
  onSettingsItemChange,
  onMyFiveSongChange
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 w-full h-full md:rounded-3xl md:p-6 shadow-2xl border border-gray-400 md:w-96 md:h-[680px] flex flex-col touch-none select-none">
      
      <Screen 
        currentScreen={currentScreen}
        selectedMenuItem={selectedMenuItem}
        selectedSong={selectedSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        selectedSettingsItem={selectedSettingsItem}
        isInSettingsView={isInSettingsView}
        onSettingsItemChange={onSettingsItemChange}
        isInMyFiveView={isInMyFiveView}
        selectedMyFiveSong={selectedMyFiveSong}
        onMyFiveSongChange={onMyFiveSongChange}
        sharedUserProfile={sharedUserProfile}
        sharedUserSongs={sharedUserSongs}
        isSharedView={isSharedView}
      />

      <div className="flex-1 flex items-center justify-center md:items-center" style={{ alignItems: 'center', paddingBottom: '2rem' }}>
        <ClickWheel 
          onWheelMove={onWheelMove}
          onWheelLeave={onWheelLeave}
          onCenterClick={onCenterClick}
          onMenuClick={onMenuClick}
        />
      </div>
    </div>
  );
};

export default IPodBody;
