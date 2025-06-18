
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';

interface Song {
  id: number;
  title: string;
  artist: string;
  duration: string;
}

const iPod = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [selectedMenuItem, setSelectedMenuItem] = useState(0);
  const [selectedSong, setSelectedSong] = useState(0);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState('0:00');
  const wheelRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    'Music',
    'Photos',
    'Videos',
    'Extras',
    'Settings',
    'Shuffle Songs'
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
    
    // Simple wheel navigation simulation
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
      switch (selectedMenuItem) {
        case 0:
          setCurrentScreen('music');
          break;
        case 5:
          setIsPlaying(!isPlaying);
          break;
        default:
          break;
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
          <div className="text-white space-y-1">
            <h2 className="text-center font-bold mb-4 text-sm">iPod</h2>
            {menuItems.map((item, index) => (
              <div
                key={item}
                className={`px-3 py-1 text-xs ${
                  selectedMenuItem === index
                    ? 'bg-blue-500 text-white rounded'
                    : 'text-gray-300'
                }`}
              >
                {selectedMenuItem === index && '▶ '}{item}
              </div>
            ))}
          </div>
        );
      case 'music':
        return (
          <div className="text-white space-y-2">
            <div className="text-center mb-4">
              <h3 className="font-bold text-sm">Now Playing</h3>
              <div className="mt-2">
                <div className="text-xs font-semibold">{songs[selectedSong].title}</div>
                <div className="text-xs text-gray-400">{songs[selectedSong].artist}</div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-center text-gray-400">
                {currentTime} / {songs[selectedSong].duration}
              </div>
              <div className="w-full bg-gray-600 rounded-full h-1">
                <div className="bg-white h-1 rounded-full w-1/3"></div>
              </div>
            </div>

            <div className="text-center mt-4">
              <div className={`inline-block px-2 py-1 rounded text-xs ${
                isPlaying ? 'bg-green-500' : 'bg-gray-500'
              }`}>
                {isPlaying ? '▶ Playing' : '⏸ Paused'}
              </div>
            </div>
          </div>
        );
      default:
        return <div className="text-white text-center">iPod</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="relative">
        {/* iPod Body */}
        <div className="bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 rounded-3xl p-6 shadow-2xl transform hover:scale-105 transition-transform duration-300 w-80 md:w-96">
          
          {/* Screen */}
          <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl p-4 mb-8 shadow-inner">
            <div className="bg-black rounded-xl p-4 min-h-[200px] border-2 border-gray-400">
              {renderScreen()}
            </div>
          </div>

          {/* Click Wheel */}
          <div className="relative mx-auto w-48 h-48">
            <div 
              ref={wheelRef}
              className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-300 rounded-full shadow-lg border-4 border-gray-400 cursor-pointer hover:shadow-xl transition-shadow duration-200"
              onMouseMove={handleWheelMove}
            >
              {/* Outer Ring */}
              <div className="absolute inset-2 rounded-full border-2 border-gray-400">
                
                {/* Control Buttons */}
                <button 
                  className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                  onClick={handleMenuClick}
                >
                  <span className="text-xs font-bold">MENU</span>
                </button>
                
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors">
                  <SkipForward size={16} />
                </button>
                
                <button className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors">
                  <SkipBack size={16} />
                </button>
                
                <button className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors">
                  <SkipBack size={16} className="rotate-180" />
                </button>

                {/* Center Button */}
                <button 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-b from-gray-200 to-gray-400 rounded-full shadow-lg border-2 border-gray-500 flex items-center justify-center hover:shadow-xl transition-all duration-200 active:scale-95"
                  onClick={handleCenterClick}
                >
                  {isPlaying ? <Pause size={20} className="text-gray-700" /> : <Play size={20} className="text-gray-700" />}
                </button>
              </div>
            </div>
          </div>

          {/* Apple Logo */}
          <div className="text-center mt-4">
            <div className="inline-block w-6 h-6 bg-gray-600 rounded-full relative">
              <div className="absolute inset-1 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Reflection Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl pointer-events-none"></div>
      </div>
    </div>
  );
};

export default iPod;
