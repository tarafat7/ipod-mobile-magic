
import React from 'react';
import { Music } from 'lucide-react';

interface MyFiveEmptyStateProps {
  displayName: string;
  isSharedView: boolean;
}

const MyFiveEmptyState: React.FC<MyFiveEmptyStateProps> = ({ displayName, isSharedView }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
      <Music size={32} className="text-blue-600 mb-3" />
      <h3 className="font-bold text-lg mb-1">{displayName} Five</h3>
      <p className="text-sm text-gray-600 leading-tight">
        {isSharedView ? 'No songs shared yet' : 'Add the 5 songs that are on repeat for you right now'}
      </p>
    </div>
  );
};

export default MyFiveEmptyState;
