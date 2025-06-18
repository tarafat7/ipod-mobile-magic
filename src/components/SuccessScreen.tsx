
import React from 'react';
import { Button } from './ui/button';

interface SuccessScreenProps {
  onReturnToiPod: () => void;
}

const SuccessScreen = ({ onReturnToiPod }: SuccessScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
        <p className="text-gray-600 mb-6">Your account has been created successfully.</p>
        <Button 
          onClick={onReturnToiPod}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Return to FivePod
        </Button>
      </div>
    </div>
  );
};

export default SuccessScreen;
