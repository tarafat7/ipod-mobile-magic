
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { supabase } from '../integrations/supabase/client';

interface SignInFormProps {
  onSubmit: (data: { fullName: string; email: string; password: string }) => void;
  isLoading: boolean;
  error: string | null;
  onErrorClear: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSubmit, isLoading, error, onErrorClear }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check if we're in edit mode and load existing user data
    const checkEditMode = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      
      if (mode === 'edit') {
        setIsEditMode(true);
        // Load current user data
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            setFormData({
              fullName: profile.full_name || '',
              email: profile.email || user.email || '',
              password: '' // Don't pre-fill password
            });
          }
        }
      }
    };

    checkEditMode();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) onErrorClear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && currentUser) {
      // Update existing user profile
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.fullName,
            email: formData.email
          })
          .eq('id', currentUser.id);

        if (updateError) throw updateError;

        // If password is provided, update it
        if (formData.password) {
          const { error: passwordError } = await supabase.auth.updateUser({
            password: formData.password
          });
          if (passwordError) throw passwordError;
        }

        // If email changed, update it
        if (formData.email !== currentUser.email) {
          const { error: emailError } = await supabase.auth.updateUser({
            email: formData.email
          });
          if (emailError) throw emailError;
        }

        // Redirect back to main page
        window.location.href = '/';
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    } else {
      // Create new user
      onSubmit(formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isEditMode ? 'Edit Account' : 'Sign Up for FivePod'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {isEditMode ? 'New Password (leave blank to keep current)' : 'Password'}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!isEditMode}
                disabled={isLoading}
                placeholder={isEditMode ? "Enter new password" : "Enter your password"}
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : (isEditMode ? 'Update Account' : 'Sign Up')}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => window.location.href = '/'}
                disabled={isLoading}
              >
                Back to FivePod
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInForm;
