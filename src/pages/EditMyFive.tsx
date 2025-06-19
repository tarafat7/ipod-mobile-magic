
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { supabase } from '../integrations/supabase/client';
import SpotifySearchInput from '../components/SpotifySearchInput';

const EditMyFive = () => {
  const [songs, setSongs] = useState({
    song_1: '',
    song_2: '',
    song_3: '',
    song_4: '',
    song_5: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUserSongs();
  }, []);

  const loadUserSongs = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/signin';
        return;
      }

      const { data, error } = await supabase
        .from('user_five_songs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading songs:', error);
        return;
      }

      if (data) {
        setSongs({
          song_1: data.song_1 || '',
          song_2: data.song_2 || '',
          song_3: data.song_3 || '',
          song_4: data.song_4 || '',
          song_5: data.song_5 || ''
        });
      }
    } catch (error) {
      console.error('Error loading user songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (songKey: string, value: string) => {
    setSongs(prev => ({
      ...prev,
      [songKey]: value
    }));
    setMessage(''); // Clear any previous messages
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/signin';
        return;
      }

      // Check if user already has songs saved
      const { data: existingData } = await supabase
        .from('user_five_songs')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('user_five_songs')
          .update({
            ...songs,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_five_songs')
          .insert({
            user_id: user.id,
            ...songs
          });

        if (error) {
          throw error;
        }
      }

      setMessage('Your five songs have been saved successfully!');
    } catch (error) {
      console.error('Error saving songs:', error);
      setMessage('Error saving songs. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
              <div className="w-5 h-5 bg-purple-500 rounded-md flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Edit</h1>
          </div>
          <p className="text-gray-600">
            Search and select songs from Spotify
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            message.includes('Error') 
              ? 'bg-red-100 border border-red-300 text-red-700'
              : 'bg-green-100 border border-green-300 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          <SpotifySearchInput
            label="Song 1"
            value={songs.song_1}
            onChange={(value) => handleInputChange('song_1', value)}
            placeholder="Search for your first song..."
          />
          
          <SpotifySearchInput
            label="Song 2"
            value={songs.song_2}
            onChange={(value) => handleInputChange('song_2', value)}
            placeholder="Search for your second song..."
          />
          
          <SpotifySearchInput
            label="Song 3"
            value={songs.song_3}
            onChange={(value) => handleInputChange('song_3', value)}
            placeholder="Search for your third song..."
          />
          
          <SpotifySearchInput
            label="Song 4"
            value={songs.song_4}
            onChange={(value) => handleInputChange('song_4', value)}
            placeholder="Search for your fourth song..."
          />
          
          <SpotifySearchInput
            label="Song 5"
            value={songs.song_5}
            onChange={(value) => handleInputChange('song_5', value)}
            placeholder="Search for your fifth song..."
          />
        </div>

        <div className="flex space-x-3 mt-8">
          <Button 
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save My Five'}
          </Button>
          
          <Button 
            type="button" 
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
            disabled={isSaving}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditMyFive;
