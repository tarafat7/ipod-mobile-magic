
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { supabase } from '../integrations/supabase/client';
import SpotifySearchInput from '../components/SpotifySearchInput';
import { extractSpotifyTrackId } from '../utils/spotifyUtils';
import { searchSpotifyTracks } from '../utils/spotifySearch';

const AddDailyDrop = () => {
  const [selectedSongUrl, setSelectedSongUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [todaysPrompt, setTodaysPrompt] = useState("A global playlist built daily around a prompt");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    checkAuthAndLoadPrompt();
  }, []);

  const checkAuthAndLoadPrompt = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/signin';
        return;
      }
      setCurrentUser(user);

      // Get today's prompt
      const { data: promptData, error: promptError } = await supabase
        .rpc('get_todays_prompt');
      
      if (promptError) {
        console.error('Error fetching prompt:', promptError);
      } else if (promptData && promptData.length > 0) {
        setTodaysPrompt(promptData[0].prompt_text);
      }

      // Check if user has already submitted today
      const today = new Date().toISOString().split('T')[0];
      const { data: submission, error: submissionError } = await supabase
        .from('daily_submissions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (submissionError && submissionError.code !== 'PGRST116') {
        console.error('Error checking existing submission:', submissionError);
      } else if (submission) {
        setExistingSubmission(submission);
        setSelectedSongUrl(submission.spotify_url);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongChange = (url: string) => {
    setSelectedSongUrl(url);
    setMessage('');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (existingSubmission) {
      setSelectedSongUrl(existingSubmission.spotify_url);
    }
    setMessage('');
  };

  const handleSubmit = async () => {
    if (!selectedSongUrl.trim()) {
      setMessage('Please select a song first.');
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/signin';
        return;
      }

      // Extract track info from Spotify URL
      const trackId = extractSpotifyTrackId(selectedSongUrl);
      if (!trackId) {
        setMessage('Invalid Spotify URL. Please select a valid song.');
        setIsSaving(false);
        return;
      }

      // Get track details from Spotify
      const tracks = await searchSpotifyTracks(`track:${trackId}`);
      const trackInfo = tracks.find(track => track.id === trackId);
      
      if (!trackInfo) {
        setMessage('Could not fetch track information. Please try again.');
        setIsSaving(false);
        return;
      }

      if (existingSubmission) {
        // Update existing submission
        const { error } = await supabase
          .from('daily_submissions')
          .update({
            spotify_track_id: trackId,
            track_name: trackInfo.name,
            artist_name: trackInfo.artist,
            album_art: trackInfo.albumArt,
            spotify_url: selectedSongUrl
          })
          .eq('id', existingSubmission.id);

        if (error) {
          throw error;
        } else {
          setMessage('Your song has been updated!');
          setExistingSubmission({
            ...existingSubmission,
            spotify_track_id: trackId,
            track_name: trackInfo.name,
            artist_name: trackInfo.artist,
            album_art: trackInfo.albumArt,
            spotify_url: selectedSongUrl
          });
          setIsEditing(false);
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      } else {
        // Submit new submission
        const { error } = await supabase
          .from('daily_submissions')
          .insert({
            user_id: user.id,
            spotify_track_id: trackId,
            track_name: trackInfo.name,
            artist_name: trackInfo.artist,
            album_art: trackInfo.albumArt,
            spotify_url: selectedSongUrl
          });

        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            setMessage('You have already submitted a song for today!');
          } else {
            throw error;
          }
        } else {
          setMessage('Your song has been added to today\'s playlist!');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error submitting song:', error);
      setMessage('Error submitting song. Please try again.');
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
              <div className="w-5 h-5 bg-orange-500 rounded-md flex items-center justify-center">
                <div className="w-3 h-3 bg-orange-600 rounded-sm"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {existingSubmission ? (isEditing ? 'Edit Your Song' : 'Your Song for Today') : 'Add'}
            </h1>
          </div>
          <p className="text-gray-600 text-center leading-tight whitespace-pre-line">
            "{todaysPrompt}"
          </p>
        </div>

        {/* Show existing submission when not editing */}
        {existingSubmission && !isEditing && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-3">
              {existingSubmission.album_art && (
                <img 
                  src={existingSubmission.album_art} 
                  alt="Album art"
                  className="w-12 h-12 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{existingSubmission.track_name}</h3>
                <p className="text-gray-600">{existingSubmission.artist_name}</p>
              </div>
              <Button 
                onClick={handleEdit}
                variant="outline"
                size="sm"
              >
                Edit
              </Button>
            </div>
          </div>
        )}

        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            message.includes('Error') || message.includes('already submitted')
              ? 'bg-red-100 border border-red-300 text-red-700'
              : 'bg-green-100 border border-green-300 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {/* Show search input when adding new song or editing */}
        {(!existingSubmission || isEditing) && (
          <div className="space-y-6">
            <SpotifySearchInput
              label="Song for Today's Prompt"
              value={selectedSongUrl}
              onChange={handleSongChange}
              placeholder="Search for a song that fits today's prompt..."
            />
          </div>
        )}

        <div className="flex space-x-3 mt-8">
          {(!existingSubmission || isEditing) && (
            <Button 
              onClick={handleSubmit}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={isSaving || !selectedSongUrl.trim()}
            >
              {isSaving ? (existingSubmission ? 'Updating...' : 'Adding...') : (existingSubmission ? 'Update Song' : 'Add to Playlist')}
            </Button>
          )}
          
          {isEditing && (
            <Button 
              type="button" 
              variant="outline"
              onClick={handleCancelEdit}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
          )}
          
          {!isEditing && (
            <Button 
              type="button" 
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
              disabled={isSaving}
            >
              Back
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddDailyDrop;
