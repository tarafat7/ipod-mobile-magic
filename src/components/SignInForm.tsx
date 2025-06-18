
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { supabase } from '../integrations/supabase/client';
import ProfilePictureUpload from './ProfilePictureUpload';

interface FormData {
  fullName: string;
  email: string;
  password: string;
}

interface SignInFormProps {
  onSubmit: (formData: FormData, profilePicture?: File | null) => void;
  isLoading: boolean;
  error: string | null;
  onErrorClear: () => void;
}

const SignInForm = ({ onSubmit, isLoading, error, onErrorClear }: SignInFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: ''
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [currentProfilePictureUrl, setCurrentProfilePictureUrl] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSignInMode, setIsSignInMode] = useState(false);

  useEffect(() => {
    // Check if we're in edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'edit') {
      setIsEditMode(true);
      loadUserData();
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
            password: '' // Don't pre-fill password
          });
          setCurrentProfilePictureUrl(profile.profile_picture_url);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const uploadProfilePicture = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/profile.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) {
        console.error('Profile picture upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Unexpected profile picture upload error:', error);
      return null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    onErrorClear();
  };

  const handleProfilePictureSelect = (file: File | null) => {
    setProfilePicture(file);
  };

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('Sign in error:', error);
        // Handle error - you might want to pass this to the parent component
        return;
      }

      // Redirect to main page on successful sign in
      window.location.href = '/';
    } catch (error) {
      console.error('Unexpected sign in error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignInMode) {
      await handleSignIn();
      return;
    }
    
    if (isEditMode) {
      // Handle account update
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          let profilePictureUrl = currentProfilePictureUrl;
          
          // Upload new profile picture if one was selected
          if (profilePicture) {
            const uploadedUrl = await uploadProfilePicture(profilePicture, user.id);
            if (uploadedUrl) {
              profilePictureUrl = uploadedUrl;
            }
          }
          
          // Update profile in profiles table
          await supabase
            .from('profiles')
            .update({
              full_name: formData.fullName,
              email: formData.email,
              profile_picture_url: profilePictureUrl
            })
            .eq('id', user.id);
          
          // Update auth user metadata and email
          const updateData: any = {};
          
          // Update email if changed
          if (formData.email !== user.email) {
            updateData.email = formData.email;
          }
          
          // Update password if provided
          if (formData.password) {
            updateData.password = formData.password;
          }
          
          // Update user metadata with full name and profile picture URL
          updateData.data = {
            full_name: formData.fullName,
            profile_picture_url: profilePictureUrl
          };
          
          await supabase.auth.updateUser(updateData);
          
          // Redirect back to main page
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error updating account:', error);
      }
    } else {
      onSubmit(formData, profilePicture);
    }
  };

  const handleCancel = () => {
    window.location.href = '/';
  };

  const toggleMode = () => {
    setIsSignInMode(!isSignInMode);
    onErrorClear();
  };

  const getTitle = () => {
    if (isEditMode) return 'Edit your account';
    if (isSignInMode) return 'Welcome back';
    return 'Create your account to get started';
  };

  const getButtonText = () => {
    if (isLoading) {
      if (isEditMode) return 'Updating...';
      if (isSignInMode) return 'Signing In...';
      return 'Creating Account...';
    }
    if (isEditMode) return 'Update Account';
    if (isSignInMode) return 'Sign In';
    return 'Create Account';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FivePod</h1>
          <p className="text-gray-600">
            {getTitle()}
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSignInMode && (
            <>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
              
              <ProfilePictureUpload
                onImageSelect={handleProfilePictureSelect}
                currentImage={currentProfilePictureUrl}
                disabled={isLoading}
              />
            </>
          )}
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="mt-1"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <Label htmlFor="password">
              Password {isEditMode && '(leave blank to keep current)'}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required={!isEditMode}
              className="mt-1"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex space-x-3">
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 mt-6"
              disabled={isLoading}
            >
              {getButtonText()}
            </Button>
            
            {isEditMode && (
              <Button 
                type="button" 
                variant="outline"
                onClick={handleCancel}
                className="flex-1 mt-6"
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
        </form>
      </div>
    </div>
  );
};

export default SignInForm;
