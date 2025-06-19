
import { Song } from '../types/iPod';
import { supabase } from '../integrations/supabase/client';

export const songs: Song[] = [
  {
    title: "Song 1",
    artist: "Artist 1",
    duration: "3:45",
    albumArt: "/placeholder.svg"
  },
  {
    title: "Song 2", 
    artist: "Artist 2",
    duration: "4:20",
    albumArt: "/placeholder.svg"
  },
  {
    title: "Song 3",
    artist: "Artist 3", 
    duration: "2:55",
    albumArt: "/placeholder.svg"
  },
  {
    title: "Song 4",
    artist: "Artist 4",
    duration: "3:12",
    albumArt: "/placeholder.svg"
  },
  {
    title: "Song 5",
    artist: "Artist 5",
    duration: "4:01",
    albumArt: "/placeholder.svg"
  }
];

export const getMenuItems = async (): Promise<string[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    return ['My Five', 'Edit My Five', 'Friends', 'Settings'];
  } else {
    return ['Sign In', 'My Five'];
  }
};
