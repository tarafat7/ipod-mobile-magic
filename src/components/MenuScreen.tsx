
import React from 'react';
import { menuItems } from '../data/iPodData';

interface MenuScreenProps {
  selectedMenuItem: number;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ selectedMenuItem }) => {
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
};

export default MenuScreen;
