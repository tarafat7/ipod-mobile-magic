
import React from 'react';

const AboutScreen: React.FC = () => {
  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="p-2">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="font-bold">About</span>
          <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
        </div>
      </div>

      {/* About Content */}
      <div className="px-4 py-6">
        <h3 className="font-bold text-lg mb-4 text-center">FivePod</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          FivePod is a small experiment in sharing music the way we used to. It's meant to feel quiet and low-pressure, like handing someone your iPod and saying "just listen." There are no profiles to perfect and nothing to perform. Just five songs that say what you might not feel like putting into words. I built it to feel a little like the early 2000s, a way to check in with people without needing to say much at all.
          <br /><br />
          I hope you enjoy it.
        </p>
      </div>
    </div>
  );
};

export default AboutScreen;
