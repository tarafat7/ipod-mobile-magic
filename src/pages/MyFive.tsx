
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import IPod from '../components/iPod';

interface SpotifyTrackInfo {
  name: string;
  artist: string;
  albumArt: string;
  spotifyUrl: string;
  addedDate: string;
}

interface UserProfile {
  full_name: string | null;
}

const MyFive: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [songs, setSongs] = useState<SpotifyTrackInfo[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      console.log('Loading shared data for user ID:', userId);
      loadSharedData();
    }
  }, [userId]);

  const loadSharedData = async () => {
    console.log('Starting to load shared user data...');
    setIsLoading(true);
    
    try {
      // Load profile data
      console.log('Loading profile for user:', userId);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading user profile:', profileError);
      } else {
        console.log('Loaded shared profile:', profileData);
        setProfile(profileData);
      }

      // Load songs data - this will work for both authenticated and unauthenticated users
      console.log('Loading songs for user:', userId);
      const { data: songsData, error: songsError } = await supabase
        .from('user_five_songs')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (songsError) {
        console.error('Error loading songs:', songsError);
      } else if (songsData) {
        console.log('Raw songs data:', songsData);
        
        const songUrls = [
          songsData.song_1,
          songsData.song_2,
          songsData.song_3,
          songsData.song_4,
          songsData.song_5
        ].filter(Boolean);

        console.log('Found song URLs:', songUrls);

        if (songUrls.length > 0) {
          const addedDate = formatDate(songsData.created_at);
          const songInfoPromises = songUrls.map(async (url) => {
            const trackId = extractSpotifyTrackId(url);
            if (trackId) {
              return await fetchSpotifyTrackInfo(trackId, addedDate);
            }
            return null;
          });

          const songInfos = await Promise.all(songInfoPromises);
          const validSongs = songInfos.filter((song): song is SpotifyTrackInfo => song !== null);
          
          console.log('Processed songs:', validSongs);
          setSongs(validSongs);
        }
      }
    } catch (error) {
      console.error('Error loading shared data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractSpotifyTrackId = (url: string): string | null => {
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const fetchSpotifyTrackInfo = async (trackId: string, addedDate: string): Promise<SpotifyTrackInfo | null> => {
    try {
      const response = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/track/${trackId}`);
      const data = await response.json();
      
      if (data && data.title) {
        const titleParts = data.title.split(' by ');
        const songName = titleParts[0] || 'Unknown Song';
        const artistName = titleParts[1] || '';
        
        return {
          name: songName,
          artist: artistName,
          albumArt: data.thumbnail_url || '',
          spotifyUrl: `https://open.spotify.com/track/${trackId}`,
          addedDate
        };
      }
    } catch (error) {
      console.error('Error fetching Spotify track info:', error);
    }
    return null;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading shared songs...</p>
        </div>
      </div>
    );
  }

  // Pass the loaded data to the iPod component with shared view enabled
  return <IPod sharedUserProfile={profile} sharedUserSongs={songs} />;
};

export default MyFive;
