
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { supabase } from '../integrations/supabase/client';
import AuthHeader from './Auth/AuthHeader';
import AuthForm from './Auth/AuthForm';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  username: string;
}

interface SignInFormProps {
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
  error: string | null;
  onErrorClear: () => void;
}

const SignInForm = ({ onSubmit, isLoading, error, onErrorClear }: SignInFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    username: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSignInMode, setIsSignInMode] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'edit') {
      setIsEditMode(true);
      loadUserData();
    } else if (mode === 'signin') {
      setIsSignInMode(true);
    }
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setFormData({
            fullName: profile.full_name || '',
            email: profile.email || '',
            password: '',
            username: profile.username || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return;
      }

      window.location.href = '/';
    } catch (error) {
      console.error('Unexpected sign in error:', error);
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    if (isSignInMode) {
      await handleSignIn();
      return;
    }
    
    if (isEditMode) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({
              full_name: data.fullName,
              email: data.email,
              username: data.username
            })
            .eq('id', user.id);
          
          const updateData: any = {};
          
          if (data.email !== user.email) {
            updateData.email = data.email;
          }
          
          if (data.password) {
            updateData.password = data.password;
          }
          
          updateData.data = {
            full_name: data.fullName,
            username: data.username
          };
          
          await supabase.auth.updateUser(updateData);
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error updating account:', error);
      }
    } else {
      onSubmit(data);
    }
  };

  const handleCancel = () => {
    window.location.href = '/';
  };

  const toggleMode = () => {
    setIsSignInMode(!isSignInMode);
    onErrorClear();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        <AuthHeader isEditMode={isEditMode} isSignInMode={isSignInMode} />
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <AuthForm
          onSubmit={handleFormSubmit}
          isLoading={isLoading}
          error={error}
          onErrorClear={onErrorClear}
          isEditMode={isEditMode}
          isSignInMode={isSignInMode}
          formData={formData}
          onFormDataChange={setFormData}
        />
        
        <div className="flex space-x-3 mt-4">
          {isEditMode && (
            <Button 
              type="button" 
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
        </div>

        {!isEditMode && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-700 text-sm underline"
              disabled={isLoading}
            >
              {isSignInMode ? 'or create account' : 'or sign in'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignInForm;
