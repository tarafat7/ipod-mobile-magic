
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

interface TodaysPlaylistViewProps {
  selectedItemIndex: number;
}

const TodaysPlaylistView: React.FC<TodaysPlaylistViewProps> = ({ selectedItemIndex }) => {
  const [submissions, setSubmissions] = useState<PlaylistSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    fetchTodaysSubmissions();
  }, []);

  const fetchTodaysSubmissions = async () => {
    try {
      const debugMessages: string[] = [];
      
      // Get current user info
      const { data: { user } } = await supabase.auth.getUser();
      debugMessages.push(`User ID: ${user?.id || 'Not logged in'}`);
      
      // First, let's see ALL submissions to debug
      const { data: allData, error: allError } = await supabase
        .from('daily_submissions')
        .select('*');
      
      debugMessages.push(`Total submissions in DB: ${allData?.length || 0}`);
      if (allError) debugMessages.push(`Error fetching all: ${allError.message}`);
      
      // Try with today's date in multiple formats
      const today = new Date().toISOString().split('T')[0];
      const todayLocal = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
      debugMessages.push(`Today (ISO): ${today}`);
      debugMessages.push(`Today (Local): ${todayLocal}`);
      
      // Try recent submissions (last 3 days)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];
      
      const { data: recentData, error: recentError } = await supabase
        .from('daily_submissions')
        .select(`
          id,
          track_name,
          artist_name,
          album_art,
          spotify_url,
          user_id,
          date,
          created_at
        `)
        .gte('date', threeDaysAgoStr)
        .order('created_at', { ascending: false });
      
      debugMessages.push(`Recent submissions (last 3 days): ${recentData?.length || 0}`);
      if (recentError) debugMessages.push(`Recent error: ${recentError.message}`);
      
      if (recentData && recentData.length > 0) {
        debugMessages.push('Recent submission dates:');
        recentData.forEach((sub, idx) => {
          debugMessages.push(`  ${idx + 1}. Date: ${sub.date}, User: ${sub.user_id}, Track: ${sub.track_name}`);
        });
        
        // Get profiles for recent submissions
        const userIds = recentData.map(submission => submission.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        debugMessages.push(`Profiles found: ${profilesData?.length || 0}`);
        if (profilesError) debugMessages.push(`Profiles error: ${profilesError.message}`);

        const combined = recentData.map(submission => {
          const profile = profilesData?.find(p => p.id === submission.user_id);
          return {
            ...submission,
            profiles: {
              full_name: profile?.full_name || 'Unknown User'
            }
          };
        });
        
        debugMessages.push(`Final combined submissions: ${combined.length}`);
        setSubmissions(combined);
      } else {
        debugMessages.push('No recent submissions found');
        setSubmissions([]);
      }
      
      setDebugInfo(debugMessages.join('\n'));
    } catch (error) {
      setDebugInfo(`Error: ${error}`);
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="h-full flex flex-col p-4 text-center overflow-y-auto">
        <Music size={32} className="text-gray-400 mb-3 mx-auto" />
        <h3 className="font-bold text-lg mb-1">No submissions found</h3>
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-left">
          <h4 className="font-bold mb-2">Debug Info:</h4>
          <pre className="whitespace-pre-wrap text-xs">{debugInfo}</pre>
        </div>
      </div>
    );
  }

  const selectedSubmission = submissions[selectedItemIndex] || submissions[0];

  return (
    <div className="h-full bg-white">
      {/* Header */}
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

      {/* Debug Info Toggle */}
      <div className="p-2 border-b border-gray-200 bg-yellow-50">
        <details className="text-xs">
          <summary className="cursor-pointer font-medium">Debug Info (tap to expand)</summary>
          <pre className="mt-2 whitespace-pre-wrap text-xs bg-white p-2 rounded border">{debugInfo}</pre>
        </details>
      </div>

      {/* Current Selection Display */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          {selectedSubmission.album_art && (
            <img 
              src={selectedSubmission.album_art} 
              alt="Album Art" 
              className="w-12 h-12 rounded-lg"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{selectedSubmission.track_name}</p>
            <p className="text-xs text-gray-600 truncate">{selectedSubmission.artist_name}</p>
            <p className="text-xs text-gray-500 truncate">by {selectedSubmission.profiles.full_name}</p>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="flex-1 overflow-hidden">
        <div className="p-2" data-playlist-items>
          {submissions.map((submission, index) => (
            <div
              key={submission.id}
              className={`p-2 rounded-lg mb-1 transition-colors ${
                index === selectedItemIndex 
                  ? 'bg-blue-100 border border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
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
                {index === selectedItemIndex && (
                  <div className="text-blue-500">
                    <Music size={12} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodaysPlaylistView;
