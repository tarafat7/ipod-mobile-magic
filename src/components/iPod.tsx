import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';

interface Song {
  id: number;
  title: string;
  artist: string;
  duration: string;
}

const IPod = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [selectedMenuItem, setSelectedMenuItem] = useState(0);
  const [selectedSong, setSelectedSong] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const wheelRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    'Cover Flow',
    'Music',
    'Games',
    'Settings',
    'Sign In'
  ];

  const songs: Song[] = [
    { id: 1, title: 'Bohemian Rhapsody', artist: 'Queen', duration: '5:55' },
    { id: 2, title: 'Hotel California', artist: 'Eagles', duration: '6:30' },
    { id: 3, title: 'Stairway to Heaven', artist: 'Led Zeppelin', duration: '8:02' },
    { id: 4, title: 'Sweet Child O Mine', artist: 'Guns N Roses', duration: '5:03' },
    { id: 5, title: 'Imagine', artist: 'John Lennon', duration: '3:07' }
  ];

  const handleWheelMove = (e: React.MouseEvent) => {
    if (!wheelRef.current) return;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    
    const normalizedAngle = ((angle * 180) / Math.PI + 360) % 360;
    
    if (currentScreen === 'menu') {
      const newIndex = Math.floor((normalizedAngle / 360) * menuItems.length);
      setSelectedMenuItem(newIndex);
    } else if (currentScreen === 'music') {
      const newIndex = Math.floor((normalizedAngle / 360) * songs.length);
      setSelectedSong(newIndex);
    }
  };

  const handleCenterClick = () => {
    if (currentScreen === 'menu') {
      if (selectedMenuItem === 1) { // Music
        setCurrentScreen('music');
      } else {
        setIsPlaying(!isPlaying);
      }
    } else if (currentScreen === 'music') {
      setIsPlaying(!isPlaying);
    }
  };

  const handleMenuClick = () => {
    if (currentScreen !== 'menu') {
      setCurrentScreen('menu');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu':
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
            <div className="w-1/2 bg-gray-50 flex flex-col items-center justify-center p-4">
              <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-green-600 rounded-md"></div>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">Spotify</h3>
              <p className="text-sm text-gray-600 text-center leading-tight">
                Sign in to view<br />your library
              </p>
            </div>
          </div>
        );
      case 'music':
        return (
          <div className="text-black bg-white h-full p-4 flex flex-col justify-center">
            <div className="text-center">
              <h3 className="font-bold text-lg mb-4">Now Playing</h3>
              <div className="mb-4">
                <div className="text-base font-semibold">{songs[selectedSong].title}</div>
                <div className="text-sm text-gray-600">{songs[selectedSong].artist}</div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="text-sm text-gray-500">
                  {currentTime} / {songs[selectedSong].duration}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-gray-400 h-1 rounded-full w-1/3"></div>
                </div>
              </div>

              <div className={`inline-block px-3 py-1 rounded text-sm ${
                isPlaying ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {isPlaying ? '▶ Playing' : '⏸ Paused'}
              </div>
            </div>
          </div>
        );
      default:
        return <div className="bg-white h-full flex items-center justify-center text-black">iPod</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="relative">
        {/* iPod Body - Matte Silver with Sheen */}
        <div className="bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 rounded-3xl p-6 shadow-2xl border border-gray-300 w-80 md:w-96" style={{ height: '660px' }}>
          
          {/* Screen - Thicker black bevel and larger screen */}
          <div className="bg-gray-900 rounded-xl p-2 mb-6 shadow-inner">
            <div className="bg-gray-100 rounded-lg min-h-[300px] border border-gray-300 overflow-hidden">
              {renderScreen()}
            </div>
          </div>

          {/* Click Wheel - Bigger to match proportions, no inner ring */}
          <div className="relative mx-auto w-60 h-60">
            <div 
              ref={wheelRef}
              className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 rounded-full shadow-lg border border-gray-400 cursor-pointer"
              onMouseMove={handleWheelMove}
            >
              
              {/* MENU Text */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                <button 
                  className="text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm tracking-wider"
                  onClick={handleMenuClick}
                >
                  MENU
                </button>
              </div>
              
              {/* Control Buttons */}
              <button className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors">
                <SkipForward size={16} />
              </button>
              
              <button className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-6 h-6 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                </div>
              </button>
              
              <button className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors">
                <SkipBack size={16} />
              </button>

              {/* Center Button - No inner ring, bigger to match proportions */}
              <button 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full shadow-inner border border-gray-400 hover:shadow-lg transition-all duration-200 active:scale-95"
                onClick={handleCenterClick}
              >
              </button>
            </div>
          </div>
        </div>

        {/* Subtle highlight effect for sheen */}
        <div className="absolute top-6 left-6 right-6 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-3xl pointer-events-none"></div>
      </div>
    </div>
  );
};

export default IPod;
