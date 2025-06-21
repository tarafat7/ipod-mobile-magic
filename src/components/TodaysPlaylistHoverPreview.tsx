
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

const TodaysPlaylistHoverPreview: React.FC = () => {
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
          user_id,
          created_at
        `)
        .eq('date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        setSubmissions([]);
      } else if (data && data.length > 0) {
        const userIds = data.map(submission => submission.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          setSubmissions([]);
        } else {
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

  if (submissions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <Music size={32} className="text-blue-600 mb-3" />
        <h3 className="font-bold text-lg mb-1">Today's Playlist</h3>
        <p className="text-sm text-gray-600 leading-tight">
          Submit a song to see<br />
          today's playlist
        </p>
      </div>
    );
  }

  return (
    <div className="h-full p-2 overflow-y-auto">
      <div className="text-center mb-2">
        <h3 className="font-bold text-sm mb-1">Today's Playlist</h3>
      </div>
      <div className="space-y-2">
        {submissions.map((submission, index) => (
          <div key={submission.id} className="flex items-center space-x-2 p-1 bg-white rounded border">
            <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
              {submission.album_art ? (
                <img 
                  src={submission.album_art} 
                  alt={`${submission.track_name} album art`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music size={12} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {submission.track_name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {submission.artist_name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                @{submission.profiles.username}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaysPlaylistHoverPreview;
