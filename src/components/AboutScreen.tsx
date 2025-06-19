
import React from 'react';

const AboutScreen: React.FC = () => {
  return (
    <div className="h-full bg-white p-4 flex flex-col justify-start">
      <div className="max-w-full">
        <div className="text-sm leading-relaxed text-gray-800 space-y-3">
          <p>
            FivePod is a small experiment in sharing music the way we used to. It's meant to feel quiet and low-pressure, like handing someone your iPod and saying, "just listen."
          </p>
          <p>
            I hope it helps you feel a little more connected, without needing to say anything at all.
          </p>
        </div>
        
        {/* Centered FivePod Logo */}
        <div className="flex justify-center mt-6">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 bg-purple-500 rounded-md flex items-center justify-center">
              <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;
