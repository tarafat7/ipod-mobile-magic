
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface AuthFormProps {
  onSubmit: (data: { fullName: string; email: string; password: string }) => void;
  isLoading: boolean;
  error: string | null;
  onErrorClear: () => void;
  isEditMode?: boolean;
  initialData?: {
    fullName: string;
    email: string;
  };
}

const AuthForm: React.FC<AuthFormProps> = ({ 
  onSubmit, 
  isLoading, 
  error, 
  onErrorClear,
  isEditMode = false,
  initialData = { fullName: '', email: '' }
}) => {
  const [formData, setFormData] = useState({
    fullName: initialData.fullName,
    email: initialData.email,
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) onErrorClear();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
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
  );
};

export default AuthForm;
