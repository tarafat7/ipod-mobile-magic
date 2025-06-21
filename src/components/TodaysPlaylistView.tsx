
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

interface TodaysPlaylistViewProps {
  selectedItemIndex: number;
}

const TodaysPlaylistView: React.FC<TodaysPlaylistViewProps> = ({ selectedItemIndex }) => {
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
        // Get profiles for submissions
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
      <div className="h-full flex flex-col p-4 text-center overflow-y-auto">
        <Music size={32} className="text-blue-600 mb-3 mx-auto" />
        <h3 className="font-bold text-lg mb-1">Today's Playlist</h3>
        <p className="text-sm text-gray-600">Be the first to add a song for today's prompt!</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      {/* Header - matching My Five style */}
      <div className="p-2">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="font-bold">Today's Playlist</span>
          <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
        </div>
      </div>

      {/* Song List */}
      <div className="bg-white px-2" data-playlist-items>
        {submissions.map((submission, index) => (
          <div 
            key={submission.id}
            className={`flex items-center p-1.5 border-b border-gray-200 transition-colors ${
              selectedItemIndex === index 
                ? 'bg-blue-500 text-white' 
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0 overflow-hidden mr-2">
              {submission.album_art ? (
                <img 
                  src={submission.album_art} 
                  alt={`${submission.track_name} album art`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music size={14} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-sm truncate ${
                selectedItemIndex === index ? 'text-white' : 'text-black'
              }`}>
                {submission.track_name}
              </h3>
              <p className={`text-xs truncate ${
                selectedItemIndex === index ? 'text-blue-100' : 'text-gray-600'
              }`}>
                {submission.artist_name}
              </p>
              <p className={`text-xs truncate ${
                selectedItemIndex === index ? 'text-blue-100' : 'text-gray-500'
              }`}>
                @{submission.profiles.username}
              </p>
            </div>
            {selectedItemIndex === index && (
              <div className="text-white text-sm">▶</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaysPlaylistView;
