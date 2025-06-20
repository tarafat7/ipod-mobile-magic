
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  username: string;
}

interface AuthFormProps {
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
  error: string | null;
  onErrorClear: () => void;
  isEditMode?: boolean;
  isSignInMode?: boolean;
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  onSubmit,
  isLoading,
  error,
  onErrorClear,
  isEditMode = false,
  isSignInMode = false,
  formData,
  onFormDataChange
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFormDataChange({
      ...formData,
      [name]: value
    });
    onErrorClear();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
          
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="mt-1"
              disabled={isLoading}
            />
          </div>
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
      
      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700 mt-6"
        disabled={isLoading}
      >
        {getButtonText()}
      </Button>
    </form>
  );
};

export default AuthForm;
