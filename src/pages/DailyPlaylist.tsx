
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { supabase } from '../integrations/supabase/client';
import { Music, Play, User } from 'lucide-react';

interface PlaylistSubmission {
  id: string;
  track_name: string;
  artist_name: string;
  album_art: string | null;
  spotify_url: string;
  profiles: {
    full_name: string;
  };
}

const DailyPlaylist = () => {
  const [submissions, setSubmissions] = useState<PlaylistSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todaysPrompt, setTodaysPrompt] = useState("A global playlist built daily around a prompt");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadPlaylistData();
  }, []);

  const loadPlaylistData = async () => {
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

      // Get today's submissions with proper join
      const today = new Date().toISOString().split('T')[0];
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('daily_submissions')
        .select(`
          id,
          track_name,
          artist_name,
          album_art,
          spotify_url,
          profiles!daily_submissions_user_id_fkey(full_name)
        `)
        .eq('date', today)
        .order('created_at', { ascending: true });

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
      } else {
        setSubmissions(submissionsData || []);
      }
    } catch (error) {
      console.error('Error loading playlist data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaySong = (spotifyUrl: string) => {
    window.open(spotifyUrl, '_blank');
  };

  const handleBack = () => {
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
            <h1 className="text-3xl font-bold text-gray-900">Today's Playlist</h1>
          </div>
          <p className="text-gray-600 text-center leading-tight whitespace-pre-line">
            "{todaysPrompt}"
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-8">
            <Music size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No songs have been submitted today yet.</p>
            <p className="text-sm text-gray-500">Be the first to add a song!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {submissions.map((submission, index) => (
              <div key={submission.id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 mr-4">
                  {submission.album_art ? (
                    <img 
                      src={submission.album_art} 
                      alt={`${submission.track_name} album art`}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-md flex items-center justify-center">
                      <Music size={24} className="text-gray-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{submission.track_name}</h3>
                  <p className="text-gray-600 truncate">{submission.artist_name}</p>
                  <div className="flex items-center mt-1">
                    <User size={14} className="text-gray-400 mr-1" />
                    <p className="text-sm text-gray-500">{submission.profiles.full_name}</p>
                  </div>
                </div>
                
                <Button
                  onClick={() => handlePlaySong(submission.spotify_url)}
                  className="flex-shrink-0 ml-4 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Play size={16} className="mr-1" />
                  Play
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <Button 
            onClick={handleBack}
            variant="outline"
            className="px-8"
          >
            Back to FivePod
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DailyPlaylist;
