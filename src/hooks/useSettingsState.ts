
import { useState } from 'react';

export const useSettingsState = () => {
  const [isInSettingsView, setIsInSettingsView] = useState(false);
  const [selectedSettingsItem, setSelectedSettingsItem] = useState(0);

  return {
    isInSettingsView,
    setIsInSettingsView,
    selectedSettingsItem,
    setSelectedSettingsItem
  };
};
