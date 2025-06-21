import React, { useState, useEffect } from 'react';
import { Music, Users } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

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
  const [hasSubmittedToday, setHasSubmittedToday] = useState<boolean>(false);
  const [todaysSubmissions, setTodaysSubmissions] = useState<any[]>([]);

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

        // Check if user has submitted today (only if signed in)
        if (isSignedIn) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const today = new Date().toISOString().split('T')[0];
            const { data: userSubmission, error: submissionError } = await supabase
              .from('daily_submissions')
              .select('*')
              .eq('user_id', user.id)
              .eq('date', today)
              .single();

            if (submissionError && submissionError.code !== 'PGRST116') {
              console.error('Error checking submission:', submissionError);
            } else {
              setHasSubmittedToday(!!userSubmission);
            }

            // If user has submitted, fetch today's submissions
            if (userSubmission) {
              const { data: submissions, error: submissionsError } = await supabase
                .from('daily_submissions')
                .select(`
                  *,
                  profiles!inner(full_name)
                `)
                .eq('date', today);

              if (submissionsError) {
                console.error('Error fetching submissions:', submissionsError);
              } else {
                setTodaysSubmissions(submissions || []);
              }
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
          <h3 className="font-bold text-lg mb-1">Add a Song</h3>
          <p className="text-sm text-gray-600 text-center leading-tight">
            {isSignedIn 
              ? hasSubmittedToday 
                ? "You've already submitted\na song for today!"
                : "Submit your song that\nfits today's prompt"
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
        <div className="h-full flex flex-col items-center justify-center p-4 text-center">
          <Users size={32} className="text-orange-600 mb-3" />
          <h3 className="font-bold text-lg mb-1">Today's Playlist</h3>
          <p className="text-sm text-gray-600 text-center leading-tight">
            {!isSignedIn 
              ? "Sign in and submit a song\nto view today's playlist"
              : !hasSubmittedToday 
                ? "Submit your song first to\nview today's playlist"
                : `${todaysSubmissions.length} songs submitted\nClick to view the playlist`
            }
          </p>
        </div>
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
