
export interface MenuPanelProps {
  menuItems: string[];
  selectedMenuItem: number;
  isInSettingsView: boolean;
  isSignedIn: boolean;
  selectedSettingsItem: number;
  onSettingsClick: () => void;
  onSettingsAction: (action: string) => void;
  onMenuItemClick: (index: number) => void;
  onSettingsItemClick: (index: number) => void;
  onSettingsItemHover?: (item: string | null) => void;
  isSharedView?: boolean;
  isInFriendsView?: boolean;
  selectedFriendsItem?: number;
  onFriendsClick?: () => void;
  onFriendsAction?: (action: string) => void;
  onFriendsItemClick?: (index: number) => void;
  onFriendsItemHover?: (item: string | null) => void;
  isInFriendsListView?: boolean;
  selectedFriendsListItem?: number;
  onFriendsListItemClick?: (index: number) => void;
  onFriendsListItemHover?: (friend: any) => void;
  friendsList?: any[];
  isInDailyDropView?: boolean;
  selectedDailyDropItem?: number;
  onDailyDropClick?: () => void;
  onDailyDropItemClick?: (index: number) => void;
  onDailyDropItemHover?: (item: string | null) => void;
}
