
import React, { useEffect } from 'react';

interface IPodContainerProps {
  children: React.ReactNode;
}

const IPodContainer: React.FC<IPodContainerProps> = ({ children }) => {
  useEffect(() => {
    // Prevent pull-to-refresh and overscroll behavior on mobile
    const preventDefault = (e: TouchEvent) => {
      e.preventDefault();
    };

    const preventOverscroll = (e: TouchEvent) => {
      // Prevent pull-to-refresh
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const target = e.target as HTMLElement;
        
        // Allow scrolling only within scrollable containers
        const scrollableParent = target.closest('.overflow-y-auto, .overflow-auto');
        if (!scrollableParent) {
          e.preventDefault();
        }
      }
    };

    // Apply to document body to prevent global pull-to-refresh
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
    
    // Add touch event listeners
    document.addEventListener('touchmove', preventOverscroll, { passive: false });
    document.addEventListener('touchstart', preventDefault, { passive: false });

    return () => {
      // Cleanup
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
      document.removeEventListener('touchmove', preventOverscroll);
      document.removeEventListener('touchstart', preventDefault);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center md:p-4 overflow-hidden">
      <div className="relative w-full h-screen md:w-auto md:h-auto">
        <div className="bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 w-full h-full md:rounded-3xl md:p-6 shadow-2xl border border-gray-400 md:w-96 md:h-[680px] flex flex-col touch-none select-none" style={{ overscrollBehavior: 'none' }}>
          {children}
        </div>
        <div className="absolute top-6 left-6 right-6 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-3xl pointer-events-none hidden md:block"></div>
      </div>
    </div>
  );
};

export default IPodContainer;
