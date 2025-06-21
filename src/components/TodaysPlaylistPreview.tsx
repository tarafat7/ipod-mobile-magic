
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
    username: string;
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
        .eq('date', new Date().toISOString().split('T')[0]);

      if (error) {
        console.error('Error fetching submissions:', error);
        setSubmissions([]);
      } else if (data && data.length > 0) {
        // Fetch profile data separately
        const userIds = data.map(submission => submission.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

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
                username: profile?.username || 'unknown'
              }
            };
          });
          setSubmissions(combined);
        }
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <Music size={32} className="text-blue-600 mb-3 animate-pulse" />
        <p className="text-sm text-gray-600">Loading playlist...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
      <Music size={32} className="text-blue-600 mb-3" />
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
