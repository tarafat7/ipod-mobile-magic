
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from './use-toast';

interface FormData {
  fullName: string;
  email: string;
  password: string;
}

export const useSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

  const signUp = async (formData: FormData, profilePicture?: File | null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting signup process with data:', { 
        email: formData.email, 
        fullName: formData.fullName,
        hasProfilePicture: !!profilePicture
      });

      // Generate a device ID if one doesn't exist
      let deviceId = localStorage.getItem('fivepod_device_id');
      if (!deviceId) {
        deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('fivepod_device_id', deviceId);
      }
      console.log('Device ID:', deviceId);

      // Prepare user metadata
      const userMetadata: any = {
        full_name: formData.fullName
      };

      // Sign up with Supabase first
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: userMetadata
        }
      });

      console.log('Signup response:', { data, error: signUpError });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        setError(signUpError.message);
        return null;
      }

      if (data.user) {
        console.log('User created successfully:', data.user.id);
        
        // Upload profile picture if provided
        let profilePictureUrl = null;
        if (profilePicture) {
          console.log('Uploading profile picture...');
          profilePictureUrl = await uploadProfilePicture(profilePicture, data.user.id);
          
          if (profilePictureUrl) {
            console.log('Profile picture uploaded successfully:', profilePictureUrl);
            
            // Update the user metadata with profile picture URL
            await supabase.auth.updateUser({
              data: {
                ...userMetadata,
                profile_picture_url: profilePictureUrl
              }
            });
          }
        }
        
        // Check if the user needs email confirmation
        if (!data.session) {
          // User needs to confirm email
          toast({
            title: "Check your email!",
            description: `We've sent a confirmation link to ${formData.email}. Please click the link to activate your account.`,
          });
          return { needsConfirmation: true };
        } else {
          // User is immediately logged in (email confirmation disabled)
          return { needsConfirmation: false };
        }
      }
    } catch (err) {
      console.error('Unexpected signup error:', err);
      setError('An unexpected error occurred. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }

    return null;
  };

  return {
    signUp,
    isLoading,
    error,
    setError
  };
};
