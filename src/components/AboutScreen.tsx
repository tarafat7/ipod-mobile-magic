
import React from 'react';
import { Info } from 'lucide-react';

const AboutScreen: React.FC = () => {
  return (
    <div className="w-full bg-gray-50 h-full flex flex-col">
      <div className="flex items-center justify-between p-2 text-xs border-b border-gray-300">
        <span className="font-bold">About</span>
        <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Info size={40} className="text-blue-600 mb-6" />
        <h2 className="font-bold text-xl mb-6">About FivePod</h2>
        
        <div className="text-sm text-gray-800 leading-relaxed max-w-md space-y-4">
          <p>
            FivePod is a small experiment in sharing music the way we used to. It's meant to feel quiet and low-pressure, like handing someone your iPod and saying "just listen."
          </p>
          <p>
            There are no profiles to perfect and nothing to perform. Just five songs that say what you might not feel like putting into words.
          </p>
          <p>
            I built it to feel a little like the early 2000s, a way to check in with people without needing to say much at all.
          </p>
          <p className="italic font-medium">
            I hope you enjoy it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;
