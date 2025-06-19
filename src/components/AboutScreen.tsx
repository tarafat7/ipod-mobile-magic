
import React from 'react';
import { Music } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';

const AboutScreen: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`h-full bg-white p-4 flex flex-col ${isMobile ? 'justify-start pt-8' : 'justify-center'}`}>
      <div className="max-w-full">
        <div className="text-sm leading-relaxed text-gray-800 space-y-3">
          <p>
            <span className="inline-flex items-center gap-1">
              <Music size={16} className="text-purple-600" />
              FivePod
            </span> is a small experiment in sharing music the way we used to. It's meant to feel quiet and low-pressure, like handing someone your iPod and saying, "just listen."
          </p>
          <p>
            I hope it helps you feel a little more connected, without needing to say anything at all.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;
