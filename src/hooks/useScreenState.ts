
import { useState } from 'react';

export const useScreenState = () => {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [selectedMenuItem, setSelectedMenuItem] = useState(0);
  const [menuItems, setMenuItems] = useState<string[]>([]);

  return {
    currentScreen,
    setCurrentScreen,
    selectedMenuItem,
    setSelectedMenuItem,
    menuItems,
    setMenuItems
  };
};
