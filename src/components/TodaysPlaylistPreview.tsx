
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
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    fetchTodaysSubmissions();
  }, []);

  const fetchTodaysSubmissions = async () => {
    try {
      const debugMessages: string[] = [];
      
      // Get current user info for debugging
      const { data: { user } } = await supabase.auth.getUser();
      debugMessages.push(`Preview - User: ${user?.id || 'Not logged in'}`);
      
      // Get recent submissions (last 3 days) for better chance of finding data
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];
      debugMessages.push(`Looking for submissions since: ${threeDaysAgoStr}`);
      
      const { data, error } = await supabase
        .from('daily_submissions')
        .select(`
          id,
          track_name,
          artist_name,
          album_art,
          spotify_url,
          user_id,
          date
        `)
        .gte('date', threeDaysAgoStr);

      debugMessages.push(`Preview query result: ${data?.length || 0} submissions found`);
      if (error) debugMessages.push(`Preview error: ${error.message}`);

      if (error) {
        setSubmissions([]);
        setDebugInfo(debugMessages.join('\n'));
      } else if (data && data.length > 0) {
        // Fetch profile data separately
        const userIds = data.map(submission => submission.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        debugMessages.push(`Preview profiles: ${profilesData?.length || 0} found`);
        if (profilesError) debugMessages.push(`Preview profiles error: ${profilesError.message}`);

        if (profilesError) {
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
          debugMessages.push(`Preview final: ${combined.length} submissions with profiles`);
          setSubmissions(combined);
        }
      } else {
        debugMessages.push('Preview: No submissions found');
        setSubmissions([]);
      }
      
      setDebugInfo(debugMessages.join('\n'));
    } catch (error) {
      setDebugInfo(`Preview error: ${error}`);
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
        <div className="flex items-center space-x-1 text-xs text-gray-500 mb-2">
          <Users size={12} />
          <span>{submissions.length} contributors</span>
        </div>
      )}
      
      {/* Debug info for mobile */}
      <details className="text-xs mt-2 w-full">
        <summary className="cursor-pointer text-gray-500">Debug (tap to see)</summary>
        <div className="mt-1 p-2 bg-gray-100 rounded text-left">
          <pre className="whitespace-pre-wrap text-xs">{debugInfo}</pre>
        </div>
      </details>
    </div>
  );
};

export default TodaysPlaylistPreview;
