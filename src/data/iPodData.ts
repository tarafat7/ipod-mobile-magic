import { Song } from '../types/iPod';
import { supabase } from '../integrations/supabase/client';

export const getMenuItems = async (): Promise<string[]> => {
  // Always show all menu items regardless of sign-in status
  return [
    'My Five',
    'Edit My Five', 
    'Friends',
    'Share Profile',
    'Settings',
    'Sign In',
    'About'
  ];
};

export const menuItems = [
  'Sign In',
  'Friends', 
  'Settings'
];

export const songs: Song[] = [
  { id: 1, title: 'Bohemian Rhapsody', artist: 'Queen', duration: '5:55' },
  { id: 2, title: 'Hotel California', artist: 'Eagles', duration: '6:30' },
  { id: 3, title: 'Stairway to Heaven', artist: 'Led Zeppelin', duration: '8:02' },
  { id: 4, title: 'Sweet Child O Mine', artist: 'Guns N Roses', duration: '5:03' },
  { id: 5, title: 'Imagine', artist: 'John Lennon', duration: '3:07' }
];
