
import React, { useRef } from 'react';
import { SkipForward, SkipBack } from 'lucide-react';

interface ClickWheelProps {
  onWheelMove: (e: React.MouseEvent) => void;
  onWheelLeave: () => void;
  onCenterClick: () => void;
  onMenuClick: () => void;
}

const ClickWheel: React.FC<ClickWheelProps> = ({ onWheelMove, onWheelLeave, onCenterClick, onMenuClick }) => {
  const wheelRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-72 h-72 md:w-64 md:h-64 flex-shrink-0">
      <div 
        ref={wheelRef}
        className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 rounded-full shadow-lg border border-gray-400 cursor-pointer"
        onMouseMove={onWheelMove}
        onMouseLeave={onWheelLeave}
      >
        
        {/* MENU Button - made larger and more clickable */}
        <button 
          className="absolute top-4 left-1/2 transform -translate-x-1/2 text-gray-700 font-medium text-sm p-4 hover:bg-gray-200 rounded transition-colors z-10"
          onClick={onMenuClick}
        >
          MENU
        </button>
        
        {/* Control Buttons */}
        <button className="absolute right-8 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-700">
          <SkipForward size={16} />
        </button>
        
        <button className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-6 h-6 flex items-center justify-center text-gray-700">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
          </div>
        </button>
        
        <button className="absolute left-8 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-700">
          <SkipBack size={16} />
        </button>

        {/* Center Button */}
        <button 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full shadow-inner border border-gray-400"
          onClick={onCenterClick}
        >
        </button>
      </div>
    </div>
  );
};

export default ClickWheel;
