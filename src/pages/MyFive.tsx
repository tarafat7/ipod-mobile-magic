
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
      console.log('Loading data for user ID:', userId);
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    console.log('Starting to load user data...');
    setIsLoading(true);
    
    try {
      // Load both profile and songs in parallel
      const [profileResult, songsResult] = await Promise.all([
        loadUserProfile(),
        loadUserSongs()
      ]);
      
      console.log('Data loading completed:', { profile: profileResult, songs: songsResult });
    } catch (error) {
      console.error('Error loading data:', error);
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

  const loadUserProfile = async () => {
    try {
      console.log('Loading profile for user:', userId);
      // Make this completely public - no authentication required
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return null;
      } else {
        console.log('Loaded shared profile:', data);
        setProfile(data);
        return data;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  };

  const loadUserSongs = async () => {
    try {
      console.log('Loading songs for user:', userId);
      // Make this completely public - no authentication required
      const { data, error } = await supabase
        .from('user_five_songs')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error loading songs:', error);
        return [];
      }

      if (data) {
        const songUrls = [
          data.song_1,
          data.song_2,
          data.song_3,
          data.song_4,
          data.song_5
        ].filter(Boolean);

        console.log('Found song URLs:', songUrls);

        const addedDate = formatDate(data.created_at);

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
        return validSongs;
      }
      
      return [];
    } catch (error) {
      console.error('Error loading user songs:', error);
      return [];
    }
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

  // Pass the loaded data to the iPod component
  return <IPod sharedUserProfile={profile} sharedUserSongs={songs} />;
};

export default MyFive;
