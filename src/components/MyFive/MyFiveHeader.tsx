
import React from 'react';

interface MyFiveHeaderProps {
  displayName: string;
}

const MyFiveHeader: React.FC<MyFiveHeaderProps> = ({ displayName }) => {
  return (
    <div className="p-2 flex-shrink-0">
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="font-bold">{displayName} Five</span>
        <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
      </div>
    </div>
  );
};

export default MyFiveHeader;
