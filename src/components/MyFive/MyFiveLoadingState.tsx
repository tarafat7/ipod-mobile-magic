
import React from 'react';
import { Music } from 'lucide-react';

interface MyFiveLoadingStateProps {
  displayName: string;
}

const MyFiveLoadingState: React.FC<MyFiveLoadingStateProps> = ({ displayName }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
      <Music size={32} className="text-blue-600 mb-3 animate-pulse" />
      <p className="text-sm text-gray-600">Loading {displayName} five...</p>
    </div>
  );
};

export default MyFiveLoadingState;
