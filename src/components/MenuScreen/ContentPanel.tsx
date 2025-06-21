import React, { useState, useEffect } from 'react';
import FriendsScreen from '../FriendsScreen';
import SettingsScreen from '../SettingsScreen';
import MyFivePreview from '../MyFivePreview';
import MyFiveFullView from '../MyFiveFullView';
import AccountPreview from '../AccountPreview';
import FriendSongsPreview from '../FriendSongsPreview';
import FriendsListPreview from '../FriendsListPreview';
import { User, Settings, Users, Music, Share } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

interface SpotifyTrackInfo {
  name: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
  addedDate: string;
}

interface ContentPanelProps {
  menuItems: string[];
  selectedMenuItem: number;
  isInSettingsView: boolean;
  isSignedIn: boolean;
  isInMyFiveView?: boolean;
  selectedMyFiveSong?: number;
  hoveredSettingsItem?: string | null;
  isSharedView?: boolean;
  sharedUserProfile?: {full_name: string} | null;
  sharedUserSongs?: SpotifyTrackInfo[];
  isInFriendsView?: boolean;
  selectedFriendsItem?: number;
  hoveredFriendsItem?: string | null;
  isInFriendsListView?: boolean;
  selectedFriendsListItem?: number;
  hoveredFriendsListItem?: any;
  friendsList?: any[];
  isInDailyDropView?: boolean;
  selectedDailyDropItem?: number;
  hoveredDailyDropItem?: string | null;
}

const ContentPanel: React.FC<ContentPanelProps> = ({
  menuItems,
  selectedMenuItem,
  isInSettingsView,
  isSignedIn,
  isInMyFiveView = false,
  selectedMyFiveSong = 0,
  hoveredSettingsItem = null,
  isSharedView = false,
  sharedUserProfile = null,
  sharedUserSongs = [],
  isInFriendsView = false,
  selectedFriendsItem = 0,
  hoveredFriendsItem = null,
  isInFriendsListView = false,
  selectedFriendsListItem = 0,
  hoveredFriendsListItem = null,
  friendsList = [],
  isInDailyDropView = false,
  selectedDailyDropItem = 0,
  hoveredDailyDropItem = null
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
  }, [isSignedIn, isInDailyDropView]);

  if (isInDailyDropView) {
    const dailyDropItems = ["Today's Prompt", 'Add a Song', 'View Today\'s Playlist'];
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

    if (selectedDailyDropAction === "View Today's Playlist" || hoveredDailyDropItem === "View Today's Playlist") {
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
  }

  if (isInMyFiveView) {
    return (
      <div className="w-full bg-gray-50">
        <MyFiveFullView 
          selectedSongIndex={selectedMyFiveSong}
          isSharedView={isSharedView}
          sharedUserProfile={sharedUserProfile}
          sharedUserSongs={sharedUserSongs}
        />
      </div>
    );
  }

  if (isInFriendsListView) {
    return (
      <div className="w-1/2 bg-gray-50">
        <FriendsListPreview 
          selectedFriend={hoveredFriendsListItem}
        />
      </div>
    );
  }

  if (isInFriendsView) {
    return (
      <div className="w-1/2 bg-gray-50">
        <div className="h-full flex flex-col items-center justify-center p-4 text-center">
          <Users size={32} className="text-gray-600 mb-3" />
          <h3 className="font-bold text-lg mb-1">Friends</h3>
          <p className="text-sm text-gray-600 text-center leading-tight">
            Connect with friends<br />
            and share music
          </p>
        </div>
      </div>
    );
  }

  if (isInSettingsView) {
    if (hoveredSettingsItem === 'Edit Account') {
      return (
        <div className="w-1/2 bg-gray-50">
          <AccountPreview />
        </div>
      );
    }
    
    return (
      <div className="w-1/2 bg-gray-50">
        <div className="h-full flex flex-col items-center justify-center p-4 text-center">
          <Settings size={32} className="text-gray-600 mb-3" />
          <h3 className="font-bold text-lg mb-1">Settings</h3>
          <p className="text-sm text-gray-600 text-center leading-tight">
            Configure your<br />FivePod settings
          </p>
        </div>
      </div>
    );
  }

  const selectedItem = menuItems[selectedMenuItem];
  
  const renderContent = () => {
    switch (selectedItem) {
      case 'The Daily Drop':
        return (
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
        );
      case 'Friends':
        if (isSignedIn) {
          return (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
              <Users size={32} className="text-gray-600 mb-3" />
              <h3 className="font-bold text-lg mb-1">Friends</h3>
              <p className="text-sm text-gray-600 text-center leading-tight">
                Connect with friends<br />
                and share music
              </p>
            </div>
          );
        }
        return <FriendsScreen />;
      case 'Settings':
        if (isSignedIn) {
          return (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
              <Settings size={32} className="text-gray-600 mb-3" />
              <h3 className="font-bold text-lg mb-1">Settings</h3>
              <p className="text-sm text-gray-600 text-center leading-tight">
                Configure your<br />FivePod settings
              </p>
            </div>
          );
        }
        return <SettingsScreen />;
      case 'My Five':
        return <MyFivePreview />;
      case 'Edit My Five':
        return (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <Music size={32} className="text-blue-600 mb-3" />
            <h3 className="font-bold text-lg mb-1">Edit</h3>
            <p className="text-sm text-gray-600 text-center leading-tight">
              Add or change what you<br />
              have on repeat currently
            </p>
          </div>
        );
      case 'Share Profile':
        return (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <Share size={32} className="text-green-600 mb-3" />
            <h3 className="font-bold text-lg mb-1">Share</h3>
            <p className="text-sm text-gray-600 text-center leading-tight">
              Share your five<br />
              with friends
            </p>
          </div>
        );
      case 'Sign In':
        return (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <User size={32} className="text-gray-600 mb-3" />
            <h3 className="font-bold text-lg mb-1">Sign In</h3>
            <p className="text-sm text-gray-600 leading-tight">
              Create an account<br />
              to get started
            </p>
          </div>
        );
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-purple-600 rounded-md"></div>
              </div>
            </div>
            <h3 className="font-bold text-lg mb-1">FivePod</h3>
            <p className="text-sm text-gray-600 text-center leading-tight">
              Your interpersonal<br />music player
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-1/2 bg-gray-50">
      {renderContent()}
    </div>
  );
};

export default ContentPanel;
