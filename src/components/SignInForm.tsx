
import React, { useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuthMode } from '../hooks/useAuthMode';
import { useAuthSubmit } from '../hooks/useAuthSubmit';
import AuthContainer from './auth/AuthContainer';
import AuthForm from './auth/AuthForm';

interface SignInFormProps {
  onSubmit: (data: { fullName: string; username: string; email: string; password: string }) => void;
  isLoading: boolean;
  error: string | null;
  onErrorClear: () => void;
  isLoginMode?: boolean;
  onModeToggle?: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ 
  onSubmit, 
  isLoading, 
  error, 
  onErrorClear,
  isLoginMode = false,
  onModeToggle
}) => {
  const { isEditMode, currentUser, initialData } = useAuthMode();
  const { handleEditSubmit } = useAuthSubmit();

  useEffect(() => {
    if (!isEditMode && !isLoginMode) {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          window.location.href = '/';
        }
      };
      checkAuth();
    }
  }, [isEditMode, isLoginMode]);

  const handleSubmit = async (formData: { fullName: string; username: string; email: string; password: string }) => {
    if (isEditMode && currentUser) {
      try {
        await handleEditSubmit(formData, currentUser);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    } else {
      onSubmit(formData);
    }
  };

  const getTitle = () => {
    if (isEditMode) return 'Edit Account';
    if (isLoginMode) return 'Sign In to FivePod';
    return 'Sign Up for FivePod';
  };

  return (
    <AuthContainer title={getTitle()}>
      <AuthForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        onErrorClear={onErrorClear}
        isEditMode={isEditMode}
        isLoginMode={isLoginMode}
        onModeToggle={onModeToggle}
        initialData={initialData}
      />
    </AuthContainer>
  );
};

export default SignInForm;
