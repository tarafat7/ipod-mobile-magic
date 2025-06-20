
import React from 'react';

interface AuthHeaderProps {
  isEditMode: boolean;
  isSignInMode: boolean;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ isEditMode, isSignInMode }) => {
  const getTitle = () => {
    if (isEditMode) return 'Edit your account';
    if (isSignInMode) return 'Welcome back';
    return 'Create your account to get started';
  };

  return (
    <div className="text-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">FivePod</h1>
      <p className="text-gray-600">
        {getTitle()}
      </p>
    </div>
  );
};

export default AuthHeader;
