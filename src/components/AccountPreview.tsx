
import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { User } from 'lucide-react';

interface UserProfile {
  full_name: string | null;
  email: string | null;
  username: string | null;
}

const AccountPreview: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email, username')
            .eq('id', user.id)
            .single();
          
          if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-300 rounded-lg mb-3"></div>
          <div className="h-4 w-24 bg-gray-300 rounded mb-1"></div>
          <div className="h-3 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <User size={32} className="text-gray-600 mb-3" />
        <h3 className="font-bold text-lg mb-1">Account</h3>
        <p className="text-sm text-gray-600">Unable to load profile</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
      {/* Profile Picture / Album Art */}
      <div className="w-16 h-16 mb-3 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
        <User size={24} className="text-gray-500" />
      </div>
      
      {/* Full Name / Song Title */}
      <h3 className="font-bold text-lg mb-1 text-center leading-tight">
        {profile.full_name || 'No name set'}
      </h3>
      
      {/* Username / Artist */}
      <p className="text-sm text-gray-600 text-center leading-tight">
        @{profile.username || 'No username'}
      </p>
    </div>
  );
};

export default AccountPreview;
