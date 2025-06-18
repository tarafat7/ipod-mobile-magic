
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { supabase } from '../integrations/supabase/client';

const SignIn = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate a device ID if one doesn't exist
      let deviceId = localStorage.getItem('ipod_device_id');
      if (!deviceId) {
        deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('ipod_device_id', deviceId);
      }

      console.log('Signing up with device_id:', deviceId);

      // Sign up with Supabase - include device_id in user metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
            device_id: deviceId
          }
        }
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        setError(signUpError.message);
        return;
      }

      console.log('Signup successful:', data);

      if (data.user) {
        console.log('User created, waiting for profile creation...');
        
        // Wait longer for the trigger to create the profile
        setTimeout(async () => {
          try {
            // Check if profile exists first
            const { data: existingProfile, error: fetchError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
              console.error('Error checking profile:', fetchError);
            }

            if (existingProfile) {
              console.log('Profile already exists:', existingProfile);
              // Update the existing profile with device_id if it's missing
              if (!existingProfile.device_id) {
                const { error: updateError } = await supabase
                  .from('profiles')
                  .update({ device_id: deviceId })
                  .eq('id', data.user.id);

                if (updateError) {
                  console.error('Error updating profile with device_id:', updateError);
                } else {
                  console.log('Device ID updated successfully:', deviceId);
                }
              }
            } else {
              console.log('Profile does not exist yet, creating manually...');
              // If profile doesn't exist, create it manually
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  full_name: formData.fullName,
                  email: formData.email,
                  device_id: deviceId
                });

              if (insertError) {
                console.error('Error creating profile manually:', insertError);
              } else {
                console.log('Profile created manually with device_id:', deviceId);
              }
            }
          } catch (err) {
            console.error('Error in profile creation/update:', err);
          }
        }, 2000); // Increased wait time

        setIsSubmitted(true);
      }
    } catch (err) {
      console.error('Unexpected signup error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToiPod = () => {
    // Redirect to the main iPod page
    window.location.href = '/';
  };

  if (isSubmitted) {
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
            onClick={handleReturnToiPod}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Return to FivePod
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FivePod</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="mt-1"
              disabled={isLoading}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 mt-6"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
