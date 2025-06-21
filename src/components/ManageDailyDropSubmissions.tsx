
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { supabase } from '../integrations/supabase/client';
import { Music, Trash2, Edit2, Plus } from 'lucide-react';
import { extractSpotifyTrackId } from '../utils/spotifyUtils';
import { searchSpotifyTracks } from '../utils/spotifySearch';
import SpotifySearchInput from './SpotifySearchInput';

interface DailySubmission {
  id: string;
  position: number;
  track_name: string;
  artist_name: string;
  album_art: string | null;
  spotify_url: string;
  spotify_track_id: string;
}

const ManageDailyDropSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<DailySubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPosition, setEditingPosition] = useState<number | null>(null);
  const [editingSongUrl, setEditingSongUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [todaysPrompt, setTodaysPrompt] = useState("A global playlist built daily around a prompt");

  useEffect(() => {
    loadUserSubmissions();
    loadTodaysPrompt();
  }, []);

  const loadTodaysPrompt = async () => {
    try {
      const { data: promptData, error } = await supabase.rpc('get_todays_prompt');
      if (!error && promptData && promptData.length > 0) {
        setTodaysPrompt(promptData[0].prompt_text);
      }
    } catch (error) {
      console.error('Error loading prompt:', error);
    }
  };

  const loadUserSubmissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_submissions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('position');

      if (error) {
        console.error('Error loading submissions:', error);
      } else {
        setSubmissions(data || []);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSong = (position: number) => {
    setEditingPosition(position);
    setEditingSongUrl('');
    setMessage('');
  };

  const handleEditSong = (submission: DailySubmission) => {
    setEditingPosition(submission.position);
    setEditingSongUrl(submission.spotify_url);
    setMessage('');
  };

  const handleSaveSong = async () => {
    if (!editingSongUrl.trim() || !editingPosition) {
      setMessage('Please select a song first.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const trackId = extractSpotifyTrackId(editingSongUrl);
      if (!trackId) {
        setMessage('Invalid Spotify URL. Please select a valid song.');
        setIsSubmitting(false);
        return;
      }

      const tracks = await searchSpotifyTracks(`track:${trackId}`);
      const trackInfo = tracks.find(track => track.id === trackId);
      
      if (!trackInfo) {
        setMessage('Could not fetch track information. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const existingSubmission = submissions.find(s => s.position === editingPosition);
      
      if (existingSubmission) {
        // Update existing submission
        const { error } = await supabase
          .from('daily_submissions')
          .update({
            spotify_track_id: trackId,
            track_name: trackInfo.name,
            artist_name: trackInfo.artist,
            album_art: trackInfo.albumArt,
            spotify_url: editingSongUrl
          })
          .eq('id', existingSubmission.id);

        if (error) throw error;
      } else {
        // Create new submission
        const { error } = await supabase
          .from('daily_submissions')
          .insert({
            user_id: user.id,
            position: editingPosition,
            spotify_track_id: trackId,
            track_name: trackInfo.name,
            artist_name: trackInfo.artist,
            album_art: trackInfo.albumArt,
            spotify_url: editingSongUrl
          });

        if (error) throw error;
      }

      await loadUserSubmissions();
      setEditingPosition(null);
      setEditingSongUrl('');
      setMessage('Song saved successfully!');
    } catch (error) {
      console.error('Error saving song:', error);
      setMessage('Error saving song. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSong = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from('daily_submissions')
        .delete()
        .eq('id', submissionId);

      if (error) throw error;
      
      await loadUserSubmissions();
      setMessage('Song removed successfully!');
    } catch (error) {
      console.error('Error deleting song:', error);
      setMessage('Error removing song. Please try again.');
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
      <div className="bg-white rounded-xl p-8 max-w-4xl w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
              <div className="w-5 h-5 bg-orange-500 rounded-md flex items-center justify-center">
                <div className="w-3 h-3 bg-orange-600 rounded-sm"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Your Daily Drop</h1>
          </div>
          <p className="text-gray-600 text-center leading-tight whitespace-pre-line mb-4">
            "{todaysPrompt}"
          </p>
          <p className="text-sm text-gray-500">
            Add up to 5 songs that fit today's prompt. You can edit or remove them anytime.
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

        <div className="space-y-4 mb-6">
          {[1, 2, 3, 4, 5].map(position => {
            const submission = submissions.find(s => s.position === position);
            const isEditing = editingPosition === position;

            return (
              <div key={position} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Song {position}</h3>
                  {submission && !isEditing && (
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSong(submission)}
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSong(submission.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <SpotifySearchInput
                      label=""
                      value={editingSongUrl}
                      onChange={setEditingSongUrl}
                      placeholder="Search for a song..."
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleSaveSong}
                        disabled={isSubmitting || !editingSongUrl.trim()}
                        size="sm"
                      >
                        {isSubmitting ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingPosition(null)}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : submission ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                      {submission.album_art ? (
                        <img 
                          src={submission.album_art} 
                          alt={`${submission.track_name} album art`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{submission.track_name}</p>
                      <p className="text-sm text-gray-600">{submission.artist_name}</p>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddSong(position)}
                    className="w-full"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Song
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex space-x-3">
          <Button 
            type="button" 
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            Back to Daily Drop
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManageDailyDropSubmissions;
