
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

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = {
      currentTarget: e.currentTarget,
      clientX: touch.clientX,
      clientY: touch.clientY,
    } as React.MouseEvent;
    
    onWheelMove(mouseEvent);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    onWheelLeave();
  };

  // Simplified menu button handler
  const handleMenuButtonClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Menu button clicked - calling onMenuClick');
    onMenuClick();
  };

  // Simplified center button handler
  const handleCenterButtonClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Center button clicked - calling onCenterClick');
    onCenterClick();
  };

  return (
    <div className="relative w-72 h-72 md:w-64 md:h-64 flex-shrink-0">
      <div 
        ref={wheelRef}
        className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 rounded-full shadow-lg border border-gray-400 cursor-pointer touch-none"
        onMouseMove={onWheelMove}
        onMouseLeave={onWheelLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* MENU Button - Made larger and more responsive */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-16 h-8">
          <button 
            className="w-full h-full text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm tracking-wider touch-manipulation flex items-center justify-center bg-transparent border-none cursor-pointer"
            onClick={handleMenuButtonClick}
            onTouchEnd={handleMenuButtonClick}
          >
            MENU
          </button>
        </div>
        
        {/* Control Buttons */}
        <button className="absolute right-8 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors">
          <SkipForward size={16} />
        </button>
        
        <button className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-6 h-6 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
          </div>
        </button>
        
        <button className="absolute left-8 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors">
          <SkipBack size={16} />
        </button>

        {/* Center Button */}
        <button 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full shadow-inner border border-gray-400 hover:shadow-lg transition-all duration-200 active:scale-95 touch-manipulation"
          onClick={handleCenterButtonClick}
          onTouchEnd={handleCenterButtonClick}
        >
        </button>
      </div>
    </div>
  );
};

export default ClickWheel;
