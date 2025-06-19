
export const extractSpotifyTrackId = (url: string): string | null => {
  const match = url.match(/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
};

export const fetchSpotifyTrackInfo = async (trackId: string, addedDate: string) => {
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

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};
