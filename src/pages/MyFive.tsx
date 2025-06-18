
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Music } from 'lucide-react';
import IPod from '../components/iPod';

interface UserProfile {
  full_name: string | null;
}

const MyFive: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userSongs, setUserSongs] = useState<string[]>([]);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
      loadUserSongs();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadUserSongs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_five_songs')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error loading songs:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        const songUrls = [
          data.song_1,
          data.song_2,
          data.song_3,
          data.song_4,
          data.song_5
        ].filter(Boolean);

        setUserSongs(songUrls);
      }
    } catch (error) {
      console.error('Error loading user songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = profile?.full_name || 'Someone';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 rounded-3xl p-6 shadow-2xl border border-gray-400 w-96 h-[680px] flex flex-col">
          <div className="bg-gray-900 rounded-xl p-2 mb-6 shadow-inner flex-1">
            <div className="bg-gray-100 rounded-lg h-full border border-gray-300 overflow-hidden flex flex-col items-center justify-center">
              <Music size={32} className="text-blue-600 mb-3 animate-pulse" />
              <p className="text-sm text-gray-600">Loading {displayName}'s Five...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Pass the user's profile and songs as props to the iPod */}
      <IPod 
        sharedUserProfile={profile}
        sharedUserSongs={userSongs}
        isSharedView={true}
      />
    </div>
  );
};

export default MyFive;
