
import React from 'react';
import { Music } from 'lucide-react';

interface EmptyStateProps {
  displayName: string;
  isViewingOthers: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ displayName, isViewingOthers }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
      <Music size={32} className="text-blue-600 mb-3" />
      <h3 className="font-bold text-lg mb-1">{displayName} Five</h3>
      <p className="text-sm text-gray-600 leading-tight">
        {isViewingOthers ? 'No songs shared yet' : 'Add the 5 songs that are on repeat for you right now'}
      </p>
    </div>
  );
};

export default EmptyState;
