
export interface MenuScreenState {
  menuItems: string[];
  isSignedIn: boolean;
  showSettingsMenu: boolean;
  isInSettingsView: boolean;
  selectedSettingsItem: number;
  showDailyDropMenu: boolean;
  isInDailyDropView: boolean;
  selectedDailyDropItem: number;
}

export const settingsMenuItems = [
  'Share Profile',
  'Edit Account', 
  'Edit My Five',
  'Logout',
  'Delete Account'
];

export const dailyDropMenuItems = [
  "Today's Prompt",
  'Add a Song',
  'View Today\'s Playlist'
];
