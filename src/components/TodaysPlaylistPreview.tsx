
import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Music, Users } from 'lucide-react';

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

const TodaysPlaylistPreview: React.FC = () => {
  const [submissions, setSubmissions] = useState<PlaylistSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTodaysSubmissions();
  }, []);

  const fetchTodaysSubmissions = async () => {
    try {
      console.log('Fetching today\'s submissions...');
      const today = new Date().toISOString().split('T')[0];
      console.log('Today\'s date:', today);
      
      const { data, error } = await supabase
        .from('daily_submissions')
        .select(`
          id,
          track_name,
          artist_name,
          album_art,
          spotify_url,
          user_id
        `)
        .eq('date', today);

      console.log('Submissions query result:', { data, error });

      if (error) {
        console.error('Error fetching submissions:', error);
        setSubmissions([]);
      } else if (data) {
        console.log('Found submissions:', data.length);
        // Fetch profile data separately
        const userIds = data.map(submission => submission.user_id);
        console.log('Fetching profiles for user IDs:', userIds);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        console.log('Profiles query result:', { profilesData, profilesError });

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          setSubmissions([]);
        } else {
          // Combine the data
          const combined = data.map(submission => {
            const profile = profilesData?.find(p => p.id === submission.user_id);
            return {
              ...submission,
              profiles: {
                full_name: profile?.full_name || 'Unknown User'
              }
            };
          });
          console.log('Combined submissions with profiles:', combined);
          setSubmissions(combined);
        }
      } else {
        console.log('No data returned from submissions query');
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-3">
        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
          <div className="w-6 h-6 bg-orange-600 rounded-md"></div>
        </div>
      </div>
      <h3 className="font-bold text-lg mb-1">Today's Playlist</h3>
      <p className="text-sm text-gray-600 text-center leading-tight mb-2">
        {submissions.length > 0 
          ? `${submissions.length} song${submissions.length !== 1 ? 's' : ''} submitted\nClick to view the playlist`
          : "No songs submitted yet\nBe the first to add one!"
        }
      </p>
      {submissions.length > 0 && (
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Users size={12} />
          <span>{submissions.length} contributors</span>
        </div>
      )}
    </div>
  );
};

export default TodaysPlaylistPreview;
