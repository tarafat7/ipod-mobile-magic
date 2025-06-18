
import { Song } from '../types/iPod';

export const getMenuItems = () => {
  const userData = localStorage.getItem('ipod_user');
  const isSignedIn = !!userData;
  
  return [
    isSignedIn ? 'My Five' : 'Sign In',
    'Friends', 
    'Settings'
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
