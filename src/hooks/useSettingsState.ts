
import { useState } from 'react';

export const useSettingsState = () => {
  const [isInSettingsView, setIsInSettingsView] = useState(false);
  const [selectedSettingsItem, setSelectedSettingsItem] = useState(0);
  const [hoveredSettingsItem, setHoveredSettingsItem] = useState<string | null>(null);

  const enterSettingsView = () => {
    setIsInSettingsView(true);
    setSelectedSettingsItem(0);
  };

  const exitSettingsView = () => {
    setIsInSettingsView(false);
    setSelectedSettingsItem(0);
  };

  const handleSettingsItemChange = (index: number) => {
    setSelectedSettingsItem(index);
  };

  const handleSettingsItemHover = (item: string | null) => {
    setHoveredSettingsItem(item);
  };

  return {
    isInSettingsView,
    selectedSettingsItem,
    hoveredSettingsItem,
    enterSettingsView,
    exitSettingsView,
    handleSettingsItemChange,
    handleSettingsItemHover,
    setIsInSettingsView,
    setSelectedSettingsItem
  };
};
