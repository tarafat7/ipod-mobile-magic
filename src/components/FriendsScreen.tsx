
import React from 'react';
import { Users } from 'lucide-react';

const FriendsScreen: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
      <Users size={32} className="text-gray-600 mb-3" />
      <h3 className="font-bold text-lg mb-2">Friends</h3>
      <p className="text-sm text-gray-600 leading-tight">
        Connect with friends<br />
        to share music
      </p>
    </div>
  );
};

export default FriendsScreen;
