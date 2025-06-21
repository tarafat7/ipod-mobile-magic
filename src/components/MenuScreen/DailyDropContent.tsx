
import React, { useState, useEffect } from 'react';
import { Music, Users } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import TodaysPlaylistPreview from '../TodaysPlaylistPreview';

interface DailyDropContentProps {
  selectedDailyDropItem: number;
  hoveredDailyDropItem: string | null;
  isSignedIn: boolean;
}

const DailyDropContent: React.FC<DailyDropContentProps> = ({
  selectedDailyDropItem,
  hoveredDailyDropItem,
  isSignedIn
}) => {
  const [todaysPrompt, setTodaysPrompt] = useState<string>("A global playlist built\ndaily around a prompt");
  const [userSubmissionCount, setUserSubmissionCount] = useState<number>(0);

  // Fetch today's prompt and user's participation status
  useEffect(() => {
    const fetchDailyDropData = async () => {
      try {
        // Get today's prompt
        const { data: promptData, error: promptError } = await supabase
          .rpc('get_todays_prompt');
        
        if (promptError) {
          console.error('Error fetching prompt:', promptError);
        } else if (promptData && promptData.length > 0) {
          setTodaysPrompt(promptData[0].prompt_text);
        }

        // Check user's submissions count (only if signed in)
        if (isSignedIn) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const today = new Date().toISOString().split('T')[0];
            const { data: userSubmissions, error: submissionError } = await supabase
              .from('daily_submissions')
              .select('*')
              .eq('user_id', user.id)
              .eq('date', today);

            if (submissionError) {
              console.error('Error checking submissions:', submissionError);
            } else {
              setUserSubmissionCount(userSubmissions?.length || 0);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching daily drop data:', error);
      }
    };

    fetchDailyDropData();
  }, [isSignedIn]);

  const dailyDropItems = ["Today's Prompt", 'Add a Song', "Today's Playlist"];
  const selectedDailyDropAction = dailyDropItems[selectedDailyDropItem];
  
  // Show specific content based on selection
  if (selectedDailyDropAction === "Today's Prompt" || hoveredDailyDropItem === "Today's Prompt") {
    return (
      <div className="w-1/2 bg-gray-50">
        <div className="h-full flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-orange-600 rounded-md"></div>
            </div>
          </div>
          <h3 className="font-bold text-lg mb-3">Today's Prompt</h3>
          <p className="text-sm text-gray-800 text-center leading-tight whitespace-pre-line font-medium">
            "{todaysPrompt}"
          </p>
        </div>
      </div>
    );
  }

  if (selectedDailyDropAction === "Add a Song" || hoveredDailyDropItem === "Add a Song") {
    return (
      <div className="w-1/2 bg-gray-50">
        <div className="h-full flex flex-col items-center justify-center p-4 text-center">
          <Music size={32} className="text-orange-600 mb-3" />
          <h3 className="font-bold text-lg mb-1">Add Songs</h3>
          <p className="text-sm text-gray-600 text-center leading-tight">
            {isSignedIn 
              ? userSubmissionCount > 0
                ? `You've added ${userSubmissionCount}/5 songs\nManage your submissions`
                : "Add up to 5 songs that\nfit today's prompt"
              : "Sign in to participate\nin the Daily Drop"
            }
          </p>
        </div>
      </div>
    );
  }

  if (selectedDailyDropAction === "Today's Playlist" || hoveredDailyDropItem === "Today's Playlist") {
    return (
      <div className="w-1/2 bg-gray-50">
        <TodaysPlaylistPreview />
      </div>
    );
  }

  // Default Daily Drop view
  return (
    <div className="w-1/2 bg-gray-50">
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-orange-600 rounded-md"></div>
          </div>
        </div>
        <h3 className="font-bold text-lg mb-1">The Daily Drop</h3>
        <p className="text-sm text-gray-600 text-center leading-tight">
          A global playlist built<br />
          daily around a prompt
        </p>
      </div>
    </div>
  );
};

export default DailyDropContent;
