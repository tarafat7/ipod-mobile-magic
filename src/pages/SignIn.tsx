
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
  const [isLoginMode, setIsLoginMode] = useState(false);
  const { signUp, isLoading, error, setError } = useSignUp();

  useEffect(() => {
    const checkAuth = async () => {
      // Check URL parameters to determine mode
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      
      if (mode === 'login') {
        setIsLoginMode(true);
        return; // Don't redirect if in login mode
      }
      
      // Only redirect if user is logged in AND we're not in edit or login mode
      if (mode !== 'edit') {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // User is already logged in, redirect to main page
          window.location.href = '/';
        }
      }
    };
    checkAuth();
  }, []);

  const handleModeToggle = () => {
    setIsLoginMode(!isLoginMode);
    setError(null); // Clear any existing errors when toggling
  };

  const handleSubmit = async (formData: { fullName: string; username: string; email: string; password: string }) => {
    setUserEmail(formData.email);
    
    if (isLoginMode) {
      // Handle sign in for existing users
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (error) {
          setError(error.message);
        } else {
          // Successful login, redirect to main page
          window.location.href = '/';
        }
      } catch (error) {
        setError('An error occurred during sign in');
      }
    } else {
      // Handle sign up for new users
      const result = await signUp(formData);
      
      if (result) {
        if (result.needsConfirmation) {
          setShowEmailConfirmation(true);
        } else {
          setIsSubmitted(true);
        }
      }
    }
  };

  const handleReturnToFivePod = () => {
    // Redirect to the main FivePod page
    window.location.href = '/';
  };

  const handleErrorClear = () => {
    setError(null);
  };

  if (showEmailConfirmation) {
    return (
      <EmailConfirmationScreen 
        email={userEmail} 
        onReturnToiPod={handleReturnToFivePod} 
      />
    );
  }

  if (isSubmitted) {
    return (
      <SuccessScreen onReturnToiPod={handleReturnToFivePod} />
    );
  }

  return (
    <SignInForm 
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      onErrorClear={handleErrorClear}
      isLoginMode={isLoginMode}
      onModeToggle={handleModeToggle}
    />
  );
};

export default SignIn;
