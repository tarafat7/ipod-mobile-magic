import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const SignIn = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a device ID if one doesn't exist
    let deviceId = localStorage.getItem('ipod_device_id');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ipod_device_id', deviceId);
    }
    
    // Store user data
    const userData = {
      ...formData,
      deviceId,
      signedInAt: new Date().toISOString()
    };
    
    localStorage.setItem('ipod_user', JSON.stringify(userData));
    setIsSubmitted(true);
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
            Return to iPod
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">iPod.js</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>
        
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
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 mt-6"
          >
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
