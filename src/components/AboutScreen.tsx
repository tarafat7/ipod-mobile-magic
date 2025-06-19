
import React from 'react';

const AboutScreen: React.FC = () => {
  return (
    <div className="h-full bg-white p-4 flex flex-col justify-center">
      <div className="max-w-full">
        <div className="text-sm leading-relaxed text-gray-800 space-y-3">
          <p>
            FivePod is a small experiment in sharing music the way we used to. It's meant to feel quiet and low-pressure, like handing someone your iPod and saying "just listen."
          </p>
          <p>
            There are no profiles to perfect and nothing to perform. Just five songs that say what you might not feel like putting into words.
          </p>
          <p>
            I built it to feel a little like the early 2000s, a way to check in with people without needing to say much at all. I hope you enjoy it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;
