
import React, { useRef } from 'react';
import { SkipForward, SkipBack } from 'lucide-react';

interface ClickWheelProps {
  onWheelMove: (e: React.MouseEvent) => void;
  onCenterClick: () => void;
  onMenuClick: () => void;
}

const ClickWheel: React.FC<ClickWheelProps> = ({ onWheelMove, onCenterClick, onMenuClick }) => {
  const wheelRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative mx-auto w-60 h-60 md:w-56 md:h-56 flex-shrink-0">
      <div 
        ref={wheelRef}
        className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 rounded-full shadow-lg border border-gray-400 cursor-pointer"
        onMouseMove={onWheelMove}
      >
        
        {/* MENU Text */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
          <button 
            className="text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm tracking-wider"
            onClick={onMenuClick}
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

        {/* Center Button */}
        <button 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full shadow-inner border border-gray-400 hover:shadow-lg transition-all duration-200 active:scale-95"
          onClick={onCenterClick}
        >
        </button>
      </div>
    </div>
  );
};

export default ClickWheel;
