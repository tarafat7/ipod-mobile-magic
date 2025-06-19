
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { supabase } from '../integrations/supabase/client';
import { extractSpotifyTrackId, fetchSpotifyTrackInfo } from '../utils/spotifyUtils';
import { Music, ExternalLink } from 'lucide-react';

interface SpotifyTrackInfo {
  name: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
  addedDate: string;
}

const EditMyFive = () => {
  const [songs, setSongs] = useState({
    song_1: '',
    song_2: '',
    song_3: '',
    song_4: '',
    song_5: ''
  });
  const [songPreviews, setSongPreviews] = useState<{ [key: string]: SpotifyTrackInfo | null }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUserSongs();
  }, []);

  // Load song previews when URLs change
  useEffect(() => {
    loadSongPreviews();
  }, [songs]);

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

  const loadSongPreviews = async () => {
    setIsLoadingPreviews(true);
    const previews: { [key: string]: SpotifyTrackInfo | null } = {};
    
    for (const [key, url] of Object.entries(songs)) {
      if (url) {
        const trackId = extractSpotifyTrackId(url);
        if (trackId) {
          try {
            const trackInfo = await fetchSpotifyTrackInfo(trackId, new Date().toISOString());
            previews[key] = trackInfo;
          } catch (error) {
            console.error(`Error loading preview for ${key}:`, error);
            previews[key] = null;
          }
        } else {
          previews[key] = null;
        }
      } else {
        previews[key] = null;
      }
    }
    
    setSongPreviews(previews);
    setIsLoadingPreviews(false);
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

  const renderSongInput = (num: number) => {
    const songKey = `song_${num}`;
    const songUrl = songs[songKey as keyof typeof songs];
    const preview = songPreviews[songKey];
    
    return (
      <div key={num} className="space-y-2">
        <Label htmlFor={songKey} className="text-sm font-medium text-gray-700">
          Song {num}
        </Label>
        
        {/* Show preview if available */}
        {preview && (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
            <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
              {preview.albumArt ? (
                <img 
                  src={preview.albumArt} 
                  alt={`${preview.name} album art`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music size={16} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {preview.name}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {preview.artist}
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.open(preview.spotifyUrl, '_blank')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ExternalLink size={16} />
            </button>
          </div>
        )}
        
        {/* URL Input */}
        <div className="relative">
          <input
            id={songKey}
            type="url"
            placeholder="https://open.spotify.com/track/..."
            value={songUrl}
            onChange={(e) => handleInputChange(songKey, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSaving}
          />
          {isLoadingPreviews && songUrl && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
    );
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit My Five</h1>
          <p className="text-gray-600">
            Paste your 5 favorite Spotify links below
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
          {[1, 2, 3, 4, 5].map(renderSongInput)}
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
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditMyFive;
