
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
          .select('id, full_name')
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
                full_name: profile?.full_name || 'Unknown User'
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
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <Music size={32} className="text-gray-400 mb-3" />
        <h3 className="font-bold text-lg mb-1">No submissions yet</h3>
        <p className="text-sm text-gray-600">Be the first to add a song for today!</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="font-bold text-sm">Today's Playlist</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Users size={12} />
            <span>{submissions.length}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {submissions.map((submission, index) => (
          <div
            key={submission.id}
            className="p-2 rounded-lg mb-1 hover:bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              {submission.album_art && (
                <img 
                  src={submission.album_art} 
                  alt="Album Art" 
                  className="w-8 h-8 rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{submission.track_name}</p>
                <p className="text-xs text-gray-500 truncate">{submission.artist_name}</p>
                <p className="text-xs text-gray-400 truncate">by {submission.profiles.full_name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaysPlaylistHoverPreview;
