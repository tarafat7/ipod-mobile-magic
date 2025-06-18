
import React from 'react';
import { Button } from './ui/button';

interface EmailConfirmationScreenProps {
  email: string;
  onReturnToiPod: () => void;
}

const EmailConfirmationScreen = ({ email, onReturnToiPod }: EmailConfirmationScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
        <p className="text-gray-600 mb-4">
          We've sent a confirmation link to <strong>{email}</strong>
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Please click the link in your email to activate your account and complete the signup process.
        </p>
        <Button 
          onClick={onReturnToiPod}
          variant="outline"
          className="w-full"
        >
          Return to iPod
        </Button>
      </div>
    </div>
  );
};

export default EmailConfirmationScreen;
