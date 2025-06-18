
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { supabase } from '../integrations/supabase/client';

interface FormData {
  fullName: string;
  email: string;
  password: string;
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
    password: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);

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
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode) {
      // Handle account update
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Update profile
          await supabase
            .from('profiles')
            .update({
              full_name: formData.fullName,
              email: formData.email
            })
            .eq('id', user.id);
          
          // Update auth email if changed
          if (formData.email !== user.email) {
            await supabase.auth.updateUser({ email: formData.email });
          }
          
          // Update password if provided
          if (formData.password) {
            await supabase.auth.updateUser({ password: formData.password });
          }
          
          // Redirect back to main page
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error updating account:', error);
      }
    } else {
      onSubmit(formData);
    }
  };

  const handleCancel = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FivePod</h1>
          <p className="text-gray-600">
            {isEditMode ? 'Edit your account' : 'Create your account to get started'}
          </p>
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
              {isLoading ? 
                (isEditMode ? 'Updating...' : 'Creating Account...') : 
                (isEditMode ? 'Update Account' : 'Create Account')
              }
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
        </form>
      </div>
    </div>
  );
};

export default SignInForm;
