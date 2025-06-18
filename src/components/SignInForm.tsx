
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    onErrorClear();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">iPod.js</h1>
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

export default SignInForm;
