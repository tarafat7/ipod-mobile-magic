
import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useSignUp } from '../hooks/useSignUp';
import SignInForm from '../components/SignInForm';
import EmailConfirmationScreen from '../components/EmailConfirmationScreen';
import SuccessScreen from '../components/SuccessScreen';

const SignIn = () => {
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const { signUp, isLoading, error, setError } = useSignUp();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is already logged in, redirect to main page
        window.location.href = '/';
      }
    };
    checkAuth();
  }, []);

  const handleSubmit = async (formData: { fullName: string; email: string; password: string }) => {
    setUserEmail(formData.email);
    const result = await signUp(formData);
    
    if (result) {
      if (result.needsConfirmation) {
        setShowEmailConfirmation(true);
      } else {
        setIsSubmitted(true);
      }
    }
  };

  const handleReturnToiPod = () => {
    // Redirect to the main iPod page
    window.location.href = '/';
  };

  const handleErrorClear = () => {
    setError(null);
  };

  if (showEmailConfirmation) {
    return (
      <EmailConfirmationScreen 
        email={userEmail} 
        onReturnToiPod={handleReturnToiPod} 
      />
    );
  }

  if (isSubmitted) {
    return (
      <SuccessScreen onReturnToiPod={handleReturnToiPod} />
    );
  }

  return (
    <SignInForm 
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      onErrorClear={handleErrorClear}
    />
  );
};

export default SignIn;
