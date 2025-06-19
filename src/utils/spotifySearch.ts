
import { supabase } from '../integrations/supabase/client';
import { SpotifyTrack } from '../types/spotify';

export const searchSpotifyTracks = async (query: string): Promise<SpotifyTrack[]> => {
  if (!query.trim()) {
    return [];
  }

  try {
    const { data, error } = await supabase.functions.invoke('spotify-search', {
      body: { query },
    });

    if (error) {
      console.error('Spotify search error:', error);
      return [];
    }

    return data.tracks || [];
  } catch (error) {
    console.error('Error calling spotify-search:', error);
    return [];
  }
};

export const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
