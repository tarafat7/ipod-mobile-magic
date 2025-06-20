
export const songs = [
  { id: 1, title: "Blinding Lights", artist: "The Weeknd", duration: "3:20" },
  { id: 2, title: "Watermelon Sugar", artist: "Harry Styles", duration: "2:54" },
  { id: 3, title: "Levitating", artist: "Dua Lipa", duration: "3:23" },
  { id: 4, title: "Good 4 U", artist: "Olivia Rodrigo", duration: "2:58" },
  { id: 5, title: "Stay", artist: "The Kid LAROI & Justin Bieber", duration: "2:21" }
];

export const getMenuItems = async (): Promise<string[]> => {
  const { supabase } = await import('../integrations/supabase/client');
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Signed in menu
      return ['My Five', 'Friends', 'Share Profile', 'Settings', 'About'];
    } else {
      // Not signed in menu - show all options but they'll handle auth appropriately
      return ['Sign In', 'My Five', 'Friends', 'Share Profile', 'Settings', 'About'];
    }
  } catch (error) {
    console.error('Error checking auth session:', error);
    return ['Sign In', 'My Five', 'Friends', 'Share Profile', 'Settings', 'About'];
  }
};
